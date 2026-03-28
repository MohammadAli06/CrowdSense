import cv2
import sys
from detector import detect_persons

app_state = {"image_frame": None}

def test_det(path):
    img = cv2.imread(path)
    if img is None:
        print("could not read")
        return
    img = cv2.resize(img, (640, 480))
    
    print("Testing 640x480 directly...")
    res = detect_persons(img)
    print(f"Persons: {res['total_count']}")
    
    high_res = cv2.resize(img, (1280, 960))
    print("Testing 1280x960 upscaled without imgsz param...")
    res2 = detect_persons(high_res)
    print(f"Persons: {res2['total_count']}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_det(sys.argv[1])
