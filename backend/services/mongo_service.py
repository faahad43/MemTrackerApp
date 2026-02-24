import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

class MongoService:
    def __init__(self):
        # Pull details from your .env file
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGO_DB_NAME", "MemTracker")
        try:
            self.client = MongoClient(uri)
            self.db = self.client[db_name]
            self.collection = self.db["activity_logs"]
            self.client.admin.command('ping')
            print(f"MongoDB Connected: {db_name}")
        except Exception as e:
            print(f"MongoDB Connection Error: {e}")

    def log_event(self, event_data):
        try:
            result = self.collection.insert_one(event_data)
            return result.inserted_id
        except Exception as e:
            print(f"❌ Failed to log event: {e}")
            return None
mongo_service = MongoService()