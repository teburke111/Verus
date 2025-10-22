from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import settings
from config.db import init_db
from routes.auth_routes import auth_bp
from routes.media_routes import media_bp

def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = settings.GLOBAL_MAX_UPLOAD_BYTES  # hard stop
    CORS(app, supports_credentials=True, origins=settings.CORS_ALLOWED_ORIGINS)

    # Initialize Mongo
    init_db(app)

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(media_bp, url_prefix="/media")

    @app.route("/healthz")
    def healthz():
        return jsonify({"status": "ok"}), 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=settings.PORT, debug=settings.DEBUG)

