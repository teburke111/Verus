import os
from datetime import datetime
from bson import ObjectId
from werkzeug.utils import secure_filename

from config.db import db
from config.settings import settings
from utils.hashing import hash_password, verify_password
from utils.jwt_helper import create_jwt, decode_jwt


def register_user(username, password, role="user"):
    """Register a new user and store hashed password."""
    existing = db.users.find_one({"username": username})
    if existing:
        return {"error": "Username already exists"}, 400

    hashed_pw = hash_password(password)
    user_doc = {
        "username": username,
        "password": hashed_pw,
        "role": role,
        "used_storage": 0,
        "created_at": datetime.utcnow(),
    }
    db.users.insert_one(user_doc)

    token = create_jwt({"username": username, "role": role})
    return {"message": "User created successfully", "token": token}, 201


def login_user(username, password):
    """Authenticate user and return a JWT."""
    user = db.users.find_one({"username": username})
    if not user or not verify_password(password, user["password"]):
        return {"error": "Invalid username or password"}, 401

    token = create_jwt({"username": username, "role": user["role"]})
    return {"message": "Login successful", "token": token}, 200


def get_user_from_token(token):
    """Decode JWT and fetch user document."""
    try:
        decoded = decode_jwt(token)
        username = decoded.get("username")
        user = db.users.find_one({"username": username})
        return user
    except Exception:
        return None



def ensure_user_dir(user_id: str) -> str:
    """Ensure user-specific directory exists for uploads."""
    base = settings.UPLOAD_ROOT
    user_dir = os.path.join(base, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    return user_dir


def get_user_storage_usage(user_id: str) -> int:
    """Return total used bytes for a user."""
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return user.get("used_storage", 0) if user else 0


def can_store_more(current_used: int, additional: int) -> bool:
    """Check if user can upload more files."""
    return (current_used + additional) <= settings.PER_USER_QUOTA_BYTES


def file_limit_for_mediatype(media_type: str) -> int:
    """Define per-upload limits by media type."""
    limits = {
        "image": settings.MAX_IMAGE_BYTES,
        "text": settings.MAX_TEXT_BYTES,
        "audio": settings.MAX_AUDIO_BYTES,
        "video": settings.MAX_VIDEO_BYTES,
    }
    return limits.get(media_type, 0)


def store_media_file(user_id: str, file, media_type: str):
    """Save uploaded file to user-specific directory and record in DB."""
    filename = secure_filename(file.filename)
    user_dir = ensure_user_dir(user_id)
    file_path = os.path.join(user_dir, filename)
    file.save(file_path)

    file_size = os.path.getsize(file_path)
    max_allowed = file_limit_for_mediatype(media_type)

    if file_size > max_allowed:
        os.remove(file_path)
        return {"error": f"File exceeds {max_allowed / (1024*1024):.1f} MB limit"}, 400

    # Update DB record
    db.media.insert_one({
        "user_id": ObjectId(user_id),
        "filename": filename,
        "file_path": file_path,
        "media_type": media_type,
        "file_size": file_size,
        "created_at": datetime.utcnow(),
    })

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"used_storage": file_size}}
    )

    return {"message": "File uploaded successfully", "filename": filename}, 201


def list_user_uploads(user_id: str):
    """List all media uploaded by a specific user."""
    uploads = list(db.media.find({"user_id": ObjectId(user_id)}, {"_id": 0, "file_path": 0}))
    return {"uploads": uploads}, 200


def clear_user_storage(user_id: str):
    """Delete all uploaded files and reset storage usage."""
    user_dir = ensure_user_dir(user_id)
    for root, _, files in os.walk(user_dir):
        for f in files:
            os.remove(os.path.join(root, f))

    db.media.delete_many({"user_id": ObjectId(user_id)})
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"used_storage": 0}})

    return {"message": "User storage cleared successfully"}, 200




def is_admin(user_doc) -> bool:
    """Check if user has admin privileges."""
    return user_doc and user_doc.get("role") == "admin"

from bson import ObjectId

def safe_objectid(id_str: str):
    """Safely convert a string to an ObjectId, or return None if invalid."""
    try:
        return ObjectId(id_str)
    except Exception:
        return None
