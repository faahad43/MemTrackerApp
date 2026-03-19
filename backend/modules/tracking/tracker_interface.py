from abc import ABC, abstractmethod

class TrackerInterface(ABC):
    """Abstract base class for object tracking models.
    
    This interface ensures all trackers implement the track() method,
    making it easy to swap between different tracking algorithms (DeepSORT, ByteTrack, etc.)
    """
    
    @abstractmethod
    def track(self, detections, frame):
        """Track detected objects across frames.
        
        Args:
            detections: List of detections from detector in format [([x, y, w, h], class_id, conf), ...]
            frame: Current frame as numpy array (BGR format)
            
        Returns:
            List of Track objects with attributes: track_id, bbox, class_id, confidence
        """
        pass


class Track:
    """Data class representing a tracked object."""
    
    def __init__(self, track_id, bbox, class_id=0, confidence=1.0):
        self.track_id = track_id
        self.bbox = bbox  # [x1, y1, x2, y2] format
        self.class_id = class_id
        self.confidence = confidence
    
    def to_dict(self):
        """Convert track to dictionary."""
        return {
            'track_id': self.track_id,
            'bbox': self.bbox,
            'class_id': self.class_id,
            'confidence': self.confidence
        }