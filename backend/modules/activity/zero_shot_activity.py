from .activity_interface import ActivityInterface

class ZeroShotActivity(ActivityInterface):
    def __init__(self):
        self.labels = ["walking", "sitting", "running", "falling"]
        print("✅ Activity Module: Ready")

    def classify(self, tracks, frame):
        # This will eventually return a list of detected activities
        return []