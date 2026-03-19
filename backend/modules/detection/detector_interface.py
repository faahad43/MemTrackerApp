from abc import ABC, abstractmethod

class DetectorInterface(ABC):
    """Abstract base class for object detection models.
    
    This interface ensures all detectors implement the detect() method,
    making it easy to swap between different detection models (YOLO, RT-DETR, etc.)
    """
    
    @abstractmethod
    def detect(self, frame):
        """Detect objects in a frame.
        
        Args:
            frame: Input image/frame as numpy array (BGR format)
            
        Returns:
            List of detections in format: [([x, y, w, h], class_id, confidence), ...]
            where x, y, w, h define the bounding box
        """
        pass
        