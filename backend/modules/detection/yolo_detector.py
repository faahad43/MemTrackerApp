from ultralytics import YOLO
from .detector_interface import DetectorInterface

class YOLODetector(DetectorInterface):
    """YOLO-based object detector implementation.
    
    Supports all YOLO models from Ultralytics (YOLOv8, YOLOv9, YOLOv10, YOLO11, etc.).
    Simply change the model_path to swap between different YOLO versions.
    
    Example model paths:
        - 'yolov8n.pt' (YOLOv8 nano)
        - 'yolov8s.pt' (YOLOv8 small)
        - 'yolov8m.pt' (YOLOv8 medium)
        - 'yolo11n.pt' (YOLO11 nano)
        - 'path/to/custom_model.pt' (custom trained model)
    """
    
    def __init__(self, model_path='yolov8n.pt', confidence=0.5, target_classes=None):
        """Initialize YOLO detector.
        
        Args:
            model_path: Path to YOLO model file (.pt format)
            confidence: Minimum confidence threshold for detections (0.0 to 1.0)
            target_classes: List of class names to detect (e.g., ['person']). 
                          If None, detects all classes.
        """
        self.model = YOLO(model_path)
        self.confidence = confidence
        self.target_classes = target_classes or ['person']
        
    def detect(self, frame):
        """Detect objects in a frame using YOLO.
        
        Args:
            frame: Input image as numpy array (BGR format)
            
        Returns:
            List of detections: [([x, y, w, h], class_id, confidence), ...]
        """
        # Run YOLO inference
        results = self.model.predict(frame, conf=self.confidence, verbose=False)
        result = results[0]
        
        # Convert YOLO results to standard detection format
        detections = self._parse_yolo_results(result)
        return detections
    
    def _parse_yolo_results(self, result):
        """Parse YOLO results into standard detection format.
        
        Args:
            result: YOLO result object
            
        Returns:
            List of detections in format [([x, y, w, h], class_id, confidence), ...]
        """
        boxes = result.boxes
        detections = []
        
        for box in boxes:
            # Extract bounding box coordinates (xyxy format)
            x1, y1, x2, y2 = box.xyxy[0]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            # Convert to xywh format
            w, h = x2 - x1, y2 - y1
            
            # Extract class and confidence
            class_id = int(box.cls[0])
            class_name = result.names[class_id]
            confidence = float(box.conf[0])
            
            # Filter by target classes
            if self.target_classes and class_name not in self.target_classes:
                continue
            
            # Add detection in standard format: ([x, y, w, h], class_id, confidence)
            detections.append(([x1, y1, w, h], class_id, confidence))
        
        return detections
    
    def get_class_names(self):
        """Get list of all class names the model can detect."""
        return self.model.names
