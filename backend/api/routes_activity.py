from flask import Blueprint, jsonify
from services.mongo_service import mongo_service

# Define the blueprint
activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/api/logs', methods=['GET'])
def get_activity_logs():
    try:
        # 1. Fetch the latest 50 logs from the collection
        # We sort by _id descending to get the newest ones first
        logs = list(mongo_service.collection.find().sort("_id", -1).limit(50))

        # 2. Format the data for the web (JSON)
        # MongoDB IDs are special objects; we must convert them to strings
        for log in logs:
            log["_id"] = str(log["_id"])
            # If you added timestamps, ensure they are string-formatted
            if "timestamp" in log and hasattr(log["timestamp"], "isoformat"):
                log["timestamp"] = log["timestamp"].isoformat()

        return jsonify(logs), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch logs: {str(e)}"}), 500