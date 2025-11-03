from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import settings
from config.db import init_db
from routes.auth_routes import auth_bp
from routes.media_routes import media_bp
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = settings.GLOBAL_MAX_UPLOAD_BYTES  # hard stop
    CORS(app, supports_credentials=True, origins=settings.CORS_ALLOWED_ORIGINS)

    app.config["JWT_SECRET_KEY"] = settings.JWT_SECRET_KEY if hasattr(settings, 'JWT_SECRET_KEY') else "a-strong-temporary-key"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600
    jwt = JWTManager(app)

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

