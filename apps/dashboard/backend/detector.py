"""
detector.py — YOLOv8 person detection + head detection + optical flow.

- Loads yolov8m.pt on startup (auto-downloads if missing).
- Uses OpenCV cascade classifiers as head detector for occluded crowds.
- Merges person + head detections, avoiding double counting.
- Computes Farneback optical flow on a 5×4 grid.
"""

import math
import random
import time
import numpy as np
import cv2

# ── YOLOv8 model (lazy-loaded) ──────────────────────────────────────
_model = None


def _get_model():
    """Load YOLOv8 medium model once, downloading automatically."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        print("[detector] Loading YOLOv8m model (will download on first run)…")
        _model = YOLO("yolov8m.pt")
        print("[detector] Model loaded ✓")
    return _model


# ── Head detection cascades ─────────────────────────────────────────
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)
profile_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_profileface.xml'
)


# ── Person detection ────────────────────────────────────────────────

def detect_persons(frame: np.ndarray, conf: float = 0.4, imgsz: int = 640) -> list:
    """
    Run YOLOv8m inference on *frame* and return only person detections.
    Returns a list of detection dicts.
    """
    model = _get_model()
    results = model(
        frame,
        conf=conf,
        iou=0.35,
        classes=[0],
        verbose=False,
        max_det=100,
        imgsz=imgsz,
    )

    detections = []
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        c = float(box.conf[0])
        detections.append({
            "x1": int(x1),
            "y1": int(y1),
            "x2": int(x2),
            "y2": int(y2),
            "confidence": round(c, 2),
            "type": "person",
        })
    return detections


# ── Head detection ──────────────────────────────────────────────────

def detect_heads(frame: np.ndarray) -> list:
    """Detect heads using cascade classifiers — works for occluded people."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    # Detect frontal faces
    frontal = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=3,
        minSize=(15, 15),
        maxSize=(120, 120),
    )

    # Detect profile faces
    profile = profile_cascade.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=3,
        minSize=(15, 15),
        maxSize=(120, 120),
    )

    heads = []
    for (x, y, w, h) in (frontal if len(frontal) > 0 else []):
        heads.append({
            "x1": int(x), "y1": int(y),
            "x2": int(x + w), "y2": int(y + h),
            "confidence": 0.75,
            "type": "head",
        })
    for (x, y, w, h) in (profile if len(profile) > 0 else []):
        heads.append({
            "x1": int(x), "y1": int(y),
            "x2": int(x + w), "y2": int(y + h),
            "confidence": 0.65,
            "type": "head",
        })
    return heads


# ── Deduplication ───────────────────────────────────────────────────

def is_head_inside_person(head: dict, persons: list, iou_threshold: float = 0.3) -> bool:
    """
    Check if a head detection overlaps with any person bounding box.
    If yes, the person is already counted — skip this head.
    """
    hx1, hy1, hx2, hy2 = head["x1"], head["y1"], head["x2"], head["y2"]

    for person in persons:
        px1, py1, px2, py2 = person["x1"], person["y1"], person["x2"], person["y2"]

        # Check if head center is inside person box
        head_cx = (hx1 + hx2) / 2
        head_cy = (hy1 + hy2) / 2
        if px1 <= head_cx <= px2 and py1 <= head_cy <= py2:
            return True

        # Also check IoU overlap
        inter_x1 = max(hx1, px1)
        inter_y1 = max(hy1, py1)
        inter_x2 = min(hx2, px2)
        inter_y2 = min(hy2, py2)
        if inter_x2 > inter_x1 and inter_y2 > inter_y1:
            inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
            head_area = (hx2 - hx1) * (hy2 - hy1)
            if head_area > 0 and (inter_area / head_area) > iou_threshold:
                return True
    return False


# ── Zone color helper ───────────────────────────────────────────────

def _zone_color(cx: int, cy: int, w: int, h: int) -> tuple:
    """Return BGR color based on which zone the centre falls in."""
    mid_x, mid_y = w // 2, h // 2
    if cy < mid_y:
        return (0, 255, 0) if cx < mid_x else (0, 255, 255)      # A=green, B=yellow
    else:
        return (0, 165, 255) if cx < mid_x else (0, 0, 255)       # C=orange, D=red


# ── Drawing ─────────────────────────────────────────────────────────

