class MongoService:
    def __init__(self):
        # We will add pymongo connection here later
        pass

    def log_event(self, event_data):
        print(f"📡 Mongo Service: Logging {event_data}")
        return True

# Initialize it once so other files can import it
mongo_service = MongoService()