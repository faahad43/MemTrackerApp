"""Flask routes for video processing pipeline.

These routes handle:
- Processing uploaded videos
- Processing RTSP streams
- Processing individual frames
- Getting pipeline status
"""

from flask import Blueprint, request, jsonify
import os
import cv2
import numpy as np
import base64
import time
from werkzeug.utils import secure_filename

from config import Config

# Create blueprint
pipeline_bp = Blueprint('pipeline', __name__, url_prefix='/api/pipeline')

# Initialize pipeline (lazy loading)
_pipeline = None

def get_pipeline():
    """Get or create pipeline instance (singleton pattern)."""
    global _pipeline
    if _pipeline is None:
        from core.model_factory import create_pipeline
        _pipeline = create_pipeline(Config)
    return _pipeline


@pipeline_bp.route('/status', methods=['GET'])
def get_status():
    """Get pipeline status and configuration."""
    try:
        status = {
            'status': 'ready',
            'config': {
                'detector_type': Config.DETECTOR_TYPE,
                'yolo_model': Config.YOLO_MODEL_PATH,
                'tracker_type': Config.TRACKER_TYPE,
                'activity_type': Config.ACTIVITY_TYPE,
                'clip_model': Config.CLIP_MODEL_NAME,
                'activity_labels': Config.ACTIVITY_LABELS,
                'max_upload_mb': Config.MAX_CONTENT_LENGTH / (1024 * 1024)
            }
        }
        return jsonify(status), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pipeline_bp.route('/process-frame', methods=['POST'])
def process_frame():
    """Process a single frame through the pipeline."""
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'Missing image data'}), 400

        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400

        pipeline = get_pipeline()
        results = pipeline.process_frame(frame)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pipeline_bp.route('/process-video', methods=['POST'])
def process_video():
    """Process an uploaded video file through the full detection → tracking → activity pipeline.
    
    Returns JSON with processing stats AND all detected activities.
    """
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Save uploaded file temporarily
        filename = secure_filename(video_file.filename)
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        upload_path = os.path.join(upload_dir, filename)
        video_file.save(upload_path)

        try:
            pipeline = get_pipeline()
            pipeline.reset()

            cap = cv2.VideoCapture(upload_path)
            if not cap.isOpened():
                return jsonify({'error': 'Cannot open uploaded video'}), 400

            fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            all_activities = []
            stats = {
                'total_frames': total_frames,
                'processed_frames': 0,
                'total_detections': 0,
                'total_tracks': 0,
                'fps': fps,
                'resolution': f'{width}x{height}',
                'filename': video_file.filename,
            }

            start_time = time.time()
            frame_num = 0
            skip = Config.PROCESS_EVERY_N_FRAMES

            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                frame_num += 1

                # Skip frames for performance
                if skip > 1 and frame_num % skip != 0:
                    continue

                results = pipeline.process_frame(frame)
                stats['processed_frames'] += 1
                stats['total_detections'] += len(results.get('detections', []))
                stats['total_tracks'] += len(results.get('tracks', []))

                # Collect activities with frame/time info
                for act in results.get('activities', []):
                    act['frame_number'] = frame_num
                    act['video_time'] = round(frame_num / fps, 2)
                    all_activities.append(act)

            cap.release()
            stats['processing_time'] = round(time.time() - start_time, 2)
            stats['total_activities'] = len(all_activities)

            return jsonify({
                'status': 'completed',
                'stats': stats,
                'activities': all_activities
            }), 200

        finally:
            # Always clean up the uploaded file
            if os.path.exists(upload_path):
                os.remove(upload_path)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pipeline_bp.route('/process-rtsp', methods=['POST'])
def process_rtsp():
    """Start processing an RTSP stream (placeholder)."""
    return jsonify({
        'status': 'not_implemented',
        'message': 'RTSP processing will be implemented with background workers'
    }), 501


@pipeline_bp.route('/reset', methods=['POST'])
def reset_pipeline():
    """Reset pipeline state."""
    try:
        pipeline = get_pipeline()
        pipeline.reset()
        return jsonify({'status': 'success', 'message': 'Pipeline reset'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@pipeline_bp.route('/config', methods=['POST'])
def update_config():
    """Update pipeline configuration dynamically (recreates pipeline)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No configuration provided'}), 400

        updated = []
        if 'yolo_model' in data:
            Config.YOLO_MODEL_PATH = data['yolo_model']
            updated.append('yolo_model')
        if 'yolo_confidence' in data:
            Config.YOLO_CONFIDENCE = float(data['yolo_confidence'])
            updated.append('yolo_confidence')
        if 'activity_labels' in data:
            Config.ACTIVITY_LABELS = data['activity_labels']
            updated.append('activity_labels')

        # Force pipeline recreation
        global _pipeline
        _pipeline = None

        return jsonify({
            'status': 'success',
            'updated_fields': updated,
            'message': 'Pipeline will use new config on next request'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
