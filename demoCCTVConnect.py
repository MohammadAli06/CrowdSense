"""
demoCCTVConnect.py — Test CP Plus IP Camera via RTSP.

CP Plus default RTSP URL formats:
  Main stream (HD):  rtsp://admin:admin12345@IP:554/stream1
  Sub  stream (SD):  rtsp://admin:admin12345@IP:554/stream2
  Older models:      rtsp://admin:admin12345@IP:554/0/av0

Change CAMERA_IP, USERNAME, and PASSWORD below to match your camera.

Controls:  Q = Quit  |  S = Save snapshot
"""
import cv2
import sys

# ─── CONFIGURE YOUR CP PLUS CAMERA HERE ──────────────────────────────
CAMERA_IP   = "192.168.1.16"      # ← The ONVIF/RTSP IP
CAMERA_PORT = 554                 # default RTSP port for CP Plus
USERNAME    = "admin"             # CP Plus username
PASSWORD    = "engineer2007"        # CP Plus password
STREAM      = "cam/realmonitor?channel=1&subtype=0" # Commonly used for Dahua/CP Plus, or try "stream1"
# ─────────────────────────────────────────────────────────────────────

RTSP_URL = f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:{CAMERA_PORT}/{STREAM}"

print(f"[CrowdSense] Connecting to CP Plus camera...")
print(f"[CrowdSense] URL: {RTSP_URL}")

# Use FFMPEG backend for reliable RTSP decoding
cap = cv2.VideoCapture(RTSP_URL, cv2.CAP_FFMPEG)

if not cap.isOpened():
    print("[CrowdSense] ✗ Could not connect. Check IP, credentials, and that the camera is reachable.")
    print("             Try pinging the camera: ping 152.59.98.X")
    sys.exit(1)

actual_w   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
actual_h   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
actual_fps = cap.get(cv2.CAP_PROP_FPS)
print(f"[CrowdSense] ✓ Connected!  {actual_w}x{actual_h} @ {actual_fps:.1f} FPS")
print(f"[CrowdSense] Press Q to quit | S to save snapshot")

while True:
    ret, frame = cap.read()
    if not ret:
        print("[CrowdSense] ✗ Lost connection — check network.")
        break

    # Overlay info
    cv2.putText(frame, f"CP Plus RTSP  {CAMERA_IP}  |  {actual_w}x{actual_h}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 180), 2)
    cv2.putText(frame, "Q = Quit  |  S = Snapshot",
                (10, actual_h - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

    cv2.imshow("CrowdSense — CP Plus Live Feed", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("[CrowdSense] Exiting...")
        break
    elif key == ord('s'):
        fname = "cctv_snapshot.jpg"
        cv2.imwrite(fname, frame)
        print(f"[CrowdSense] ✓ Snapshot saved → {fname}")

cap.release()
cv2.destroyAllWindows()
