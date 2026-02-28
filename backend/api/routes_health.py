from flask import Blueprint, jsonify

# This variable name must be exactly what is imported in app.py
health_bp = Blueprint("health", __name__)

@health_bp.route("/health")
def health():
    return jsonify({"status": "Backend running"})