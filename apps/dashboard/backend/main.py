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
import time
import traceback

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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


# ── Camera helper ────────────────────────────────────────────────────

import os
import platform
from pathlib import Path
from dotenv import load_dotenv

# Load .env explicitly from the same directory as main.py
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# CAMERA_URL: set in .env to your CP Plus RTSP URL.
# e.g.  rtsp://admin:admin12345@152.59.98.1:554/stream1
# Leave unset to fall back to USB webcam (index 0).
CAMERA_URL: str | None = os.getenv("CAMERA_URL", None)
print(f"[camera] Loaded CAMERA_URL from .env: {CAMERA_URL}")


def _open_camera() -> cv2.VideoCapture:
    """Open the CP Plus RTSP stream ONLY — no USB webcam fallback."""
    if CAMERA_URL:
        print(f"[camera] Connecting to CP Plus RTSP stream: {CAMERA_URL}")
        cap = cv2.VideoCapture(CAMERA_URL, cv2.CAP_FFMPEG)
        if cap.isOpened():
            w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            print(f"[camera] ✓ CP Plus RTSP connected! {w}x{h} @ {fps:.1f} FPS")
        else:
            print("[camera] ✗ CP Plus RTSP connection FAILED. Check IP/credentials/network.")
            print("[camera]   URL attempted: " + CAMERA_URL)
    else:
        print("[camera] ✗ No CAMERA_URL set in .env — cannot connect to CP Plus camera.")
        cap = cv2.VideoCapture()  # empty, unopened capture

    return cap


def _append_history(count: int):
    _crowd_history.append(count)
    if len(_crowd_history) > _MAX_HISTORY:
        _crowd_history.pop(0)


# ── Health check ────────────────────────────────────────────────────

@app.get("/")
async def health():
    return {"status": "CrowdSense backend running"}


# ── Snapshot endpoint ───────────────────────────────────────────────

@app.get("/snapshot")
async def snapshot():
    """Return a single processed frame as JPEG image (or mock placeholder)."""
    cap = _open_camera()
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
    await websocket.accept()

    alert_mgr = AlertManager()
    
    # Open camera asynchronously to avoid blocking the event loop
    # on network lag or connection failures
    cap = await asyncio.to_thread(_open_camera)
    use_webcam = cap.isOpened()
    
    if use_webcam:
        print("[ws] CP Plus camera stream opened \u2713")
        # Give the stream a moment to buffer
        await asyncio.sleep(0.5)
    else:
        print("[ws] CP Plus camera NOT available \u2014 using mock data")
        cap.release()

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) if use_webcam else 640
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) if use_webcam else 480

    try:
        while True:
            # ── Read / generate frame ───────────────────────────────
            if use_webcam:
                ret, frame = await asyncio.to_thread(cap.read)
                if not ret:
                    await asyncio.sleep(0.1)
                    continue

                # Real detection
                result = await asyncio.to_thread(detect_persons, frame)
                detections = result["detections"]
                total_count = result["total_count"]

                # Draw boxes on frame for the video feed
                annotated = draw_boxes(frame.copy(), detections)

                # Optical flow
                flow = await asyncio.to_thread(compute_optical_flow, frame)
            else:
                # Mock mode
                result = generate_mock_detections(frame_width, frame_height)
                detections = result["detections"]
                total_count = result["total_count"]

                # Create a dark frame with mock boxes
                annotated = np.zeros((frame_height, frame_width, 3), dtype=np.uint8)
                # Add scan-line texture
                for y in range(0, frame_height, 4):
                    annotated[y, :] = [10, 10, 10]

                cv2.putText(annotated, "MOCK MODE — No Camera", (140, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 200, 255), 1)

                # Draw mock boxes
                for d in detections:
                    color = (0, 255, 0)
                    cv2.rectangle(annotated, (d["x1"], d["y1"]), (d["x2"], d["y2"]), color, 2)
                    cv2.putText(annotated, f'{d["confidence"]:.0%}',
                                (d["x1"], d["y1"] - 6),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)

                flow = generate_mock_flow()

            # ── Zone calculation ────────────────────────────────────
            zone_data = calculate_zones(detections, frame_width, frame_height)

            # ── Alerts ──────────────────────────────────────────────
            alerts = alert_mgr.update(zone_data["zones"], total_count)

            # ── History ─────────────────────────────────────────────
            _append_history(total_count)

            # ── Encode frame as base64 JPEG ─────────────────────────
            _, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
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
        if use_webcam:
            cap.release()
            print("[ws] CP Plus camera released")
