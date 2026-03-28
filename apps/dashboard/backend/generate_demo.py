"""
generate_demo.py — Create a synthetic 30-second demo video.

Run:  python generate_demo.py
Output: uploads/crowd_demo.mp4
"""

import os
import cv2
import numpy as np

os.makedirs("uploads", exist_ok=True)

WIDTH, HEIGHT = 640, 480
FPS = 30
DURATION_S = 30
TOTAL_FRAMES = FPS * DURATION_S

out = cv2.VideoWriter(
    "uploads/crowd_demo.mp4",
    cv2.VideoWriter_fourcc(*"mp4v"),
    FPS,
    (WIDTH, HEIGHT),
)

print(f"Generating {DURATION_S}s synthetic crowd demo ({TOTAL_FRAMES} frames)…")

for frame_num in range(TOTAL_FRAMES):
    # Dark background with slight variation
    frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    frame[:] = (25, 28, 36)

    # Add subtle grid texture
    for y in range(0, HEIGHT, 40):
        cv2.line(frame, (0, y), (WIDTH, y), (35, 38, 46), 1)
    for x in range(0, WIDTH, 40):
        cv2.line(frame, (x, 0), (x, HEIGHT), (35, 38, 46), 1)

    # Number of people varies with sine-wave
    n = int(15 + 15 * np.sin(frame_num / 60))
    n = max(5, n)

    for _ in range(n):
        # Random person-shaped rectangle
        x = np.random.randint(10, WIDTH - 60)
        y = np.random.randint(10, HEIGHT - 90)
        w = np.random.randint(25, 50)
        h = np.random.randint(60, 100)

        # Slight movement: drift position based on frame
        drift_x = int(3 * np.sin((frame_num + x) / 30))
        drift_y = int(2 * np.cos((frame_num + y) / 25))
        x = max(0, min(x + drift_x, WIDTH - w))
        y = max(0, min(y + drift_y, HEIGHT - h))

        # Green bounding box
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 200, 0), 2)

        # Simulated head circle
        head_cx = x + w // 2
        head_cy = y + 8
        cv2.circle(frame, (head_cx, head_cy), 6, (0, 180, 0), 1)

    # Zone divider lines
    cv2.line(frame, (WIDTH // 2, 0), (WIDTH // 2, HEIGHT), (80, 80, 80), 1)
    cv2.line(frame, (0, HEIGHT // 2), (WIDTH, HEIGHT // 2), (80, 80, 80), 1)

    # Labels
    cv2.putText(frame, "SYNTHETIC CROWD DEMO", (180, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (100, 200, 255), 1)
    cv2.putText(frame, f"Frame {frame_num}/{TOTAL_FRAMES}", (10, HEIGHT - 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (80, 80, 80), 1)

    out.write(frame)

    if frame_num % 100 == 0:
        print(f"  {frame_num}/{TOTAL_FRAMES} frames written…")

out.release()
print(f"✓ Demo video created: uploads/crowd_demo.mp4 ({TOTAL_FRAMES} frames)")
