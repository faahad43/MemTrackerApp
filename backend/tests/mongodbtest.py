from services.mongo_service import mongo_service

test_data = {"event": "test_connection", "status": "success"}
inserted_id = mongo_service.log_event(test_data)

if inserted_id:
    print(f"🔥 Success! Data saved with ID: {inserted_id}")
else:
    print("Failed to save data.")