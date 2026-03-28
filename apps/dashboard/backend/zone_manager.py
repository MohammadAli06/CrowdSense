"""
zone_manager.py — Zone density calculation.

- Divides the frame into 4 named zones (A–D).
- Assigns each detection to a zone based on bounding-box centre.
- Returns per-zone counts, status badges, and a 6×4 heatmap grid.
"""

from __future__ import annotations
from typing import Any

# ── Zone geometry ───────────────────────────────────────────────────

ZONE_NAMES = ["A", "B", "C", "D"]

# Each zone is a quadrant:
#   A = top-left      B = top-right
#   C = bottom-left   D = bottom-right


def _zone_for_point(cx: int, cy: int, w: int, h: int) -> str:
    """Return the zone name for a centre point (cx, cy)."""
    mid_x, mid_y = w // 2, h // 2
    if cy < mid_y:
        return "A" if cx < mid_x else "B"
    else:
        return "C" if cx < mid_x else "D"


# ── Status thresholds ───────────────────────────────────────────────

def _status(count: int) -> str:
    if count >= 16:
        return "Critical"
    elif count >= 6:
        return "Warning"
    return "Safe"


def _status_color(status: str) -> str:
    return {"Critical": "red", "Warning": "yellow", "Safe": "green"}[status]


# ── Public API ──────────────────────────────────────────────────────

def calculate_zones(
    detections: list[dict[str, Any]],
    frame_width: int = 640,
    frame_height: int = 480,
) -> dict:
    """
    Assign detections to zones and compute density.

    Returns
    -------
    {
        "zones": {
            "A": { "count": 12, "status": "Critical", "color": "red" },
            …
        },
        "heatmap": [["low","med",…], …]   # 4 rows × 6 cols
    }
    """
    counts: dict[str, int] = {z: 0 for z in ZONE_NAMES}

    for d in detections:
        cx = (d["x1"] + d["x2"]) // 2
        cy = (d["y1"] + d["y2"]) // 2
        zone = _zone_for_point(cx, cy, frame_width, frame_height)
        counts[zone] += 1

    zones = {}
    for z in ZONE_NAMES:
        st = _status(counts[z])
        zones[z] = {
            "count": counts[z],
            "status": st,
            "color": _status_color(st),
        }

    heatmap = _generate_heatmap(detections, frame_width, frame_height)

    return {"zones": zones, "heatmap": heatmap}


# ── Heatmap (6 cols × 4 rows) ──────────────────────────────────────

_HEAT_ROWS = 4
_HEAT_COLS = 6


def _density_label(count: int) -> str:
    if count >= 4:
        return "critical"
    elif count >= 3:
        return "high"
    elif count >= 2:
        return "med"
    return "low"


def _generate_heatmap(
    detections: list[dict], w: int, h: int
) -> list[list[str]]:
    """Build a 4×6 heatmap grid of density labels."""
    cell_w = w / _HEAT_COLS
    cell_h = h / _HEAT_ROWS

    grid = [[0] * _HEAT_COLS for _ in range(_HEAT_ROWS)]

    for d in detections:
        cx = (d["x1"] + d["x2"]) / 2
        cy = (d["y1"] + d["y2"]) / 2
        col = min(int(cx / cell_w), _HEAT_COLS - 1)
        row = min(int(cy / cell_h), _HEAT_ROWS - 1)
        grid[row][col] += 1

    return [[_density_label(grid[r][c]) for c in range(_HEAT_COLS)] for r in range(_HEAT_ROWS)]
