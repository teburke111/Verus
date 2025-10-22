from datetime import datetime

def new_media_doc(user_id, username, stored_path, filename, size_bytes, media_type):
    return {
        "user_id": user_id,              # ObjectId
        "username": username,            # cached for convenience
        "path": stored_path,             # e.g. /data/uploads/<userId>/<filename>
        "filename": filename,
        "size_bytes": size_bytes,
        "media_type": media_type,        # image|text|audio|video
        "verdict": None,                 # filled by inference later
        "confidence": None,
        "status": "uploaded",            # uploaded|processing|complete|error
        "created_at": datetime.utcnow(),
    }

