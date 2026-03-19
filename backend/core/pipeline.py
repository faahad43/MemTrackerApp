import cv2
import time
from services.mongo_service import mongo_service

class MemTrackerPipeline:
    """Main pipeline orchestrating detection, tracking, and activity recognition.
    
    This class coordinates the flow:
    1. Detector finds objects in frame
    2. Tracker maintains object IDs across frames
    3. Activity model classifies what each tracked object is doing
    4. Results are logged to MongoDB
    """
    
    def __init__(self, detector, tracker, activity_model, config=None):
        """Initialize pipeline with models.
        
        Args:
            detector: DetectorInterface implementation
            tracker: TrackerInterface implementation
            activity_model: ActivityInterface implementation
            config: Configuration object (optional)
        """
        self.detector = detector
        self.tracker = tracker
        self.activity_model = activity_model
        self.config = config
        self.frame_count = 0
        
    def process_frame(self, frame):
        """Process a single frame through the complete pipeline.
        
        Args:
            frame: Input frame as numpy array (BGR format)
            
        Returns:
            dict: Processing results containing detections, tracks, and activities
        """
        self.frame_count += 1
        results = {
            'frame_count': self.frame_count,
            'timestamp': time.time(),
            'detections': [],
            'tracks': [],
            'activities': []
        }
        
        try:
            # Step 1: Detect objects in frame
            detections = self.detector.detect(frame)
            results['detections'] = detections
            
            if not detections:
                return results
            
            # Step 2: Track objects across frames
            tracks = self.tracker.track(detections, frame)
            results['tracks'] = [track.to_dict() for track in tracks]
            
            if not tracks:
                return results
            
            # Step 3: Classify activities (if enabled)
            if self.config is None or self.config.ENABLE_ACTIVITY_RECOGNITION:
                activities = self.activity_model.classify(tracks, frame)
                results['activities'] = activities
                
                # Step 4: Log events to MongoDB (if enabled)
                if self.config is None or self.config.LOG_TO_MONGODB:
                    self._log_activities(activities, tracks, frame)
            
            return results
            
        except Exception as e:
            print(f"Error processing frame {self.frame_count}: {e}")
            results['error'] = str(e)
            return results
    
    def _log_activities(self, activities, tracks, frame):
        """Log detected activities to MongoDB.
        
        Args:
            activities: List of activity classifications
            tracks: List of Track objects
            frame: Current frame (for extracting crops if needed)
        """
        if not activities:
            return
            
        for activity in activities:
            try:
                # Create event data
                event_data = {
                    'track_id': activity.get('track_id'),
                    'activity': activity.get('activity'),
                    'confidence': activity.get('confidence'),
                    'bbox': activity.get('bbox'),
                    'timestamp': time.time(),
                    'frame_number': self.frame_count
                }
                
                # Log to MongoDB
                mongo_service.log_event(event_data)
                
            except Exception as e:
                print(f"Error logging activity: {e}")
    
    def process_video(self, video_source, output_path=None, visualize=True):
        """Process an entire video through the pipeline.
        
        Args:
            video_source: Path to video file or camera index (0 for webcam)
            output_path: Path to save processed video (optional)
            visualize: Whether to draw bounding boxes and labels
            
        Returns:
            dict: Summary statistics of processed video
        """
        cap = cv2.VideoCapture(video_source)
        
        if not cap.isOpened():
            raise ValueError(f"Cannot open video source: {video_source}")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Initialize video writer if output path provided
        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Processing statistics
        stats = {
            'total_frames': total_frames,
            'processed_frames': 0,
            'total_detections': 0,
            'total_tracks': 0,
            'total_activities': 0,
            'processing_time': 0
        }
        
        start_time = time.time()
        frame_num = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_num += 1
            
            # Skip frames if configured
            if self.config and self.config.PROCESS_EVERY_N_FRAMES > 1:
                if frame_num % self.config.PROCESS_EVERY_N_FRAMES != 0:
                    if writer:
                        writer.write(frame)
                    continue
            
            # Process frame
            results = self.process_frame(frame)
            stats['processed_frames'] += 1
            stats['total_detections'] += len(results['detections'])
            stats['total_tracks'] += len(results['tracks'])
            stats['total_activities'] += len(results['activities'])
            
            # Visualize results
            if visualize:
                frame = self._draw_results(frame, results)
            
            # Write frame
            if writer:
                writer.write(frame)
            
            # Show progress
            if frame_num % 30 == 0:
                print(f"Processed {frame_num}/{total_frames} frames")
        
        # Cleanup
        stats['processing_time'] = time.time() - start_time
        cap.release()
        if writer:
            writer.release()
        
        return stats
    
    def _draw_results(self, frame, results):
        """Draw bounding boxes and labels on frame.
        
        Args:
            frame: Input frame
            results: Processing results from process_frame()
            
        Returns:
            frame: Annotated frame
        """
        # Draw tracks
        for track_dict in results['tracks']:
            bbox = track_dict['bbox']
            x1, y1, x2, y2 = map(int, bbox)
            track_id = track_dict['track_id']
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw track ID
            label = f"ID: {track_id}"
            cv2.putText(frame, label, (x1, y1 - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Draw activities
        for activity in results['activities']:
            bbox = activity.get('bbox', [0, 0, 0, 0])
            x1, y1, x2, y2 = map(int, bbox)
            activity_label = activity.get('activity', 'unknown')
            confidence = activity.get('confidence', 0.0)
            
            # Draw activity label
            label = f"{activity_label}: {confidence:.2f}"
            cv2.putText(frame, label, (x1, y2 + 20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
        
        return frame
    
    def reset(self):
        """Reset pipeline state (useful when switching videos)."""
        self.frame_count = 0
        if hasattr(self.tracker, 'reset'):
            self.tracker.reset()