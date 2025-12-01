from datetime import datetime
from bson import ObjectId

def new_media_doc(user_id, username, stored_path, filename, size_bytes, media_type, prediction=None, confidence=None, raw_prediction=None):
    """
    Returns a properly structured document for storing media metadata.
    """
    return {
        "user_id": ObjectId(user_id),
        "username": username,
        "path": stored_path,
        "filename": filename,
        "size_bytes": size_bytes,
        "media_type": media_type,
        "prediction": prediction,
        "confidence": confidence,
        "raw_prediction": raw_prediction,
        "created_at": datetime.utcnow(),
        "status": "stored"
    }
