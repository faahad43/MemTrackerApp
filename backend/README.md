# MemTracker Backend

A modular, production-ready computer vision pipeline for object detection, tracking, and activity recognition with MongoDB logging.

## 🎯 Features

- **Modular Architecture**: Easily swap between different detection, tracking, and activity models
- **Multiple Model Support**: 
  - Detection: YOLO (v8, v11), RT-DETR (extensible)
  - Tracking: DeepSORT, ByteTrack (extensible)
  - Activity: CLIP-based zero-shot, LSTM (extensible)
- **RESTful API**: Flask-based API for video processing
- **MongoDB Integration**: Automatic logging of detected activities
- **Configuration-Based**: Change models via environment variables
- **Production-Ready**: Blueprint pattern, error handling, CORS support

## 🏗️ Architecture

```
backend/
├── api/                          # Flask API routes
│   ├── routes_health.py          # Health check endpoints
│   ├── routes_activity.py        # Activity log retrieval
│   └── routes_pipeline.py        # Pipeline processing endpoints
├── core/                         # Core pipeline components
│   ├── pipeline.py               # Main orchestration pipeline
│   └── model_factory.py          # Factory for creating models
├── modules/                      # Computer vision modules
│   ├── detection/
│   │   ├── detector_interface.py      # Abstract detector interface
│   │   └── yolo_detector.py           # YOLO implementation
│   ├── tracking/
│   │   ├── tracker_interface.py       # Abstract tracker interface
│   │   ├── deepsort_tracker.py        # DeepSORT implementation
│   │   └── (add more trackers here)
│   └── activity/
│       ├── activity_interface.py      # Abstract activity interface
│       ├── zero_shot_activity.py      # CLIP-based implementation
│       └── (add more activity models here)
├── services/                     # External services
│   ├── mongo_service.py          # MongoDB connection & logging
│   └── rtsp_manager.py           # RTSP stream handling
├── tests/                        # Test scripts
├── examples/                     # Usage examples
├── config.py                     # Configuration management
├── app.py                        # Flask application entry point
└── requirements.txt              # Python dependencies
```

## 📊 Data Flow

```
Input Frame
    ↓
[YOLO Detector] ──→ Detections: [([x,y,w,h], class_id, conf), ...]
    ↓
[DeepSORT Tracker] ──→ Tracks: [Track(id, bbox, class, conf), ...]
    ↓
[CLIP Activity Model] ──→ Activities: [{activity, confidence, track_id}, ...]
    ↓
[MongoDB Service] ──→ Logged to activity_logs collection
    ↓
[API Endpoint] ──→ Frontend retrieves logs
```

## 🚀 Quick Start

### 1. Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGO_URI=mongodb://localhost:27017/
SECRET_KEY=your-secret-key

# Model Selection (swap these to change models!)
DETECTOR_TYPE=yolo
YOLO_MODEL_PATH=yolov8n.pt      # Change to yolov8s.pt, yolov8m.pt, etc.
TRACKER_TYPE=deepsort
ACTIVITY_TYPE=zero_shot
CLIP_MODEL_NAME=ViT-B-32        # Change to ViT-L-14 for better accuracy

# Activity Labels (customize for your use case!)
ACTIVITY_LABELS=walking,sitting,standing,running,falling,phone usage
```

### 3. Run Server

```bash
python app.py
```

Server will start on `http://localhost:5000`

## 🔌 API Endpoints

### Pipeline Endpoints

#### Get Pipeline Status
```bash
GET /api/pipeline/status
```

#### Process Single Frame
```bash
POST /api/pipeline/process-frame
Content-Type: application/json

{
  "image": "<base64_encoded_image>"
}
```

#### Process Video File
```bash
POST /api/pipeline/process-video
Content-Type: multipart/form-data

FormData:
  - video: <video_file>
  - visualize: true/false
  - save_output: true/false
```

#### Update Configuration
```bash
POST /api/pipeline/config
Content-Type: application/json

{
  "yolo_model": "yolov8s.pt",
  "yolo_confidence": 0.6,
  "activity_labels": ["walking", "sitting"]
}
```

#### Reset Pipeline
```bash
POST /api/pipeline/reset
```

### Activity Log Endpoints

#### Get Activity Logs
```bash
GET /api/logs?limit=50
```

### Health Check

```bash
GET /api/health
```

## 🔄 Swapping Models

### Change Detection Model

**Option 1: Via Environment Variables**
```env
# Edit .env file
YOLO_MODEL_PATH=yolov8m.pt  # Swap to medium model
```

**Option 2: Via API**
```bash
curl -X POST http://localhost:5000/api/pipeline/config \
  -H "Content-Type: application/json" \
  -d '{"yolo_model": "yolov8m.pt"}'
```

