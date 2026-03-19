"""Tracking module for multi-object tracking.

Available implementations:
- DeepSORTTracker: DeepSORT-based tracking with appearance features

To add more trackers:
1. Create a new file implementing TrackerInterface
2. Register in core/model_factory.py
"""

from .tracker_interface import TrackerInterface, Track
from .deepsort_tracker import DeepSORTTracker

__all__ = ['TrackerInterface', 'Track', 'DeepSORTTracker']
