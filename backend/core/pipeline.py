class MemTrackerPipeline:
    def __init__(self, detector, tracker, activity_model):
        self.detector = detector
        self.tracker = tracker
        self.activity_model = activity_model

    def process_frame(self, frame):
        detections = self.detector.detect(frame)
        tracks = self.tracker.update(detections)
        events = self.activity_model.classify(tracks, frame)
        return events