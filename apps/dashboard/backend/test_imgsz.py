import cv2
import sys
from detector import _get_model

def test_det_imgsz(path):
    img = cv2.imread(path)
    if img is None:
        print("could not read")
        return
    model = _get_model()
    
    # Try running directly on the full raw image with dynamic imgsz
    res = model(img, conf=0.15, classes=[0], imgsz=1280)
    print(f"Persons with imgsz=1280: {len(res[0].boxes)}")
    
    # Try even lower confidence
    res2 = model(img, conf=0.05, classes=[0], imgsz=1280)
    print(f"Persons with conf=0.05: {len(res2[0].boxes)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_det_imgsz(sys.argv[1])
