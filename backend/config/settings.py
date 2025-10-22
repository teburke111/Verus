import os

class Settings:
    # Flask
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", "8080"))

    # CORS (front-end service/URL)
    CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")

    # Mongo (use k8s Service name "mongodb" by default)
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/verus_db")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "verus_db")

    # JWT
    JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_ME_IN_PROD")
    JWT_EXPIRES_SECONDS = int(os.getenv("JWT_EXPIRES_SECONDS", "3600"))

    # Storage
    UPLOAD_ROOT = os.getenv("UPLOAD_ROOT", "/data/uploads")  # mount a PVC here
    PER_USER_QUOTA_MB = int(os.getenv("PER_USER_QUOTA_MB", "300"))  # total per user
    PER_USER_QUOTA_BYTES = PER_USER_QUOTA_MB * 1024 * 1024

    # Per-upload limits (reasonable for class project)
    MAX_IMAGE_MB = int(os.getenv("MAX_IMAGE_MB", "10"))
    MAX_TEXT_MB  = int(os.getenv("MAX_TEXT_MB",  "2"))
    MAX_AUDIO_MB = int(os.getenv("MAX_AUDIO_MB", "25"))
    MAX_VIDEO_MB = int(os.getenv("MAX_VIDEO_MB", "100"))

    MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024
    MAX_TEXT_BYTES  = MAX_TEXT_MB  * 1024 * 1024
    MAX_AUDIO_BYTES = MAX_AUDIO_MB * 1024 * 1024
    MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024

    # Hard ceiling (prevents accidental giant posts)
    GLOBAL_MAX_UPLOAD_BYTES = int(os.getenv("GLOBAL_MAX_UPLOAD_BYTES", str(150 * 1024 * 1024)))

settings = Settings()

