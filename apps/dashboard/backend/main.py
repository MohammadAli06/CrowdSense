"""
main.py — FastAPI server for CrowdSense.

Endpoints
---------
GET  /          Health check.
WS   /ws        Real-time crowd data stream (WebSocket).
GET  /snapshot   Single processed frame as JPEG.
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import time
import traceback

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from detector import (
    detect,
    detect_persons,
    draw_boxes,
    compute_optical_flow,
    generate_mock_detections,
    generate_mock_flow,
)
from zone_manager import calculate_zones
from alert_manager import AlertManager
from auth import auth_router
from database import connect as db_connect, disconnect as db_disconnect

# ── App setup ───────────────────────────────────────────────────────

app = FastAPI(title="CrowdSense Backend")

# ── Lifecycle ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    try:
        await db_connect()
    except Exception as e:
        print(f"[DB] Warning: could not connect to MongoDB ({e}). Auth will not work.")

@app.on_event("shutdown")
async def shutdown():
    await db_disconnect()

# ── Routers ──────────────────────────────────────────────────────────

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Shared state ────────────────────────────────────────────────────

_crowd_history: list[int] = []
_MAX_HISTORY = 60

app_state = {
    "mode": "webcam",          # "webcam" | "demo" | "synthetic" | "image"
    "demo_video_path": None,
    "image_frame": None,       # stores the numpy array of uploaded image
}

_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}


def _append_history(count: int):
    _crowd_history.append(count)
    if len(_crowd_history) > _MAX_HISTORY:
        _crowd_history.pop(0)


# ── Health check ────────────────────────────────────────────────────

@app.get("/")
async def health():
    return {"status": "CrowdSense backend running"}


# ── Mode switching endpoints ────────────────────────────────────────

@app.post("/set-mode")
async def set_mode(mode: str, video_path: str = None):
    """Switch input source: webcam, demo, or synthetic."""
    app_state["mode"] = mode
    if video_path:
        app_state["demo_video_path"] = video_path
    return {"status": "ok", "mode": mode}


@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads", exist_ok=True)
        path = f"uploads/{file.filename}"

        # Save file to disk
        contents = await file.read()
        with open(path, "wb") as f:
            f.write(contents)

        # Detect if image or video by extension
        image_exts = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
        video_exts = {'.mp4', '.avi', '.mov', '.mkv', '.webm'}
        ext = os.path.splitext(file.filename)[1].lower()

        if ext in image_exts:
            # Read image with OpenCV
            img_array = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            if img is None:
                return {"status": "error", "message": "Could not read image"}
            # Resize to standard size
            img = cv2.resize(img, (640, 480))
            app_state["mode"] = "image"
            app_state["image_frame"] = img
            app_state["demo_video_path"] = None
            return {"status": "ok", "mode": "image", "filename": file.filename}

        elif ext in video_exts:
            app_state["mode"] = "demo"
            app_state["demo_video_path"] = path
            app_state["image_frame"] = None
            return {"status": "ok", "mode": "video", "filename": file.filename}

        else:
            return {"status": "error", "message": f"Unsupported file type: {ext}"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/bundled-demo")
async def bundled_demo():
    """Switch to synthetic crowd-demo mode (no video file needed)."""
    app_state["mode"] = "synthetic"
    return {"status": "ok", "message": "Synthetic crowd demo started"}


# ── Snapshot endpoint ───────────────────────────────────────────────

@app.get("/snapshot")
async def snapshot():
    """Return a single processed frame as JPEG image (or mock placeholder)."""
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        ret, frame = cap.read()
        cap.release()
        if ret:
            result = detect_persons(frame)
            frame = draw_boxes(frame, result["detections"])
            _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            return Response(content=buf.tobytes(), media_type="image/jpeg")

    # No webcam — return a dark placeholder
    placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(placeholder, "No Camera — Mock Mode", (120, 240),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (100, 200, 255), 2)
    _, buf = cv2.imencode(".jpg", placeholder)
    return Response(content=buf.tobytes(), media_type="image/jpeg")


# ── WebSocket stream ────────────────────────────────────────────────

@app.websocket("/ws")
async def ws_stream(websocket: WebSocket):
    import random as _rand

    await websocket.accept()

    alert_mgr = AlertManager()
    cap = None

    try:
        while True:
            frame = None

            if app_state["mode"] == "image" and app_state["image_frame"] is not None:
                # Static image — copy it fresh every iteration
                frame = app_state["image_frame"].copy()
                ret = True

            elif app_state["mode"] == "demo" and app_state["demo_video_path"]:
                # Video file — open if not already open or path changed
                if cap is None or not cap.isOpened():
                    cap = cv2.VideoCapture(app_state["demo_video_path"])
                ret, frame = cap.read()
                if not ret:
                    # Loop video back to start
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = cap.read()
                if frame is not None:
                    frame = cv2.resize(frame, (640, 480))

            elif app_state["mode"] == "synthetic":
                # Generate synthetic crowd frame
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                frame[:] = (25, 28, 36)
                ret = True

            else:
                # Webcam mode
                if cap is None or not cap.isOpened():
                    cap = cv2.VideoCapture(0)
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    cap.set(cv2.CAP_PROP_FPS, 15)
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                ret, frame = cap.read()

            if frame is None:
                await asyncio.sleep(0.1)
                continue

            # ── Run detection on frame ──────────────────────────────
            if app_state["mode"] == "synthetic":
                # Synthetic mode — generate mock detections
                n_persons = _rand.randint(15, 30)
                detections = []
                for _ in range(n_persons):
                    x1 = _rand.randint(0, 580)
                    y1 = _rand.randint(0, 420)
                    x2 = x1 + _rand.randint(30, 60)
                    y2 = y1 + _rand.randint(60, 120)
                    detections.append({
                        "x1": x1, "y1": y1,
                        "x2": min(x2, 639), "y2": min(y2, 479),
                        "confidence": round(_rand.uniform(0.6, 0.95), 2),
                        "type": "person",
                    })
                total_count = len(detections)
                person_count = total_count
                head_count = 0
                flow = generate_mock_flow()
            elif cap is None or not cap.isOpened():
                # Mock fallback
                result = generate_mock_detections(640, 480)
                detections = result["detections"]
                total_count = result["total_count"]
                person_count = result["person_count"]
                head_count = result["head_count"]
                flow = generate_mock_flow()
            else:
                # Real detection
                result = detect(frame)
                detections = result["detections"]
                total_count = result["total_count"]
                person_count = result["person_count"]
                head_count = result["head_count"]
                flow = compute_optical_flow(frame)

            # ── Draw boxes ──────────────────────────────────────────
            annotated = draw_boxes(frame.copy(), detections)

            # Add mode indicator if needed
            if app_state["mode"] == "synthetic":
                cv2.putText(annotated, "SYNTHETIC DEMO", (220, 470),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 200, 255), 1)
            elif app_state["mode"] == "image":
                cv2.putText(annotated, "IMAGE MODE", (220, 470),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 200, 255), 1)

            # ── Zone calculation ────────────────────────────────────
            zone_data = calculate_zones(detections, 640, 480)

            # ── Alerts ──────────────────────────────────────────────
            alerts = alert_mgr.update(zone_data["zones"], total_count)

            # ── History ─────────────────────────────────────────────
            _append_history(total_count)

            # ── Encode frame as base64 JPEG ─────────────────────────
            _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_b64 = base64.b64encode(buf.tobytes()).decode("utf-8")

            # ── Build payload ───────────────────────────────────────
            payload = {
                "frame": frame_b64,
                "total_count": total_count,
                "person_count": person_count,
                "head_count": head_count,
                "detection_mode": f"{person_count} bodies + {head_count} heads",
                "zones": zone_data["zones"],
                "heatmap": zone_data["heatmap"],
                "alerts": alerts,
                "crowd_history": list(_crowd_history),
                "flow_vectors": flow["flow_vectors"],
                "flow_magnitudes": flow["flow_magnitudes"],
                "mock_mode": app_state["mode"] != "webcam",
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.1)  # ~10 FPS

    except WebSocketDisconnect:
        print("[ws] Client disconnected")
    except Exception as e:
        print(f"[ws] Error: {e}")
        traceback.print_exc()
    finally:
        if cap is not None and cap.isOpened():
            cap.release()
            print("[ws] Video source released")
