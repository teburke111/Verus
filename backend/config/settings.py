# backend/config/settings.py
import os

class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
    DB_NAME = os.getenv("DB_NAME", "verus_db")
    UPLOAD_ROOT = os.getenv("UPLOAD_ROOT", "./uploads")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "A-very-long-and-secure-default-secret-key-1234567890ABCDEF")
    JWT_EXPIRES_SECONDS = int(os.getenv("JWT_EXPIRES_SECONDS", 3600))

    GLOBAL_MAX_UPLOAD_BYTES = 200 * 1024 * 1024  # 200 MB
    PER_USER_QUOTA_BYTES = 500 * 1024 * 1024     # 500 MB total/user
    MAX_IMAGE_BYTES = 10 * 1024 * 1024
    MAX_TEXT_BYTES = 1 * 1024 * 1024
    MAX_AUDIO_BYTES = 50 * 1024 * 1024
    MAX_VIDEO_BYTES = 150 * 1024 * 1024
    CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]

settings = Settings()
