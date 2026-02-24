import cv2
import numpy as np
from modules.activity.zero_shot_activity import ZeroShotActivity
from services.mongo_service import mongo_service

print("Loading CLIP Model...")
ai_module = ZeroShotActivity()

dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)

class DummyTrack:
    def __init__(self):
        self.id = 101
        self.xyxy = [[10, 10, 100, 100]] 

tracks = [DummyTrack()]


print("AI is thinking...")
results = ai_module.classify(tracks, dummy_frame)

for data in results:
    log_id = mongo_service.log_event(data)
    if log_id:
        print(f"Saved AI detection to Mongo! ID: {log_id}")

print("🚀 Test Complete.")