def draw_boxes(frame: np.ndarray, detections: list) -> np.ndarray:
    """Draw zone-colored bounding boxes on *frame* (in-place).
    Person = rectangle, Head = circle."""
    h, w = frame.shape[:2]

    for det in detections:
        x1, y1, x2, y2 = int(det["x1"]), int(det["y1"]), int(det["x2"]), int(det["y2"])
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
        color = _zone_color(cx, cy, w, h)

        if det.get("type", "person") == "person":
            # Solid rectangle for full person
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            conf = det["confidence"]
            label = f"Person {conf:.2f}"
            (tw, th_t), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(frame, (x1, y1 - th_t - 6), (x1 + tw + 4, y1), color, -1)
            cv2.putText(frame, label, (x1 + 2, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
        else:
            # Circle for head-only detection (distinguishes from person boxes)
            radius = max((x2 - x1) // 2, 8)
            cv2.circle(frame, (cx, cy), radius, (255, 165, 0), 2)
            label = f"Head {det['confidence']:.2f}"
            cv2.putText(frame, label, (cx - radius, cy - radius - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 165, 0), 1, cv2.LINE_AA)

    # Draw zone divider lines
    cv2.line(frame, (w // 2, 0), (w // 2, h), (100, 100, 100), 1)
    cv2.line(frame, (0, h // 2), (w, h // 2), (100, 100, 100), 1)

    # Label each zone
    cv2.putText(frame, "Zone A", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
    cv2.putText(frame, "Zone B", (w // 2 + 10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
    cv2.putText(frame, "Zone C", (10, h // 2 + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
    cv2.putText(frame, "Zone D", (w // 2 + 10, h // 2 + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)

    return frame


# ── Main detect function ────────────────────────────────────────────

def detect(frame: np.ndarray, conf: float = 0.4, imgsz: int = 640) -> dict:
    """
    Main detection function.
    Returns merged detections: persons + uncounted heads.
    This avoids double counting.
    """
    # Run both detectors
    persons = detect_persons(frame, conf=conf, imgsz=imgsz)
    heads = detect_heads(frame)

    # Only add heads that are NOT already inside a person box
    extra_heads = [
        head for head in heads
        if not is_head_inside_person(head, persons)
    ]

    # Merge: all persons + only uncounted heads
    all_detections = persons + extra_heads

    return {
        "detections": all_detections,
        "total_count": len(all_detections),
        "person_count": len(persons),
        "head_count": len(extra_heads),
    }


# ── Optical flow ────────────────────────────────────────────────────

_prev_gray = None

# Direction arrows indexed by octant (0 = right, counter-clockwise)
_ARROWS = ["→", "↗", "↑", "↖", "←", "↙", "↓", "↘"]


def compute_optical_flow(frame: np.ndarray) -> dict:
    """
    Compute dense optical flow (Farneback) between the previous frame
    and the current frame.  Sample on a 5×4 grid and return direction
    arrows with magnitude.
    """
    global _prev_gray

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rows, cols = 4, 5

    if _prev_gray is None or _prev_gray.shape != gray.shape:
        _prev_gray = gray
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
    max_mag = 1e-6

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
                angle = math.atan2(-fy, fx)
                octant = int(round(angle / (math.pi / 4))) % 8
                arrow = _ARROWS[octant]

            row_arrows.append(arrow)
            row_mags.append(norm_mag)
        vectors.append(row_arrows)
        magnitudes.append(row_mags)

    return {"flow_vectors": vectors, "flow_magnitudes": magnitudes}


# ── Mock data fallback ──────────────────────────────────────────────

_mock_base_count = 18
_mock_t = 0


def generate_mock_detections(width: int = 640, height: int = 480) -> dict:
    """Generate realistic-looking mock detections when no webcam is available."""
    global _mock_t
    _mock_t += 1

    # Vary count with sine wave + noise
    count = max(2, int(_mock_base_count + 8 * math.sin(_mock_t / 15) + random.randint(-3, 3)))

    # Split into persons and heads for mock mode
    person_count = max(1, int(count * 0.75))
    head_count = count - person_count

    detections = []
    for _ in range(person_count):
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
            "type": "person",
        })
    for _ in range(head_count):
        cx = random.randint(40, width - 40)
        cy = random.randint(20, height // 2)
        bw = random.randint(15, 30)
        bh = random.randint(15, 30)
        detections.append({
            "x1": cx - bw // 2,
            "y1": cy - bh // 2,
            "x2": cx + bw // 2,
            "y2": cy + bh // 2,
            "confidence": round(random.uniform(0.60, 0.80), 2),
            "type": "head",
        })

    return {
        "detections": detections,
        "total_count": count,
        "person_count": person_count,
        "head_count": head_count,
    }


def generate_mock_flow() -> dict:
    """Generate mock optical-flow arrows."""
    rows, cols = 4, 5
    arrows = _ARROWS + ["·"]
    vectors = [[random.choice(arrows) for _ in range(cols)] for _ in range(rows)]
    magnitudes = [[round(random.uniform(0.0, 1.0), 2) for _ in range(cols)] for _ in range(rows)]
    return {"flow_vectors": vectors, "flow_magnitudes": magnitudes}
