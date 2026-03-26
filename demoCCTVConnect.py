import cv2

# Replace with your camera's RTSP or HTTP URL
# For local webcam, use cv2.VideoCapture(0)
camera_url = "rtsp://username:password@IP_Address:Port/stream"
cap = cv2.VideoCapture(camera_url)

if not cap.isOpened():
    print("Error: Could not open video stream.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        break

    cv2.imshow('CCTV Live Stream', frame)

    # Press 'q' to exit
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
