"""Detection module for object detection.

Available implementations:
- YOLODetector: YOLO-based detection (YOLOv8, YOLO11, etc.)

To add more detectors:
1. Create a new file implementing DetectorInterface
2. Register in core/model_factory.py
"""

from .detector_interface import DetectorInterface
from .yolo_detector import YOLODetector

__all__ = ['DetectorInterface', 'YOLODetector']
