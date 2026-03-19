"""
Quick Start Example - MemTracker Pipeline

This script demonstrates how to:
1. Initialize the pipeline with different models
2. Process a video
3. Swap models easily
"""

import cv2
from config import Config
from core.model_factory import create_pipeline

def example_1_default_pipeline():
    """Example 1: Use default pipeline from config."""
    print("\n=== Example 1: Default Pipeline ===")
    
    # Create pipeline with default config
    pipeline = create_pipeline(Config)
    
    print(f"Detector: {Config.DETECTOR_TYPE}")
    print(f"YOLO Model: {Config.YOLO_MODEL_PATH}")
    print(f"Tracker: {Config.TRACKER_TYPE}")
    print(f"Activity: {Config.ACTIVITY_TYPE}")
    print(f"CLIP Model: {Config.CLIP_MODEL_NAME}")
    
    # Process a test frame
    test_frame = cv2.imread('test_image.jpg')
    if test_frame is not None:
        results = pipeline.process_frame(test_frame)
        print(f"\nResults: {results}")


def example_2_process_video():
    """Example 2: Process a video file."""
    print("\n=== Example 2: Process Video ===")
    
    pipeline = create_pipeline(Config)
    
    # Process video
    video_path = 'test_video.mp4'
    output_path = 'output_video.mp4'
    
    try:
        stats = pipeline.process_video(
            video_source=video_path,
            output_path=output_path,
            visualize=True
        )
        
        print("\nProcessing Statistics:")
        print(f"Total Frames: {stats['total_frames']}")
        print(f"Processed Frames: {stats['processed_frames']}")
        print(f"Total Detections: {stats['total_detections']}")
        print(f"Total Tracks: {stats['total_tracks']}")
        print(f"Total Activities: {stats['total_activities']}")
        print(f"Processing Time: {stats['processing_time']:.2f}s")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure test_video.mp4 exists!")


def example_3_swap_models():
    """Example 3: Dynamically swap models."""
    print("\n=== Example 3: Swap Models ===")
    
    from modules.detection.yolo_detector import YOLODetector
    from modules.tracking.deepsort_tracker import DeepSORTTracker
    from modules.activity.zero_shot_activity import ZeroShotActivity
    from core.pipeline import MemTrackerPipeline
    
    # Create pipeline with YOLOv8n (fastest)
    print("\n1. Using YOLOv8n (fastest)")
    detector = YOLODetector(model_path='yolov8n.pt', confidence=0.5)
    tracker = DeepSORTTracker()
    activity_model = ZeroShotActivity()
    
    pipeline_fast = MemTrackerPipeline(detector, tracker, activity_model)
    print("Pipeline created with YOLOv8n")
    
    # Swap to YOLOv8m (more accurate)
    print("\n2. Swapping to YOLOv8m (more accurate)")
    detector_accurate = YOLODetector(model_path='yolov8m.pt', confidence=0.6)
    
    pipeline_accurate = MemTrackerPipeline(detector_accurate, tracker, activity_model)
    print("Pipeline created with YOLOv8m")
    
    # Swap activity labels
    print("\n3. Changing activity labels")
    activity_custom = ZeroShotActivity(
        labels=['walking', 'sitting', 'working on computer', 'using phone']
    )
    
    pipeline_custom = MemTrackerPipeline(detector, tracker, activity_custom)
    print("Pipeline created with custom activity labels")


def example_4_webcam_processing():
    """Example 4: Process webcam feed."""
    print("\n=== Example 4: Webcam Processing ===")
    
    pipeline = create_pipeline(Config)
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Cannot open webcam")
        return
    
    print("Processing webcam feed... Press 'q' to quit")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame
            results = pipeline.process_frame(frame)
            
            # Draw results
            frame = pipeline._draw_results(frame, results)
            
            # Display
            cv2.imshow('MemTracker', frame)
            
            # Quit on 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        cap.release()
        cv2.destroyAllWindows()


def example_5_custom_config():
    """Example 5: Use custom configuration."""
    print("\n=== Example 5: Custom Configuration ===")
    
    from modules.detection.yolo_detector import YOLODetector
    from modules.tracking.deepsort_tracker import DeepSORTTracker
    from modules.activity.zero_shot_activity import ZeroShotActivity
    from core.pipeline import MemTrackerPipeline
    
    # Custom detector config
    detector = YOLODetector(
        model_path='yolov8s.pt',
        confidence=0.7,  # Higher confidence
        target_classes=['person', 'car', 'bicycle']  # Multiple classes
    )
    
    # Custom tracker config
    tracker = DeepSORTTracker(
        max_age=50,  # Keep tracks longer
        n_init=5,    # More confirmations needed
        max_cosine_distance=0.3  # Stricter appearance matching
    )
    
    # Custom activity config
    activity_model = ZeroShotActivity(
        model_name='ViT-L-14',  # More accurate CLIP model
        labels=['walking', 'running', 'cycling', 'standing'],
        device='cpu'  # or 'cuda' for GPU
    )
    
    # Create custom pipeline
    pipeline = MemTrackerPipeline(detector, tracker, activity_model, Config)
    
    print("Custom pipeline created with:")
    print("- YOLOv8s with 0.7 confidence")
    print("- DeepSORT with custom params")
    print("- CLIP ViT-L-14 for activities")


if __name__ == "__main__":
    print("=" * 60)
    print("MemTracker Pipeline - Quick Start Examples")
    print("=" * 60)
    
    # Run examples
    example_1_default_pipeline()
    # example_2_process_video()  # Uncomment if you have test video
    example_3_swap_models()
    # example_4_webcam_processing()  # Uncomment to test webcam
    example_5_custom_config()
    
    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)
    print("\nTo swap models, simply:")
    print("1. Edit .env file with new model paths")
    print("2. Or create models programmatically (see examples above)")
    print("3. Restart the Flask server")
    print("\nSee MODEL_SWAPPING_GUIDE.md for detailed instructions!")
