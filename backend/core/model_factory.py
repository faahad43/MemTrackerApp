"""Model Factory for creating detector, tracker, and activity recognition models.

This factory pattern makes it easy to swap between different model implementations
by simply changing the configuration settings.
"""

from modules.detection.yolo_detector import YOLODetector
from modules.tracking.deepsort_tracker import DeepSORTTracker
from modules.activity.zero_shot_activity import ZeroShotActivity


class ModelFactory:
    """Factory class for creating computer vision models.
    
    Usage:
        from core.model_factory import ModelFactory
        from config import Config
        
        factory = ModelFactory(Config)
        detector = factory.create_detector()
        tracker = factory.create_tracker()
        activity_model = factory.create_activity_model()
    """
    
    def __init__(self, config):
        """Initialize factory with configuration.
        
        Args:
            config: Configuration object with model settings
        """
        self.config = config
    
    def create_detector(self):
        """Create detector based on configuration.
        
        Returns:
            DetectorInterface implementation (e.g., YOLODetector)
        """
        detector_type = getattr(self.config, 'DETECTOR_TYPE', 'yolo').lower()
        
        if detector_type == 'yolo':
            return YOLODetector(
                model_path=self.config.YOLO_MODEL_PATH,
                confidence=self.config.YOLO_CONFIDENCE,
                target_classes=self.config.YOLO_TARGET_CLASSES
            )
        # Add more detector types here as needed
        # elif detector_type == 'rtdetr':
        #     return RTDETRDetector(...)
        else:
            raise ValueError(f"Unknown detector type: {detector_type}")
    
    def create_tracker(self):
        """Create tracker based on configuration.
        
        Returns:
            TrackerInterface implementation (e.g., DeepSORTTracker)
        """
        tracker_type = getattr(self.config, 'TRACKER_TYPE', 'deepsort').lower()
        
        if tracker_type == 'deepsort':
            return DeepSORTTracker(
                max_age=self.config.DEEPSORT_MAX_AGE,
                n_init=self.config.DEEPSORT_N_INIT,
                nms_max_overlap=self.config.DEEPSORT_NMS_OVERLAP,
                max_cosine_distance=self.config.DEEPSORT_MAX_COSINE_DIST,
                nn_budget=self.config.DEEPSORT_NN_BUDGET,
                embedder=self.config.DEEPSORT_EMBEDDER,
                half=self.config.DEEPSORT_HALF,
                bgr=self.config.DEEPSORT_BGR
            )
        # Add more tracker types here as needed
        # elif tracker_type == 'bytetrack':
        #     return ByteTracker(...)
        else:
            raise ValueError(f"Unknown tracker type: {tracker_type}")
    
    def create_activity_model(self):
        """Create activity recognition model based on configuration.
        
        Returns:
            ActivityInterface implementation (e.g., ZeroShotActivity)
        """
        activity_type = getattr(self.config, 'ACTIVITY_TYPE', 'zero_shot').lower()
        
        if activity_type == 'zero_shot':
            return ZeroShotActivity(
                model_name=self.config.CLIP_MODEL_NAME,
                labels=self.config.ACTIVITY_LABELS,
                device=self.config.CLIP_DEVICE
            )
        # Add more activity model types here as needed
        # elif activity_type == 'lstm':
        #     return LSTMActivity(...)
        else:
            raise ValueError(f"Unknown activity type: {activity_type}")


def create_pipeline(config):
    """Convenience function to create a complete pipeline.
    
    Args:
        config: Configuration object
        
    Returns:
        MemTrackerPipeline instance with all models initialized
    """
    from core.pipeline import MemTrackerPipeline
    
    factory = ModelFactory(config)
    detector = factory.create_detector()
    tracker = factory.create_tracker()
    activity_model = factory.create_activity_model()
    
    return MemTrackerPipeline(detector, tracker, activity_model, config)
