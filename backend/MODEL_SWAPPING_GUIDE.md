# MemTracker Pipeline - Model Swapping Guide

This guide explains how to easily swap between different models for detection, tracking, and activity recognition in the MemTracker pipeline.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Swapping Detection Models](#swapping-detection-models)
- [Swapping Tracking Models](#swapping-tracking-models)
- [Swapping Activity Recognition Models](#swapping-activity-recognition-models)
- [API Usage](#api-usage)
- [Adding New Model Types](#adding-new-model-types)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Models

Edit `.env` file (or set environment variables):

```env
# Detection
DETECTOR_TYPE=yolo
YOLO_MODEL_PATH=yolov8n.pt
YOLO_CONFIDENCE=0.5

# Tracking
TRACKER_TYPE=deepsort
DEEPSORT_MAX_AGE=30

# Activity Recognition
ACTIVITY_TYPE=zero_shot
CLIP_MODEL_NAME=ViT-B-32
ACTIVITY_LABELS=walking,sitting,standing,running
```

### 3. Start Server

```bash
python app.py
```

The pipeline will automatically load the models specified in your configuration!

---

## 🎯 Swapping Detection Models

### YOLO Models (Built-in)

The easiest way to swap detection models is to change the `YOLO_MODEL_PATH` in `.env`:

#### YOLOv8 Models

```env
# Fastest (lower accuracy)
YOLO_MODEL_PATH=yolov8n.pt

# Balanced
YOLO_MODEL_PATH=yolov8s.pt

# Better accuracy (slower)
YOLO_MODEL_PATH=yolov8m.pt

# Best accuracy (slowest)
YOLO_MODEL_PATH=yolov8l.pt
YOLO_MODEL_PATH=yolov8x.pt
```

#### YOLO11 Models (Latest)

```env
YOLO_MODEL_PATH=yolo11n.pt   # Nano
YOLO_MODEL_PATH=yolo11s.pt   # Small
YOLO_MODEL_PATH=yolo11m.pt   # Medium
YOLO_MODEL_PATH=yolo11l.pt   # Large
YOLO_MODEL_PATH=yolo11x.pt   # Extra Large
```

#### Custom Trained Models

```env
# Use your own trained model
YOLO_MODEL_PATH=models/my_custom_yolo.pt
```

### Other Detection Models

To add a different detector (e.g., RT-DETR):

1. Create new file: `backend/modules/detection/rtdetr_detector.py`
2. Implement `DetectorInterface`:

```python
from .detector_interface import DetectorInterface

class RTDETRDetector(DetectorInterface):
    def __init__(self, model_path, confidence):
        # Your implementation
        pass
    
    def detect(self, frame):
        # Return: [([x, y, w, h], class_id, conf), ...]
        pass
```

3. Register in `core/model_factory.py`:

```python
elif detector_type == 'rtdetr':
    return RTDETRDetector(...)
```

4. Update `.env`:

```env
DETECTOR_TYPE=rtdetr
```

---

## 🎯 Swapping Tracking Models

### DeepSORT (Default)

Tune DeepSORT parameters in `.env`:

```env
TRACKER_TYPE=deepsort

# Tracking persistence
DEEPSORT_MAX_AGE=30          # Frames to keep track without detection

# Track confirmation
DEEPSORT_N_INIT=3            # Detections needed before confirmed

# Matching thresholds
DEEPSORT_NMS_OVERLAP=0.3     # Non-maximum suppression
DEEPSORT_MAX_COSINE_DIST=0.4 # Appearance similarity

# Feature extraction
DEEPSORT_EMBEDDER=mobilenet  # Options: mobilenet, torchreid
DEEPSORT_HALF=True           # Use FP16 for speed
```

### Adding ByteTrack or Other Trackers

1. Create new file: `backend/modules/tracking/bytetrack_tracker.py`
2. Implement `TrackerInterface`:

```python
from .tracker_interface import TrackerInterface, Track

class ByteTracker(TrackerInterface):
    def __init__(self, **kwargs):
        # Your implementation
        pass
    
    def track(self, detections, frame):
        # Return: List of Track objects
        pass
```

3. Register in `core/model_factory.py`:

```python
elif tracker_type == 'bytetrack':
    return ByteTracker(...)
```

4. Update `.env`:

```env
TRACKER_TYPE=bytetrack
```

---

## 🎯 Swapping Activity Recognition Models

### CLIP Models (Zero-Shot)

Change CLIP model in `.env`:

```env
ACTIVITY_TYPE=zero_shot

# Faster models
CLIP_MODEL_NAME=ViT-B-32     # Default, balanced
CLIP_MODEL_NAME=RN50         # ResNet-50 based

# More accurate models (slower)
CLIP_MODEL_NAME=ViT-B-16
CLIP_MODEL_NAME=ViT-L-14     # Best accuracy

# Device
CLIP_DEVICE=cpu              # Or 'cuda' for GPU
```

### Customize Activity Labels

Edit activities in `.env` (comma-separated):

```env
# Custom activities for your use case
ACTIVITY_LABELS=walking,sitting,standing,running,falling,phone usage,eating,drinking,working on computer
```

### Adding Custom Activity Models

To add LSTM/RNN or other activity models:

1. Create new file: `backend/modules/activity/lstm_activity.py`
2. Implement `ActivityInterface`:

```python
from .activity_interface import ActivityInterface

class LSTMActivity(ActivityInterface):
    def __init__(self, model_path, sequence_length=30):
        # Your implementation
        pass
    
    def classify(self, tracks, frame):
        # Return: List of activity dicts
        pass
```

3. Register in `core/model_factory.py`:

```python
elif activity_type == 'lstm':
    return LSTMActivity(...)
```

4. Update `.env`:

```env
ACTIVITY_TYPE=lstm
```

---

## 🌐 API Usage

### Check Pipeline Status

```bash
curl http://localhost:5000/api/pipeline/status
```

Response:
```json
{
  "status": "ready",
  "config": {
    "detector_type": "yolo",
    "yolo_model": "yolov8n.pt",
    "tracker_type": "deepsort",
    "activity_type": "zero_shot",
    "clip_model": "ViT-B-32",
    "activity_labels": ["walking", "sitting", "running"]
  },
  "frame_count": 0
}
```

### Process Single Frame

```bash
curl -X POST http://localhost:5000/api/pipeline/process-frame \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64_image_data>"}'
```

### Process Video File

```bash
curl -X POST http://localhost:5000/api/pipeline/process-video \
  -F "video=@path/to/video.mp4" \
  -F "visualize=true" \
  -F "save_output=true"
```

### Update Config Dynamically

```bash
curl -X POST http://localhost:5000/api/pipeline/config \
  -H "Content-Type: application/json" \
  -d '{
    "yolo_model": "yolov8s.pt",
    "yolo_confidence": 0.6,
    "activity_labels": ["walking", "sitting"]
  }'
```

### Reset Pipeline

```bash
curl -X POST http://localhost:5000/api/pipeline/reset
```

---

## 🔧 Adding New Model Types

### Step-by-Step Guide

#### 1. Create Interface Implementation

```python
# modules/<detection|tracking|activity>/your_model.py
from .<type>_interface import <Type>Interface

class YourModel(<Type>Interface):
    def __init__(self, **config):
        # Initialize your model
        pass
    
    def <method_name>(self, *args):
        # Implement required method
        pass
```

#### 2. Register in Factory

Edit `core/model_factory.py`:

```python
def create_<type>(self):
    model_type = self.config.<TYPE>_TYPE.lower()
    
    if model_type == 'your_model':
        return YourModel(...)
    # ... existing code
```

#### 3. Add Configuration

Edit `config.py`:

```python
# Your Model Config
YOUR_MODEL_PARAM = os.getenv("YOUR_MODEL_PARAM", "default")
```

#### 4. Update .env.example

```env
# ==================== YOUR MODEL CONFIG ====================
YOUR_MODEL_PARAM=default
```

#### 5. Test Your Model

```python
# tests/test_your_model.py
from modules.detection.your_model import YourModel

model = YourModel()
result = model.method(test_data)
assert result is not None
```

---

## 📊 Performance Comparison

### Detection Models

| Model | Speed (FPS) | mAP | Size | Use Case |
|-------|-------------|-----|------|----------|
| YOLOv8n | ~150 | 37.3 | 6.2MB | Real-time, embedded |
| YOLOv8s | ~100 | 44.9 | 22MB | Balanced |
| YOLOv8m | ~60 | 50.2 | 52MB | High accuracy |
| YOLOv8l | ~40 | 52.9 | 87MB | Best accuracy |
| YOLO11n | ~160 | 39.5 | 5.8MB | Latest, fastest |

### Activity Models

| Model | Speed | Accuracy | Use Case |
|-------|-------|----------|----------|
| CLIP ViT-B-32 | Fast | Good | Zero-shot, flexible labels |
| CLIP ViT-L-14 | Slow | Excellent | Best accuracy |
| LSTM (custom) | Medium | Excellent* | Temporal patterns |

*Requires training on your dataset

---

## 🤝 Contributing

To add support for new models:

1. Implement the appropriate interface
2. Add factory registration
3. Add configuration options
4. Update documentation
5. Create tests

---

## 📝 Notes

- First run will download models (can take time)
- GPU usage: Set `CLIP_DEVICE=cuda` and ensure PyTorch CUDA is installed
- Model files are cached in `~/.cache/` directory
- For production, pin specific model versions

---

## 🐛 Troubleshooting

### Models not loading?
- Check internet connection (first download)
- Verify model path exists
- Check disk space for model files

### Slow performance?
- Use smaller models (yolov8n instead of yolov8l)
- Reduce YOLO_CONFIDENCE threshold
- Set PROCESS_EVERY_N_FRAMES > 1
- Enable GPU: CLIP_DEVICE=cuda

### Running out of memory?
- Use smaller YOLO models
- Set DEEPSORT_NN_BUDGET to limit tracker memory
- Process fewer frames: PROCESS_EVERY_N_FRAMES=2

---

For more information, see:
- [YOLO Documentation](https://docs.ultralytics.com/)
- [DeepSORT Paper](https://arxiv.org/abs/1703.07402)
- [CLIP Paper](https://arxiv.org/abs/2103.00020)
