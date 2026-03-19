from flask import Blueprint, jsonify, request
from datetime import datetime, timezone
from collections import defaultdict
from services.mongo_service import mongo_service

# Define the blueprint
activity_bp = Blueprint('activity', __name__)


def _to_timestamp(value):
    """Convert common date/timestamp representations to UNIX timestamp."""
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, datetime):
        return value.replace(tzinfo=timezone.utc).timestamp() if value.tzinfo is None else value.timestamp()

    if isinstance(value, str):
        cleaned = value.strip()
        if not cleaned:
            return None

        # Numeric string (epoch seconds)
        try:
            return float(cleaned)
        except ValueError:
            pass

        # ISO date/datetime
        try:
            dt = datetime.fromisoformat(cleaned.replace('Z', '+00:00'))
            return dt.timestamp()
        except ValueError:
            return None

    return None


def _parse_int(value, default, minimum=None, maximum=None):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default

    if minimum is not None:
        parsed = max(minimum, parsed)
    if maximum is not None:
        parsed = min(maximum, parsed)
    return parsed


def _serialize_log(log):
    log["_id"] = str(log["_id"])

    timestamp = log.get("timestamp")
    if isinstance(timestamp, datetime):
        log["timestamp"] = timestamp.isoformat()
        log["timestamp_epoch"] = timestamp.timestamp()
    else:
        ts = _to_timestamp(timestamp)
        log["timestamp_epoch"] = ts

    return log


def _build_filters():
    query_filters = {}

    activity = request.args.get('activity')
    if activity:
        query_filters['activity'] = activity

    track_id = request.args.get('track_id')
    if track_id is not None and track_id != '':
        try:
            query_filters['track_id'] = int(track_id)
        except ValueError:
            query_filters['track_id'] = track_id

    min_confidence = request.args.get('min_confidence')
    if min_confidence is not None and min_confidence != '':
        try:
            query_filters['confidence'] = {'$gte': float(min_confidence)}
        except ValueError:
            pass

    from_ts = _to_timestamp(request.args.get('from'))
    to_ts = _to_timestamp(request.args.get('to'))
    if from_ts is not None or to_ts is not None:
        timestamp_range = {}
        if from_ts is not None:
            timestamp_range['$gte'] = from_ts
        if to_ts is not None:
            timestamp_range['$lte'] = to_ts
        query_filters['timestamp'] = timestamp_range

    return query_filters

@activity_bp.route('/api/logs', methods=['GET'])
def get_activity_logs():
    try:
        if not mongo_service.is_connected():
            return jsonify({"error": "MongoDB is not connected"}), 503

        limit = _parse_int(request.args.get('limit'), default=50, minimum=1, maximum=500)
        skip = _parse_int(request.args.get('skip'), default=0, minimum=0)

        filters = _build_filters()
        collection = mongo_service.collection

        total = collection.count_documents(filters)
        logs_cursor = collection.find(filters).sort("_id", -1).skip(skip).limit(limit)
        logs = [_serialize_log(log) for log in logs_cursor]

        return jsonify({
            'items': logs,
            'pagination': {
                'total': total,
                'limit': limit,
                'skip': skip,
                'has_more': skip + len(logs) < total
            },
            'filters': {
                'activity': request.args.get('activity'),
                'track_id': request.args.get('track_id'),
                'from': request.args.get('from'),
                'to': request.args.get('to'),
                'min_confidence': request.args.get('min_confidence')
            }
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch logs: {str(e)}"}), 500


@activity_bp.route('/api/logs/summary', methods=['GET'])
def get_activity_summary():
    try:
        if not mongo_service.is_connected():
            return jsonify({"error": "MongoDB is not connected"}), 503

        filters = _build_filters()
        collection = mongo_service.collection
        logs = list(collection.find(filters, {'activity': 1, 'track_id': 1, 'confidence': 1, 'timestamp': 1}))

        by_activity = defaultdict(lambda: {'count': 0, 'total_confidence': 0.0})
        unique_tracks = set()
        total_confidence = 0.0

        for log in logs:
            activity = log.get('activity', 'unknown')
            confidence = float(log.get('confidence', 0.0) or 0.0)

            by_activity[activity]['count'] += 1
            by_activity[activity]['total_confidence'] += confidence
            total_confidence += confidence

            track_id = log.get('track_id')
            if track_id is not None:
                unique_tracks.add(track_id)

        by_activity_payload = []
        for name, values in sorted(by_activity.items(), key=lambda item: item[1]['count'], reverse=True):
            avg = values['total_confidence'] / values['count'] if values['count'] else 0
            by_activity_payload.append({
                'activity': name,
                'count': values['count'],
                'average_confidence': round(avg, 6)
            })

        total_logs = len(logs)
        avg_conf = total_confidence / total_logs if total_logs else 0

        return jsonify({
            'total_logs': total_logs,
            'unique_tracks': len(unique_tracks),
            'average_confidence': round(avg_conf, 6),
            'by_activity': by_activity_payload
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch summary: {str(e)}"}), 500


@activity_bp.route('/api/logs/daily', methods=['GET'])
def get_daily_activity_counts():
    try:
        if not mongo_service.is_connected():
            return jsonify({"error": "MongoDB is not connected"}), 503

        filters = _build_filters()
        collection = mongo_service.collection
        logs = list(collection.find(filters, {'timestamp': 1, 'activity': 1}))

        by_day = defaultdict(lambda: {'count': 0, 'activities': defaultdict(int)})

        for log in logs:
            ts = _to_timestamp(log.get('timestamp'))
            if ts is None:
                continue

            day_key = datetime.fromtimestamp(ts, tz=timezone.utc).strftime('%Y-%m-%d')
            activity = log.get('activity', 'unknown')

            by_day[day_key]['count'] += 1
            by_day[day_key]['activities'][activity] += 1

        payload = []
        for day in sorted(by_day.keys()):
            payload.append({
                'date': day,
                'count': by_day[day]['count'],
                'activities': dict(sorted(by_day[day]['activities'].items()))
            })

        return jsonify({'days': payload}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch daily counts: {str(e)}"}), 500