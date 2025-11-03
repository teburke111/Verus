import os
import mimetypes
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from bson import ObjectId
from utils.jwt_helper import decode_jwt
from services.storage_service import (
    ensure_user_dir, can_store_more, file_limit_for_mediatype,
    is_admin, safe_objectid
)
from models.media_model import new_media_doc

media_bp = Blueprint("media", __name__)

ALLOWED_EXT = {
    "image": [".jpg", ".jpeg"],
    "text":  [".txt"],
    "audio": [".mp3"],
    "video": [".mp4"],
}


def get_authenticated_user():
    """Try to decode JWT if present, else return None (anonymous user)."""
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        payload = decode_jwt(parts[1])
        if payload:
            # We use payload["sub"] which is the user's BSON ObjectId, stored as a string
            user = g.users.find_one({"_id": ObjectId(payload["sub"])})
            if user:
                return user
    return None


def detect_media_type(filename: str) -> str | None:
    ext = os.path.splitext(filename)[1].lower()
    for mtype, exts in ALLOWED_EXT.items():
        if ext in exts:
            return mtype
    return None


@media_bp.post("/upload")
def upload():
    user = get_authenticated_user()  # may be None (anonymous)

    # Determine if they want to save this upload
    save_requested = (
        request.form.get("save") == "true" or
        request.args.get("save") == "true"
    )

    if "file" not in request.files:
        return jsonify({"error": "no file provided"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename or "")
    if not filename:
        return jsonify({"error": "invalid filename"}), 400

    media_type = detect_media_type(filename)
    if not media_type:
        return jsonify({"error": "unsupported file type"}), 400

    # Read file bytes once
    file_bytes = file.read()
    size = len(file_bytes)
    max_allowed = file_limit_for_mediatype(media_type)
    if size > max_allowed:
        return jsonify({"error": f"file too large. limit is {max_allowed // (1024*1024)} MB for {media_type}"}), 413

    # If user wants to save, they must be logged in
    if save_requested and not user:
        return jsonify({"error": "login required to save result"}), 401

    # For anonymous uploads, just simulate prediction (no saving)
    if not save_requested:
        # TODO: integrate with inference pod later
        return jsonify({
            "status": "predicted",
            "media_type": media_type,
            "confidence": 0.87,  # mock value
            "message": "anonymous prediction — not saved"
        }), 200

    if not can_store_more(user.get("used_bytes", 0), size):
        return jsonify({"error": "storage quota exceeded"}), 403

    # Save file to user-specific dir
    user_dir = ensure_user_dir(user["_id"])
    stored_path = os.path.join(user_dir, f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}")
    with open(stored_path, "wb") as f:
        f.write(file_bytes)

    doc = new_media_doc(
        user_id=user["_id"],
        username=user["username"],
        stored_path=stored_path,
        filename=filename,
        size_bytes=size,
        media_type=media_type
    )
    res = g.media.insert_one(doc)

    g.users.update_one(
        {"_id": user["_id"]},
        {"$inc": {"used_bytes": size}, "$set": {"updated_at": datetime.utcnow()}}
    )

    return jsonify({
        "status": "uploaded",
        "media_id": str(res.inserted_id),
        "media_type": media_type,
        "saved": True
    }), 201


@media_bp.get("/my_uploads")
def my_uploads():
    """
    Returns a list of all media uploaded by the authenticated user.
    Requires Authorization: Bearer <token>
    """
    user = get_authenticated_user()
    if not user:
        return jsonify({"error": "authentication required"}), 401

    media_cursor = g.media.find(
        {"user_id": user["_id"]},
        {"stored_path": 0}  
    ).sort("uploaded_at", -1) 

    uploads = []
    for doc in media_cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["user_id"] = str(doc.pop("user_id"))
        uploads.append(doc)

    return jsonify({"uploads": uploads}), 200