**Option 3: Programmatically**
```python
from modules.detection.yolo_detector import YOLODetector

detector = YOLODetector(model_path='yolov8m.pt', confidence=0.6)
```

### Change Tracking Algorithm

```env
# Edit .env file
TRACKER_TYPE=deepsort
DEEPSORT_MAX_AGE=50  # Customize tracking parameters
```

### Change Activity Recognition

```env
# Edit .env file
CLIP_MODEL_NAME=ViT-L-14  # More accurate model
ACTIVITY_LABELS=walking,sitting,working,using phone
```

See [MODEL_SWAPPING_GUIDE.md](MODEL_SWAPPING_GUIDE.md) for detailed instructions!

## 🧪 Testing

### Test Individual Modules

```bash
# Test detection
python tests/test_detector.py

# Test tracking
python tests/test_tracker.py

# Test activity recognition
python tests/test_ai_to_mongo.py
```

### Run Quick Start Examples

```bash
python examples/quick_start.py
```

## 🏭 Adding New Models

### 1. Create Implementation

```python
# modules/detection/my_detector.py
from .detector_interface import DetectorInterface

class MyDetector(DetectorInterface):
    def detect(self, frame):
        # Your implementation
        return detections
```

### 2. Register in Factory

```python
# core/model_factory.py
def create_detector(self):
    if detector_type == 'my_detector':
        return MyDetector(...)
```

### 3. Configure

```env
# .env
DETECTOR_TYPE=my_detector
```

That's it! See [MODEL_SWAPPING_GUIDE.md](MODEL_SWAPPING_GUIDE.md) for more details.

## 📦 Available Models

### Detection Models

| Model | Speed | Accuracy | Size | Command |
|-------|-------|----------|------|---------|
| YOLOv8n | ⚡⚡⚡ | ⭐⭐ | 6MB | `YOLO_MODEL_PATH=yolov8n.pt` |
| YOLOv8s | ⚡⚡ | ⭐⭐⭐ | 22MB | `YOLO_MODEL_PATH=yolov8s.pt` |
| YOLOv8m | ⚡ | ⭐⭐⭐⭐ | 52MB | `YOLO_MODEL_PATH=yolov8m.pt` |
| YOLO11n | ⚡⚡⚡ | ⭐⭐ | 6MB | `YOLO_MODEL_PATH=yolo11n.pt` |

### Activity Models

| Model | Speed | Flexibility | Command |
|-------|-------|-------------|---------|
| CLIP ViT-B-32 | ⚡⚡ | ⭐⭐⭐ | `CLIP_MODEL_NAME=ViT-B-32` |
| CLIP ViT-L-14 | ⚡ | ⭐⭐⭐⭐ | `CLIP_MODEL_NAME=ViT-L-14` |

## 🔧 Configuration Reference

See [config.py](config.py) for all available configuration options.

Key configurations:

```env
# Detection
YOLO_MODEL_PATH=yolov8n.pt
YOLO_CONFIDENCE=0.5
YOLO_TARGET_CLASSES=person

# Tracking
DEEPSORT_MAX_AGE=30
DEEPSORT_N_INIT=3
DEEPSORT_MAX_COSINE_DIST=0.4

# Activity Recognition
CLIP_MODEL_NAME=ViT-B-32
ACTIVITY_LABELS=walking,sitting,standing,running

# Pipeline
PROCESS_EVERY_N_FRAMES=1
ENABLE_ACTIVITY_RECOGNITION=True
LOG_TO_MONGODB=True
```

## 🐛 Troubleshooting

### Models not downloading?
- Check internet connection
- First run downloads models (can take time)
- Models cached in `~/.cache/`

### Slow performance?
- Use smaller models: `yolov8n.pt` instead of `yolov8l.pt`
- Skip frames: `PROCESS_EVERY_N_FRAMES=2`
- Enable GPU: `CLIP_DEVICE=cuda`

### Memory issues?
- Use smaller YOLO models
- Set `DEEPSORT_NN_BUDGET=100`
- Process fewer frames

### MongoDB connection failed?
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env

## 📚 Documentation

- [Model Swapping Guide](MODEL_SWAPPING_GUIDE.md) - Detailed guide on swapping models
- [API Documentation](API_DOCS.md) - Full API reference (TODO)
- [Architecture Diagram](ARCHITECTURE.md) - System design (TODO)

## 🤝 Contributing

To add a new model type:

1. Implement the appropriate interface
2. Add to model factory
3. Update configuration
4. Add tests
5. Update documentation

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- [YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection
- [DeepSORT](https://github.com/nwojke/deep_sort) - Object tracking
- [OpenCLIP](https://github.com/mlfoundations/open_clip) - Activity recognition
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database

---

**Need help?** See the [MODEL_SWAPPING_GUIDE.md](MODEL_SWAPPING_GUIDE.md) or open an issue!
