# MemTracker Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  - Video Upload UI                                               │
│  - Live Camera Feed                                              │
│  - Activity Log Dashboard                                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/REST API
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FLASK API SERVER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  routes_pipeline.py (Blueprint)                          │   │
│  │  • GET  /api/pipeline/status                             │   │
│  │  • POST /api/pipeline/process-frame                      │   │
│  │  • POST /api/pipeline/process-video                      │   │
│  │  • POST /api/pipeline/config (dynamic model swap)        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  routes_activity.py (Blueprint)                          │   │
│  │  • GET  /api/logs (retrieve activity logs)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                     MODEL FACTORY                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  create_pipeline(Config)                                 │   │
│  │    ├─→ create_detector()                                 │   │
│  │    ├─→ create_tracker()                                  │   │
│  │    └─→ create_activity_model()                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                   MEMTRACKER PIPELINE                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  process_frame(frame) or process_video(video_path)       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Step 1: Detection                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DetectorInterface (Abstract)                            │   │
│  │    └─→ YOLODetector (Concrete)                           │   │
│  │         • model: yolov8n/s/m/l/x, yolo11n/s/m/l/x        │   │
│  │         • confidence: 0.5                                 │   │
│  │         • target_classes: [person]                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      ↓                                            │
│  Output: [([x, y, w, h], class_id, confidence), ...]            │
│                                                                   │
│  Step 2: Tracking                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TrackerInterface (Abstract)                             │   │
│  │    └─→ DeepSORTTracker (Concrete)                        │   │
│  │         • max_age: 30                                     │   │
│  │         • n_init: 3                                       │   │
│  │         • embedder: mobilenet                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      ↓                                            │
│  Output: [Track(id, bbox, class_id, conf), ...]                 │
│                                                                   │
│  Step 3: Activity Recognition                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ActivityInterface (Abstract)                            │   │
│  │    └─→ ZeroShotActivity (Concrete)                       │   │
│  │         • model: CLIP ViT-B-32                            │   │
│  │         • labels: [walking, sitting, ...]                 │   │
│  │         • device: cpu                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      ↓                                            │
│  Output: [{track_id, activity, confidence, bbox}, ...]          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                   MONGODB SERVICE                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  mongo_service.log_event(event_data)                     │   │
│  │    └─→ activity_logs collection                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────┐     detect()      ┌──────────┐
│  Frame  │ ───────────────→  │  YOLO    │
└─────────┘                    │ Detector │
                               └────┬─────┘
                                    │
                          Detections│
                [([x,y,w,h], cls, conf), ...]
                                    │
                                    ↓
                               ┌────────────┐
                               │  DeepSORT  │
                               │  Tracker   │
                               └─────┬──────┘
                                     │
                            Tracks   │
              [Track(id, bbox, cls, conf), ...]
                                     │
                                     ↓
                               ┌────────────┐
                    ┌──────────│   CLIP     │
                    │          │  Activity  │
                    │          └─────┬──────┘
                    │                │
             Frame  │     Activities │
             (crop  │   [{activity,  │
           regions) │   confidence,  │
                    │   track_id}]   │
                    └────────┘       │
                                     ↓
                               ┌────────────┐
                               │  MongoDB   │
                               │   Logging  │
                               └────────────┘
```

## 🔧 Configuration Flow

```
┌─────────────┐
│  .env file  │
│             │
│  DETECTOR_TYPE=yolo                    ┌──────────────────┐
│  YOLO_MODEL_PATH=yolov8n.pt     ─────→ │  Config Class    │
│  TRACKER_TYPE=deepsort                  │  (config.py)     │
│  ACTIVITY_TYPE=zero_shot                └────────┬─────────┘
│  CLIP_MODEL_NAME=ViT-B-32                        │
│  ACTIVITY_LABELS=walking,sitting,...             │
└─────────────┘                                    │
                                                   ↓
                                        ┌──────────────────┐
                                        │  ModelFactory    │
                                        │  (model_factory) │
                                        └────────┬─────────┘
                                                 │
                     ┌───────────────────────────┼──────────────────────────┐
                     ↓                           ↓                          ↓
            ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
            │  YOLODetector    │      │ DeepSORTTracker  │      │ ZeroShotActivity │
            │  (yolov8n.pt)    │      │ (max_age=30)     │      │ (ViT-B-32)       │
            └──────────────────┘      └──────────────────┘      └──────────────────┘
                     │                           │                          │
                     └───────────────────────────┼──────────────────────────┘
                                                 ↓
                                     ┌───────────────────────┐
                                     │  MemTrackerPipeline   │
                                     │  (pipeline.py)        │
                                     └───────────────────────┘
```

## 📦 Module Structure

```
modules/
│
├── detection/
│   ├── __init__.py
│   ├── detector_interface.py         ← Abstract Base Class
│   │   └── detect(frame) → detections
│   │
│   └── yolo_detector.py              ← Concrete Implementation
│       ├── __init__(model_path, confidence, target_classes)
│       └── detect(frame) → [([x,y,w,h], cls, conf), ...]
│
├── tracking/
│   ├── __init__.py
│   ├── tracker_interface.py          ← Abstract Base Class + Track Class
│   │   └── track(detections, frame) → tracks
│   │
│   └── deepsort_tracker.py           ← Concrete Implementation
│       ├── __init__(max_age, n_init, embedder, ...)
│       └── track(detections, frame) → [Track(...), ...]
│
└── activity/
    ├── __init__.py
    ├── activity_interface.py         ← Abstract Base Class
    │   └── classify(tracks, frame) → activities
    │
    └── zero_shot_activity.py         ← Concrete Implementation
        ├── __init__(model_name, labels, device)
        └── classify(tracks, frame) → [{activity, conf, id}, ...]
