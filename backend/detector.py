"""
detector.py — YOLOv8 person detection + optical flow calculation.

- Loads yolov8n.pt on startup (auto-downloads if missing).
- Accepts a video frame (numpy array).
- Returns bounding-box detections filtered to class 0 (person).
- Computes Farneback optical flow on a 5×4 grid and returns
  direction arrows with magnitude.
"""

import math
import numpy as np
import cv2

# ── YOLOv8 model (lazy-loaded) ──────────────────────────────────────
_model = None


def _get_model():
    """Load YOLOv8 nano model once, downloading automatically."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        print("[detector] Loading YOLOv8n model (will download on first run)…")
        _model = YOLO("yolov8n.pt")
        print("[detector] Model loaded ✓")
    return _model


# ── Person detection ────────────────────────────────────────────────

def detect_persons(frame: np.ndarray, conf: float = 0.25, imgsz: int = 640) -> dict:
    """
    Run YOLOv8 inference on *frame* and return only person detections.

    Returns
    -------
    {
        "detections": [{ "x1", "y1", "x2", "y2", "confidence" }, …],
        "total_count": int,
    }
    """
    model = _get_model()
    results = model(frame, verbose=False, classes=[0], conf=conf, imgsz=imgsz)  # class 0 = person

    detections = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            detections.append({
                "x1": int(x1),
                "y1": int(y1),
                "x2": int(x2),
                "y2": int(y2),
                "confidence": round(conf, 2),
            })

    return {"detections": detections, "total_count": len(detections)}


def _zone_color(cx: int, cy: int, w: int, h: int) -> tuple:
    """Return BGR color based on which zone the centre falls in."""
    mid_x, mid_y = w // 2, h // 2
    if cy < mid_y:
        return (0, 255, 0) if cx < mid_x else (0, 255, 255)      # A=green, B=yellow
    else:
        return (0, 165, 255) if cx < mid_x else (0, 0, 255)       # C=orange, D=red


def draw_boxes(frame: np.ndarray, detections: list) -> np.ndarray:
    """Draw zone-colored bounding boxes + confidence labels on *frame* (in-place)."""
    h, w = frame.shape[:2]

    for det in detections:
        x1, y1, x2, y2 = int(det["x1"]), int(det["y1"]), int(det["x2"]), int(det["y2"])
        conf = det["confidence"]
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        color = _zone_color(cx, cy, w, h)

        # Draw rectangle
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        # Draw confidence label with filled background
        label = f"Person {conf:.2f}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
        cv2.putText(frame, label, (x1 + 2, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

    # Draw zone divider lines
    cv2.line(frame, (w // 2, 0), (w // 2, h), (100, 100, 100), 1)
    cv2.line(frame, (0, h // 2), (w, h // 2), (100, 100, 100), 1)

    # Label each zone
    cv2.putText(frame, "Zone A", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
    cv2.putText(frame, "Zone B", (w // 2 + 10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
    cv2.putText(frame, "Zone C", (10, h // 2 + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
    cv2.putText(frame, "Zone D", (w // 2 + 10, h // 2 + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)

    return frame


# ── Optical flow ────────────────────────────────────────────────────

_prev_gray = None

# Direction arrows indexed by octant (0 = right, counter-clockwise)
_ARROWS = ["→", "↗", "↑", "↖", "←", "↙", "↓", "↘"]


def compute_optical_flow(frame: np.ndarray) -> dict:
    """
    Compute dense optical flow (Farneback) between the previous frame
    and the current frame.  Sample on a 5×4 grid and return direction
    arrows with magnitude.

    Returns
    -------
    {
        "flow_vectors": [["→", "↗", …], …],   # 4 rows × 5 cols
        "flow_magnitudes": [[0.8, 1.2, …], …], # normalised 0-1
    }
    """
    global _prev_gray

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rows, cols = 4, 5

    if _prev_gray is None or _prev_gray.shape != gray.shape:
        _prev_gray = gray
        # Return neutral arrows on the very first frame
        return {
            "flow_vectors": [["→"] * cols for _ in range(rows)],
            "flow_magnitudes": [[0.0] * cols for _ in range(rows)],
        }

    flow = cv2.calcOpticalFlowFarneback(
        _prev_gray, gray, None,
        pyr_scale=0.5, levels=3, winsize=15,
        iterations=3, poly_n=5, poly_sigma=1.2, flags=0,
    )
    _prev_gray = gray

    h, w = gray.shape
    step_y, step_x = h // rows, w // cols

    vectors: list[list[str]] = []
    magnitudes: list[list[float]] = []
    max_mag = 1e-6  # avoid division by zero

    raw: list[list[tuple[float, float]]] = []
    for r in range(rows):
        row_v: list[tuple[float, float]] = []
        cy = step_y * r + step_y // 2
        for c in range(cols):
            cx = step_x * c + step_x // 2
            fx, fy = float(flow[cy, cx, 0]), float(flow[cy, cx, 1])
            mag = math.hypot(fx, fy)
            if mag > max_mag:
                max_mag = mag
            row_v.append((fx, fy))
        raw.append(row_v)

    for r in range(rows):
        row_arrows: list[str] = []
        row_mags: list[float] = []
        for c in range(cols):
            fx, fy = raw[r][c]
            mag = math.hypot(fx, fy)
            norm_mag = round(min(mag / max_mag, 1.0), 2)

            if mag < 0.3:
                arrow = "·"
            else:
                angle = math.atan2(-fy, fx)  # y is inverted in image coords
                octant = int(round(angle / (math.pi / 4))) % 8
                arrow = _ARROWS[octant]

            row_arrows.append(arrow)
            row_mags.append(norm_mag)
        vectors.append(row_arrows)
        magnitudes.append(row_mags)

    return {"flow_vectors": vectors, "flow_magnitudes": magnitudes}


# ── Mock data fallback ──────────────────────────────────────────────

import random
import time

_mock_base_count = 18
_mock_t = 0


def generate_mock_detections(width: int = 640, height: int = 480) -> dict:
    """Generate realistic-looking mock detections when no webcam is available."""
    global _mock_t
    _mock_t += 1

    # Vary count with sine wave + noise
    count = max(2, int(_mock_base_count + 8 * math.sin(_mock_t / 15) + random.randint(-3, 3)))

    detections = []
    for _ in range(count):
        cx = random.randint(40, width - 40)
        cy = random.randint(40, height - 40)
        bw = random.randint(30, 55)
        bh = random.randint(70, 110)
        detections.append({
            "x1": cx - bw // 2,
            "y1": cy - bh // 2,
            "x2": cx + bw // 2,
            "y2": cy + bh // 2,
            "confidence": round(random.uniform(0.55, 0.97), 2),
        })

    return {"detections": detections, "total_count": count}


def generate_mock_flow() -> dict:
    """Generate mock optical-flow arrows."""
    rows, cols = 4, 5
    arrows = _ARROWS + ["·"]
    vectors = [[random.choice(arrows) for _ in range(cols)] for _ in range(rows)]
    magnitudes = [[round(random.uniform(0.0, 1.0), 2) for _ in range(cols)] for _ in range(rows)]
    return {"flow_vectors": vectors, "flow_magnitudes": magnitudes}
