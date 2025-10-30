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
    "text":  [".txt"],
    "audio": [".mp3"],
    "video": [".mp4"],
}

def auth_user():
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None, ("missing bearer token", 401)
    payload = decode_jwt(parts[1])
    if not payload:
        return None, ("invalid or expired token", 401)
    user = g.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        return None, ("user not found", 404)
    return user, None

def detect_media_type(filename: str) -> str | None:
    ext = os.path.splitext(filename)[1].lower()
    for mtype, exts in ALLOWED_EXT.items():
        if ext in exts:
            return mtype
    return None

@media_bp.post("/upload")
def upload():
    user, err = auth_user()
    if err:
        msg, code = err
        return jsonify({"error": msg}), code

    if "file" not in request.files:
        return jsonify({"error": "no file provided"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename or "")
    if not filename:
        return jsonify({"error": "invalid filename"}), 400

    media_type = detect_media_type(filename)
    if not media_type:
        return jsonify({"error": "unsupported file type"}), 400

    # Check per-upload limit by media type
    file_bytes = file.read()
    size = len(file_bytes)
    max_allowed = file_limit_for_mediatype(media_type)
    if size > max_allowed:
        return jsonify({"error": f"file too large. limit is {max_allowed // (1024*1024)} MB for {media_type}"}), 413

    # Check quota
    if not can_store_more(user.get("used_bytes", 0), size):
        return jsonify({"error": "storage quota exceeded. delete files to free space"}), 403

    # Save file to user-specific dir
    user_dir = ensure_user_dir(user["_id"])
    stored_path = os.path.join(user_dir, f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}")
    with open(stored_path, "wb") as f:
        f.write(file_bytes)

    # Save metadata
    doc = new_media_doc(
        user_id=user["_id"],
        username=user["username"],
        stored_path=stored_path,
        filename=filename,
        size_bytes=size,
        media_type=media_type
    )
    res = g.media.insert_one(doc)

    # Update user used_bytes
    g.users.update_one(
        {"_id": user["_id"]},
        {"$inc": {"used_bytes": size}, "$set": {"updated_at": datetime.utcnow()}}
    )

    return jsonify({
        "status": "uploaded",
        "media_id": str(res.inserted_id),
        "media_type": media_type,
        "size_bytes": size
    }), 201

@media_bp.get("/my_uploads")
def my_uploads():
    user, err = auth_user()
    if err:
        msg, code = err
        return jsonify({"error": msg}), code

    items = []
    for m in g.media.find({"user_id": user["_id"]}).sort("created_at", -1):
        m["id"] = str(m.pop("_id"))
        m.pop("path", None)  # don’t leak internal paths to clients
        items.append(m)
    return jsonify({"uploads": items}), 200

@media_bp.delete("/delete/<media_id>")
def delete_media(media_id):
    user, err = auth_user()
    if err:
        msg, code = err
        return jsonify({"error": msg}), code

    oid = safe_objectid(media_id)
    if not oid:
        return jsonify({"error": "invalid media id"}), 400

    doc = g.media.find_one({"_id": oid})
    if not doc:
        return jsonify({"error": "not found"}), 404

    # Only owner or admin can delete
    if str(doc["user_id"]) != str(user["_id"]) and not is_admin(user):
        return jsonify({"error": "forbidden"}), 403

    # Remove file from disk
    try:
        if os.path.exists(doc["path"]):
            size = os.path.getsize(doc["path"])
            os.remove(doc["path"])
        else:
            size = doc.get("size_bytes", 0)
    except Exception:
        size = doc.get("size_bytes", 0)

    # Remove metadata
    g.media.delete_one({"_id": oid})

    # Decrement user’s used_bytes if owner
    if str(doc["user_id"]) == str(user["_id"]):
        g.users.update_one(
            {"_id": user["_id"]},
            {"$inc": {"used_bytes": -int(size)}, "$set": {"updated_at": datetime.utcnow()}}
        )

    return jsonify({"status": "deleted"}), 200

@media_bp.get("/admin/all_uploads")
def admin_all_uploads():
    user, err = auth_user()
    if err:
        msg, code = err
        return jsonify({"error": msg}), code

    if not is_admin(user):
        return jsonify({"error": "admin only"}), 403

    items = []
    for m in g.media.find().sort("created_at", -1):
        m["id"] = str(m.pop("_id"))
        m.pop("path", None)
        items.append(m)
    return jsonify({"uploads": items}), 200

