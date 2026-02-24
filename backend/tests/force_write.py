from services.mongo_service import mongo_service
from datetime import datetime, UTC

print(" Attempting to send data to MongoDB...")

test_data = {
    "track_id": 999,
    "activity": "verification_test",
    "confidence": 1.0,
    "timestamp":  datetime.now(UTC)
}

try:
    inserted_id = mongo_service.log_event(test_data)
    if inserted_id:
        print(f" Document created with ID: {inserted_id}")
    else:
        print("The service returned None. Check your connection string.")
except Exception as e:
    print(f"Error during write: {e}")