```

## 🎯 Adding New Models (Sequence Diagram)

```
Developer                 Interface               Factory              Config
    │                        │                      │                    │
    │ 1. Create new class    │                      │                    │
    │ implementing interface │                      │                    │
    ├───────────────────────→│                      │                    │
    │                        │                      │                    │
    │                                               │                    │
    │ 2. Register in factory                        │                    │
    ├──────────────────────────────────────────────→│                    │
    │                                               │                    │
    │                                                                    │
    │ 3. Add config parameters                                           │
    ├───────────────────────────────────────────────────────────────────→│
    │                                                                    │
    │                                                                    │
    │ 4. Update .env                                                     │
    ├───────────────────────────────────────────────────────────────────→│
    │                                                                    │
    │                         DONE! Model is now swappable              │
    └───────────────────────────────────────────────────────────────────→
```

## 🔄 Model Swapping Options

```
┌────────────────────────────────────────────────────────┐
│              3 WAYS TO SWAP MODELS                     │
└────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option 1: Environment Variables (Recommended)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Edit .env file:                                       │  │
│  │     YOLO_MODEL_PATH=yolov8m.pt                            │  │
│  │  2. Restart Flask server                                  │  │
│  │  3. New model automatically loaded!                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option 2: Dynamic API (No Restart!)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  curl -X POST /api/pipeline/config \                     │  │
│  │    -d '{"yolo_model": "yolov8m.pt"}'                      │  │
│  │  Pipeline recreates automatically!                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option 3: Programmatic (Full Control)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  from modules.detection.yolo_detector import YOLODetector│  │
│  │  detector = YOLODetector('yolov8m.pt', confidence=0.7)   │  │
│  │  pipeline = MemTrackerPipeline(detector, ...)            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Performance Optimization Flow

```
                         ┌──────────────┐
                         │   Pipeline   │
                         └──────┬───────┘
                                │
                                ↓
                    ┌───────────────────────┐
                    │  PROCESS_EVERY_N_FRAMES │  ← Skip frames for speed
                    └───────────┬───────────┘
                                │
                                ↓
           ┌────────────────────┴────────────────────┐
           │                                          │
           ↓                                          ↓
    ┌────────────┐                           ┌──────────────┐
    │ Detection  │  Fast: yolov8n.pt         │  Tracking    │  Fast: mobilenet
    │            │  Slow: yolov8x.pt         │              │  Slow: torchreid
    └────────────┘                           └──────────────┘
           │                                          │
           └────────────────────┬────────────────────┘
                                ↓
                        ┌───────────────┐
                        │   Activity    │  Fast: ViT-B-32
                        │               │  Slow: ViT-L-14
                        └───────┬───────┘
                                │
                                ↓
                        ┌───────────────┐
                        │  MongoDB Log  │  Optional: LOG_TO_MONGODB=False
                        └───────────────┘
```

## 🎨 Class Diagram

```
┌──────────────────────────┐
│  DetectorInterface (ABC) │
├──────────────────────────┤
│ + detect(frame)          │
└────────────▲─────────────┘
             │ implements
             │
    ┌────────┴────────┐
    │  YOLODetector   │
    ├─────────────────┤
    │ - model         │
    │ - confidence    │
    ├─────────────────┤
    │ + detect()      │
    └─────────────────┘

┌──────────────────────────┐
│  TrackerInterface (ABC)  │
├──────────────────────────┤
│ + track(dets, frame)     │
└────────────▲─────────────┘
             │ implements
             │
    ┌────────┴────────┐
    │ DeepSORTTracker │
    ├─────────────────┤
    │ - tracker       │
    │ - max_age       │
    ├─────────────────┤
    │ + track()       │
    └─────────────────┘

┌──────────────────────────┐
│  ActivityInterface (ABC) │
├──────────────────────────┤
│ + classify(tracks, frm)  │
└────────────▲─────────────┘
             │ implements
             │
    ┌────────┴──────────┐
    │  ZeroShotActivity │
    ├───────────────────┤
    │ - model (CLIP)    │
    │ - labels          │
    ├───────────────────┤
    │ + classify()      │
    └───────────────────┘

┌─────────────────────────┐
│   MemTrackerPipeline    │
├─────────────────────────┤
│ - detector              │
│ - tracker               │
│ - activity_model        │
├─────────────────────────┤
│ + process_frame()       │
│ + process_video()       │
│ + reset()               │
└─────────────────────────┘

┌─────────────────────────┐
│     ModelFactory        │
├─────────────────────────┤
│ - config                │
├─────────────────────────┤
│ + create_detector()     │
│ + create_tracker()      │
│ + create_activity()     │
└─────────────────────────┘
```

---

## 📝 Summary

The architecture follows a **modular, interface-based design** with:

- **Abstraction**: All modules implement interfaces
- **Factory Pattern**: Centralized model creation
- **Configuration-Driven**: All settings in .env
- **RESTful API**: Flask blueprints for organization
- **Extensibility**: Easy to add new models

This makes the system **highly maintainable** and **easily extensible** for future requirements!
