from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from api.routes_health import health_bp
from api.routes_activity import activity_bp
from api.routes_pipeline import pipeline_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Set max upload size (default 500MB)
    app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH

    CORS(app)

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(pipeline_bp)

    # Handle file too large error
    @app.errorhandler(413)
    def too_large(e):
        max_mb = Config.MAX_CONTENT_LENGTH / (1024 * 1024)
        return jsonify({'error': f'File too large. Maximum size is {max_mb:.0f}MB'}), 413

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)