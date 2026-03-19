from deep_sort_realtime.deepsort_tracker import DeepSort
from .tracker_interface import TrackerInterface, Track

class DeepSORTTracker(TrackerInterface):
    """DeepSORT-based object tracker implementation.
    
    DeepSORT combines appearance features with motion to track objects across frames.
    Configure parameters in __init__ to tune tracking performance.
    """
    
    def __init__(self, 
                 max_age=30,
                 n_init=3,
                 nms_max_overlap=0.3,
                 max_cosine_distance=0.4,
                 nn_budget=None,
                 embedder='mobilenet',
                 half=True,
                 bgr=True):
        """Initialize DeepSORT tracker.
        
        Args:
            max_age: Maximum frames to keep track alive without detections
            n_init: Number of consecutive detections before track is confirmed
            nms_max_overlap: Non-maximum suppression threshold
            max_cosine_distance: Maximum cosine distance for matching
            nn_budget: Maximum size of appearance feature budget (None = no limit)
            embedder: Feature embedder model ('mobilenet', 'torchreid', etc.)
            half: Use FP16 for faster inference
            bgr: Whether input images are in BGR format
        """
        self.tracker = DeepSort(
            max_age=max_age,
            n_init=n_init,
            nms_max_overlap=nms_max_overlap,
            max_cosine_distance=max_cosine_distance,
            nn_budget=nn_budget,
            override_track_class=None,
            embedder=embedder,
            half=half,
            bgr=bgr,
            embedder_model_name=None,
            embedder_wts=None,
            polygon=False,
            today=None
        )
    
    def track(self, detections, frame):
        """Track objects across frames using DeepSORT.
        
        Args:
            detections: List from detector [([x, y, w, h], class_id, conf), ...]
            frame: Current frame as numpy array (BGR format)
            
        Returns:
            List of Track objects with track_id, bbox, class_id, confidence
        """
        # Update tracker with new detections
        tracks = self.tracker.update_tracks(detections, frame=frame)
        
        # Convert to Track objects
        tracked_objects = []
        for track in tracks:
            # Only return confirmed tracks
            if not track.is_confirmed():
                continue
            
            # Get bounding box in ltrb (left, top, right, bottom) format
            ltrb = track.to_ltrb()
            
            # Create Track object
            track_obj = Track(
                track_id=track.track_id,
                bbox=ltrb,  # [x1, y1, x2, y2]
                class_id=track.det_class if hasattr(track, 'det_class') else 0,
                confidence=track.det_conf if hasattr(track, 'det_conf') else 1.0
            )
            tracked_objects.append(track_obj)
        
        return tracked_objects
    
    def reset(self):
        """Reset tracker state (useful when switching videos)."""
        self.tracker = DeepSort(
            max_age=self.tracker.max_age,
            n_init=self.tracker.n_init,
            nms_max_overlap=self.tracker.nms_max_overlap,
            max_cosine_distance=self.tracker.max_cosine_distance,
        )
