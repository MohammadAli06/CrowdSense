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
    detect_persons,
    draw_boxes,
    compute_optical_flow,
    generate_mock_detections,
    generate_mock_flow,
)
from zone_manager import calculate_zones
from alert_manager import AlertManager

# ── App setup ───────────────────────────────────────────────────────

app = FastAPI(title="CrowdSense Backend")

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
    """Upload a video or image file and switch to the appropriate mode."""
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())

    ext = os.path.splitext(file.filename)[1].lower()
    if ext in _IMAGE_EXTS:
        # Read it directly with OpenCV as a static frame
        img = cv2.imread(path)
        if img is None:
            return {"status": "error", "message": "Could not read image"}
        # Resize to standard feed size
        img = cv2.resize(img, (640, 480))
        app_state["mode"] = "image"
        app_state["image_frame"] = img
        return {"status": "ok", "mode": "image", "path": path}
    else:
        app_state["mode"] = "demo"
        app_state["demo_video_path"] = path
        return {"status": "ok", "mode": "demo", "path": path}


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
    use_webcam = False
    use_demo = False
    use_synthetic = False
    use_image = False
    static_frame = None

    mode = app_state["mode"]

    if mode == "image" and app_state.get("image_frame") is not None:
        static_frame = app_state["image_frame"]
        use_image = True
        print("[ws] Image loaded from app_state ✓")
    elif mode == "demo" and app_state["demo_video_path"]:
        cap = cv2.VideoCapture(app_state["demo_video_path"])
        if cap.isOpened():
            use_demo = True
            print(f"[ws] Demo video opened: {app_state['demo_video_path']} ✓")
        else:
            cap.release()
            cap = None
    elif mode == "synthetic":
        use_synthetic = True
        print("[ws] Synthetic crowd demo mode ✓")
    else:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            use_webcam = True
            print("[ws] Webcam opened ✓")
        else:
            print("[ws] No webcam detected — falling back to mock data")
            cap.release()
            cap = None

    if use_image and static_frame is not None:
        frame_height, frame_width = static_frame.shape[:2]
    elif cap and cap.isOpened():
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    else:
        frame_width, frame_height = 640, 480

    try:
        while True:
            # ── Image mode ──────────────────────────────────────────
            if use_image and static_frame is not None:
                frame = static_frame.copy()
                
                # Let YOLO internally run high-res inference on the 640x480 frame
                # It automatically maps the boxes back down to 640x480 natively.
                # Lowering conf threshold picks up tiny, distant faces in crowds.
                result = detect_persons(frame, conf=0.10, imgsz=1280)
                detections = result["detections"]
                total_count = result["total_count"]
                
                annotated = draw_boxes(frame, detections)
                flow = generate_mock_flow()

            # ── Synthetic mode ──────────────────────────────────────
            elif use_synthetic:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                frame[:] = (30, 30, 40)

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
                    })
                total_count = len(detections)
                annotated = draw_boxes(frame.copy(), detections)
                cv2.putText(annotated, "SYNTHETIC DEMO", (220, 470),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 200, 255), 1)
                flow = generate_mock_flow()
                frame_width, frame_height = 640, 480

            # ── Demo video / Webcam mode ────────────────────────────
            elif cap and cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    if use_demo:
                        # Loop the demo video
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        continue
                    else:
                        await asyncio.sleep(0.1)
                        continue

                result = detect_persons(frame)
                detections = result["detections"]
                total_count = result["total_count"]
                annotated = draw_boxes(frame.copy(), detections)
                flow = compute_optical_flow(frame)

            # ── Mock fallback ───────────────────────────────────────
            else:
                result = generate_mock_detections(frame_width, frame_height)
                detections = result["detections"]
                total_count = result["total_count"]

                annotated = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)
                for y in range(0, frame_height, 4):
                    annotated[y, :] = [10, 10, 10]

                annotated = draw_boxes(annotated, detections)
                cv2.putText(annotated, "MOCK MODE — No Camera", (140, 470),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 200, 255), 1)
                flow = generate_mock_flow()

            # ── Zone calculation ────────────────────────────────────
            zone_data = calculate_zones(detections, frame_width, frame_height)

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
                "zones": zone_data["zones"],
                "heatmap": zone_data["heatmap"],
                "alerts": alerts,
                "crowd_history": list(_crowd_history),
                "flow_vectors": flow["flow_vectors"],
                "flow_magnitudes": flow["flow_magnitudes"],
                "mock_mode": not use_webcam,
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.1)  # ~10 FPS

    except WebSocketDisconnect:
        print("[ws] Client disconnected")
    except Exception as e:
        print(f"[ws] Error: {e}")
        traceback.print_exc()
    finally:
        if cap and cap.isOpened():
            cap.release()
            print("[ws] Video source released")
