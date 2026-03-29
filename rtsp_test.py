"""
Quick RTSP URL brute-force tester for CP Plus cameras.
Tries multiple common URL formats with a short timeout.
"""
import cv2
import sys
import time
import socket

CAMERA_IP = "192.168.1.16"
USERNAME = "admin"
PASSWORD = "engineer2007"

# First, check which ports are open
print("=" * 60)
print(f"Testing open ports on {CAMERA_IP}...")
print("=" * 60)
for port in [554, 8554, 80, 8080, 8000, 37777, 37778]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((CAMERA_IP, port))
    status = "OPEN ✓" if result == 0 else "closed"
    print(f"  Port {port:5d}: {status}")
    sock.close()

print()
print("=" * 60)
print("Testing RTSP URLs (10s timeout each)...")
print("=" * 60)

# Common CP Plus / Dahua RTSP URL formats
URLS = [
    # Dahua / CP Plus standard
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/cam/realmonitor?channel=1&subtype=0",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/cam/realmonitor?channel=1&subtype=1",
    # Generic stream paths
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/stream1",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/stream2",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/live",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/h264",
    # Older Dahua/CP Plus
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/0/av0",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/1",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:554/",
    # Different port (8554)
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:8554/cam/realmonitor?channel=1&subtype=0",
    f"rtsp://{USERNAME}:{PASSWORD}@{CAMERA_IP}:8554/stream1",
    # No auth
    f"rtsp://{CAMERA_IP}:554/cam/realmonitor?channel=1&subtype=0",
    f"rtsp://{CAMERA_IP}:554/stream1",
]

# Set OpenCV RTSP timeout via environment
import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|timeout;5000000"

for i, url in enumerate(URLS, 1):
    # Mask password in display
    display_url = url.replace(PASSWORD, "***")
    print(f"\n[{i}/{len(URLS)}] {display_url}")
    
    start = time.time()
    cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
    elapsed = time.time() - start
    
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            h, w = frame.shape[:2]
            fps = cap.get(cv2.CAP_PROP_FPS)
            print(f"  ✓ SUCCESS! Frame: {w}x{h}, FPS: {fps:.1f} ({elapsed:.1f}s)")
            cap.release()
            print(f"\n{'='*60}")
            print(f"WORKING URL: {url}")
            print(f"{'='*60}")
            sys.exit(0)
        else:
            print(f"  ✗ Opened but can't read frames ({elapsed:.1f}s)")
    else:
        print(f"  ✗ Failed to open ({elapsed:.1f}s)")
    cap.release()

print(f"\n{'='*60}")
print("No working RTSP URL found!")
print("Check: camera credentials, firmware, and RTSP service enabled")
print(f"{'='*60}")
