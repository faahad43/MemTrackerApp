import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB Configuration
    MONGO_URI = os.getenv("MONGO_URI")
    SECRET_KEY = os.getenv("SECRET_KEY")
    
    # ==================== MODEL SELECTION ====================
    # Change these to swap between different model types
    DETECTOR_TYPE = os.getenv("DETECTOR_TYPE", "yolo")  # Options: yolo, rtdetr, etc.
    TRACKER_TYPE = os.getenv("TRACKER_TYPE", "deepsort")  # Options: deepsort, bytetrack, etc.
    ACTIVITY_TYPE = os.getenv("ACTIVITY_TYPE", "zero_shot")  # Options: zero_shot, lstm, etc.
    
    # ==================== YOLO DETECTOR CONFIG ====================
    # Model Selection - Swap these to change YOLO versions:
    # - 'yolov8n.pt' (fastest, less accurate)
    # - 'yolov8s.pt' (balanced)
    # - 'yolov8m.pt' (slower, more accurate)
    # - 'yolov8l.pt', 'yolov8x.pt' (slowest, most accurate)
    # - 'yolo11n.pt', 'yolo11s.pt', etc. (YOLO11 models)
    # - 'path/to/custom_model.pt' (your custom trained model)
    YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")
    YOLO_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.5"))  # 0.0 to 1.0
    YOLO_TARGET_CLASSES = os.getenv("YOLO_TARGET_CLASSES", "person").split(",")  # Comma-separated
    
    # ==================== DEEPSORT TRACKER CONFIG ====================
    # Tracking Parameters - Tune these for your use case:
    DEEPSORT_MAX_AGE = int(os.getenv("DEEPSORT_MAX_AGE", "30"))  # Frames to keep track without detection
    DEEPSORT_N_INIT = int(os.getenv("DEEPSORT_N_INIT", "3"))  # Detections needed before confirmed
    DEEPSORT_NMS_OVERLAP = float(os.getenv("DEEPSORT_NMS_OVERLAP", "0.3"))  # NMS threshold
    DEEPSORT_MAX_COSINE_DIST = float(os.getenv("DEEPSORT_MAX_COSINE_DIST", "0.4"))  # Appearance matching
    DEEPSORT_NN_BUDGET = os.getenv("DEEPSORT_NN_BUDGET", "None")  # Budget for appearance features
    DEEPSORT_NN_BUDGET = None if DEEPSORT_NN_BUDGET == "None" else int(DEEPSORT_NN_BUDGET)
    
    # Embedder Selection - Swap these for different feature extractors:
    # - 'mobilenet' (fastest, default)
    # - 'torchreid' (more accurate but slower)
    DEEPSORT_EMBEDDER = os.getenv("DEEPSORT_EMBEDDER", "mobilenet")
    DEEPSORT_HALF = os.getenv("DEEPSORT_HALF", "True").lower() in ['true', '1', 'yes']  # FP16
    DEEPSORT_BGR = os.getenv("DEEPSORT_BGR", "True").lower() in ['true', '1', 'yes']  # BGR format
    
    # ==================== ACTIVITY RECOGNITION CONFIG ====================
    # CLIP Model Selection - Swap these for different CLIP models:
    # - 'ViT-B-32' (default, balanced)
    # - 'ViT-B-16' (more accurate but slower)
    # - 'ViT-L-14' (most accurate, slowest)
    # - 'RN50' (ResNet-50 based)
    CLIP_MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
    CLIP_DEVICE = os.getenv("CLIP_DEVICE", "cpu")  # 'cpu' or 'cuda'
    
    # Activity Labels - Customize these for your activities:
    # Change or add activities you want to recognize
    ACTIVITY_LABELS = os.getenv(
        "ACTIVITY_LABELS", 
        "walking,sitting,standing,running,falling,phone usage"
    ).split(",")
    
    # ==================== PIPELINE CONFIG ====================
    # Processing Settings
    PROCESS_EVERY_N_FRAMES = int(os.getenv("PROCESS_EVERY_N_FRAMES", "1"))  # Process every Nth frame
    ENABLE_ACTIVITY_RECOGNITION = os.getenv("ENABLE_ACTIVITY_RECOGNITION", "True").lower() in ['true', '1', 'yes']
    LOG_TO_MONGODB = os.getenv("LOG_TO_MONGODB", "True").lower() in ['true', '1', 'yes']
    
    # ==================== FILE UPLOAD CONFIG ====================
    # Max upload size in bytes (default 500MB)
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", "524288000"))
    
    # ==================== RTSP STREAM CONFIG ====================
    RTSP_URLS = os.getenv("RTSP_URLS", "").split(",")  # Comma-separated RTSP URLs
    RTSP_BUFFER_SIZE = int(os.getenv("RTSP_BUFFER_SIZE", "1"))  # Frame buffer size