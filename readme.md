# MemTracker

**AI-Powered CCTV Surveillance System with Real-Time Detection, Tracking & Intelligent Chat**

MemTracker is a modular computer vision web application that detects people in CCTV streams, tracks them, recognizes activities, logs timestamped events, and allows querying events using an LLM-powered chat interface.

Built for collaborative development with clear separation of concerns and modular AI components.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Development Guide](#-development-guide)
- [API Endpoints](#-api-endpoints)
- [Modularity Rules](#-modularity-rules)
- [How to Change Models](#-how-to-change-models)
- [Troubleshooting](#-troubleshooting)

---

## Features

- **RTSP Stream Support** - Connect to live CCTV cameras
- **Video Upload** - Process MP4 files as fake RTSP streams
- **Person Detection** - YOLO / RT-DETR based detection
- **Multi-Object Tracking** - ByteTrack / DeepSORT integration
- **Activity Recognition** - Zero-shot activity recognition with DINO/CLIP/VLM
- **Event Logging** - Timestamped events stored in MongoDB
- **AI Chat Interface** - Query surveillance events using Groq LLM
- **Logs Dashboard** - View and filter historical events
- **Real-Time Updates** - Live detection results streaming

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Real-time**: Server-Sent Events (SSE) / WebSockets

### Backend
- **Framework**: Flask 3.1
- **Language**: Python 3.10+
- **Database**: MongoDB
- **Video Processing**: OpenCV
- **LLM API**: Groq API

### AI Modules
- **Detection**: YOLO v8/v9/v10 or RT-DETR
- **Tracking**: ByteTrack (via Ultralytics) or DeepSORT
- **Activity Recognition**: DINO / CLIP / VLM models
- **Streaming**: FFmpeg, RTSP protocol

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RTSP Stream / MP4 Video                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Stream Manager Service                    │
│                  (RTSP Handler / Video Input)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Detection Module (YOLO/RT-DETR)            │
│                     (implements DetectorInterface)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Tracking Module (ByteTrack/DeepSORT)           │
│                   (implements TrackerInterface)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Activity Recognition (DINO/CLIP/VLM)              │
│                  (implements ActivityInterface)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Event Builder & Logger                     │
│               (Timestamped Event Creation)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│                 (Events, Chat History, Logs)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Flask REST API                         │
│            (Blueprints: Health, Events, Chat)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Frontend                          │
│            (Dashboard, Logs, Chat Interface)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
MemTrackerApp/
│
├── README.md                          # This file
│
├── frontend/                          # Next.js Application
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Home page
│   │   │   └── globals.css          # Global styles
│   │   ├── components/               # React components (to create)
│   │   ├── lib/                      # Utilities & API clients
│   │   └── types/                    # TypeScript types
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .env.local                    # Frontend environment variables
│
└── backend/                           # Flask Application
    │
    ├── api/                          # 🔵 API Routes (Flask Blueprints)
    │   └── routes_health.py         # Health check endpoint
    │
    ├── core/                         # 🟢 Core Pipeline Logic
    │   └── pipeline.py              # Main detection pipeline orchestrator
    │
    ├── modules/                      # 🟡 AI Modules (Swappable)
    │   ├── detection/
    │   │   └── detector_interface.py    # Detection interface
    │   ├── tracking/
    │   │   └── tracker_interface.py     # Tracking interface
    │   └── activity/
    │       └── activity_interface.py    # Activity recognition interface
    │
    ├── services/                     # 🟠 External Services
    │   ├── mongo_service.py         # MongoDB connection & queries
    │   └── rstp_manager.py          # RTSP stream handling
    │
    ├── utils/                        # 🟣 Utility Helpers
    │   └── (logging, validators, etc.)
    │
    ├── app.py                        # ⭐ Flask App Entry Point
    ├── config.py                     # Configuration loader
    ├── requirements.txt              # Python dependencies
    └── .env                          # Backend environment variables
```

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB 7.0+** (local or cloud)
- **FFmpeg** (for video processing)
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MemTrackerApp
   ```

2. **Setup Backend** (in one terminal)
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate     # Mac/Linux
   venv\Scripts\activate        # Windows
   
   pip install -r requirements.txt
   
   # Create .env file (see Environment Setup below)
   python app.py
   ```
   Backend runs at: **http://localhost:5000**

3. **Setup Frontend** (in another terminal)
   ```bash
   cd frontend
   npm install
   
   # Create .env.local file (see Environment Setup below)
   npm run dev
   ```
   Frontend runs at: **http://localhost:3000**

---

## Environment Setup

### Backend Environment (`.env`)

Create `backend/.env` file:


**Get Groq API Key**: https://console.groq.com/

### Frontend Environment (`.env.local`)

Create `frontend/.env.local` file:


---

## Development Guide

### Working on Backend

#### Project Organization

The backend follows a **modular architecture**:

| Directory | Purpose | Rules |
|-----------|---------|-------|
| `api/` | Flask blueprints (routes) | Keep routes thin, no business logic |
| `core/` | Pipeline orchestration | Assembles modules, manages flow |
| `modules/` | AI components | **Must implement interfaces** |
| `services/` | External integrations | MongoDB, RTSP, Groq API |
| `utils/` | Shared helpers | Logging, validation, utilities |

#### Adding a New API Endpoint

1. Create a new blueprint in `api/`
2. Register it in `app.py`
3. Follow REST conventions

Example:
```python
# api/routes_events.py
from flask import Blueprint, jsonify

events_bp = Blueprint("events", __name__)

@events_bp.route("/events")
def get_events():
    # Implementation
    return jsonify({"events": []})
```

Then in `app.py`:
```python
from api.routes_events import events_bp
app.register_blueprint(events_bp)
```

### Working on Frontend

#### Component Structure

```
src/
├── app/              # Pages (App Router)
├── components/       # Reusable React components
│   ├── ui/          # UI primitives
│   ├── features/    # Feature components
│   └── layouts/     # Layout components
├── lib/             # Utilities, API clients
└── types/           # TypeScript definitions
```

#### Creating API Services

Always use the API client pattern:

```typescript
// lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default apiClient;
```

```typescript
// lib/eventsService.ts
import apiClient from './api';

export const eventsService = {
  async getEvents() {
    const response = await apiClient.get('/events');
    return response.data;
  }
};
```

---

## API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "Backend running"
}
```

### Events (To Implement)
```
GET /api/events              # List all events
GET /api/events/:id          # Get event details
POST /api/events/search      # Search events
```

### Chat (To Implement)
```
POST /api/chat               # Send chat message
GET /api/chat/history        # Get chat history
```

### Streams (To Implement)
```
POST /api/streams/start      # Start processing stream
POST /api/streams/stop       # Stop processing
GET /api/streams/status      # Get stream status
```

---

## Modularity Rules

### Core Principles

1. **Separation of Concerns**
   - ❌ Do NOT put AI logic inside Flask routes
   - ❌ Do NOT access MongoDB directly from frontend
   - ✅ Use services and interfaces

2. **Interface Contracts**
   - All detection modules implement `DetectorInterface`
   - All tracking modules implement `TrackerInterface`
   - All activity modules implement `ActivityInterface`

3. **Independence**
   - Frontend and backend communicate **only** via REST API
   - Modules are **swappable** without affecting other code
   - Each module can be tested independently

### Interface Example

```python
# modules/detection/detector_interface.py
from abc import ABC, abstractmethod

class DetectorInterface(ABC):
    @abstractmethod
    def detect(self, frame):
        """
        Detect objects in a frame
        Returns: List of detections
        """
        pass
```

```python
# modules/detection/yolo_detector.py
from .detector_interface import DetectorInterface

class YOLODetector(DetectorInterface):
    def detect(self, frame):
        # YOLO implementation
        return detections
```

---

## How to Change Models

All AI modules live in `backend/modules/`. To switch models:

### 1. Detection Model

**Current**: YOLO  
**Swap to**: RT-DETR

```python
# modules/detection/rtdetr_detector.py
from .detector_interface import DetectorInterface

class RTDETRDetector(DetectorInterface):
    def detect(self, frame):
        # RT-DETR implementation
        pass
```

Update `core/pipeline.py`:
```python
# from modules.detection.yolo_detector import YOLODetector
from modules.detection.rtdetr_detector import RTDETRDetector

# detector = YOLODetector()
detector = RTDETRDetector()
```

### 2. Tracking Algorithm

**Current**: ByteTrack  
**Swap to**: DeepSORT

```python
# modules/tracking/deepsort_tracker.py
from .tracker_interface import TrackerInterface

class DeepSORTTracker(TrackerInterface):
    def track(self, detections):
        # DeepSORT implementation
        pass
```

Update configuration only - no other code changes needed!

### 3. Activity Recognition

**Current**: DINO  
**Swap to**: CLIP

Follow the same pattern - implement interface, update pipeline.

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`  
**Solution**: 
```bash
cd backend
pip install -r requirements.txt
```

**Problem**: MongoDB connection failed  
**Solution**:
- Check MongoDB is running: `mongod --version`
- Verify `MONGO_URI` in `.env`
- Test connection: `mongo --host localhost:27017`

**Problem**: Import errors  
**Solution**:
```bash
# Make sure you're in the backend directory
cd backend
python app.py
```

### Frontend Issues

**Problem**: `Cannot connect to backend`  
**Solution**:
- Check backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in Flask

**Problem**: Dependencies error  
**Solution**:
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Common Issues

**RTSP Stream Not Working**:
- Test RTSP URL with VLC player first
- Check firewall settings
- Verify FFmpeg is installed: `ffmpeg -version`

**Video Processing Slow**:
- Lower detection resolution
- Reduce frame processing rate
- Use GPU acceleration if available

---

## Contributing

### Development Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes following modularity rules

3. Test your changes
   ```bash
   # Backend
   cd backend && python -m pytest
   
   # Frontend
   cd frontend && npm run test
   ```

4. Commit with clear messages
   ```bash
   git commit -m "feat: add RTSP stream support"
   ```

5. Push and create PR
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Future Improvements

- [ ] User authentication & signup
- [ ] Calendar view for event logs
- [ ] Docker deployment configuration
- [ ] Kubernetes orchestration
- [ ] Real-time notifications
- [ ] Mobile app support
- [ ] Multi-camera support
- [ ] Production scaling & load balancing

---

## License

This project is built for educational and development purposes.

---

## Acknowledgments

- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics)
- [ByteTrack](https://github.com/ifzhang/ByteTrack)
- [Grounding DINO](https://github.com/IDEA-Research/GroundingDINO)
- [Groq](https://groq.com/)
- [Next.js](https://nextjs.org/)
- [Flask](https://flask.palletsprojects.com/)

---

## Support

For questions or issues:
1. Check [Troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

