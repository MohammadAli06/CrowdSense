import socket
import sys

CAMERA_IP = "192.168.1.16"

print("=" * 60)
print(f"Testing open ports on {CAMERA_IP}...")
print("=" * 60)

ports_to_test = [554, 1554, 8554, 80, 8080, 8000, 37777, 37778, 443]

for port in ports_to_test:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1) # short timeout
    result = sock.connect_ex((CAMERA_IP, port))
    if result == 0:
        print(f"  Port {port[:5] if isinstance(port, str) else port}: OPEN \u2713")
    else:
        print(f"  Port {port}: closed")
    sock.close()
