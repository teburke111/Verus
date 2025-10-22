import os
from bson import ObjectId
from flask import current_app
from config.settings import settings

def ensure_user_dir(user_id: str) -> str:
    base = settings.UPLOAD_ROOT
    user_dir = os.path.join(base, str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

def can_store_more(current_used: int, additional: int) -> bool:
    return (current_used + additional) <= settings.PER_USER_QUOTA_BYTES

def is_admin(user_doc) -> bool:
    return user_doc and user_doc.get("role") == "admin"

def file_limit_for_mediatype(media_type: str) -> int:
    if media_type == "image":
        return settings.MAX_IMAGE_BYTES
    if media_type == "text":
        return settings.MAX_TEXT_BYTES
    if media_type == "audio":
        return settings.MAX_AUDIO_BYTES
    if media_type == "video":
        return settings.MAX_VIDEO_BYTES
    return 0

def safe_objectid(id_str: str) -> ObjectId | None:
    try:
        return ObjectId(id_str)
    except Exception:
        return None

