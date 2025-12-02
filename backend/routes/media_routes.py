import os
import requests
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from bson import ObjectId
from utils.jwt_helper import decode_jwt
from services.storage_service import (
    ensure_user_dir, can_store_more, file_limit_for_mediatype,
)
from models.media_model import new_media_doc

media_bp = Blueprint("media", __name__)

ALLOWED_EXT = {
    "image": [".jpg", ".jpeg"],
    "text": [".txt"],
    "audio": [".mp3"],
    "video": [".mp4"],
}

# Kubernetes service URLs for prediction microservices (process services)
PREDICTION_SERVICES = {
    "image": "http://backend-image-process-service:5000",
    "text": "http://backend-text-process-service:5000",
    "video": "http://backend-video-process-service:5000",
    "audio": "http://backend-audio-process-service:5000",
}


def get_authenticated_user():
    """Decode JWT if present, else return None."""
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        payload = decode_jwt(parts[1])
        if payload:
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


def call_prediction_service(media_type: str, file_bytes: bytes, filename: str):
    """Call the appropriate prediction microservice."""
    service_url = PREDICTION_SERVICES.get(media_type)
    if not service_url:
        return {"error": "No prediction service available", "confidence": None}
    
    # Base URL for each predict service (used by process services to forward)
    predict_services = {
        "image": "http://backend-image-predict-service",
        "text": "http://backend-text-predict-service",
        "video": "http://backend-video-predict-service",
        "audio": "http://backend-audio-predict-service",
    }
    base_url = predict_services.get(media_type, "http://backend")
    
    try:
        # Prepare the request based on media type
        if media_type == "text":
            # For text, send the content directly
            files = {'text': (filename, file_bytes, 'text/plain')}
            data = {'Url': base_url}
        elif media_type == "image":
            files = {'image': (filename, file_bytes, 'image/jpeg')}
            data = {'Url': base_url}
        elif media_type == "video":
            files = {'video': (filename, file_bytes, 'video/mp4')}
            data = {'Url': base_url}
        elif media_type == "audio":
            files = {'audio': (filename, file_bytes, 'audio/mpeg')}
            data = {'Url': base_url}
        else:
            return {"error": "Unsupported media type", "confidence": None}
        
        # Call the process service (which will forward to predict service)
        response = requests.post(service_url, files=files, data=data, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            # Extract the prediction message
            prediction_message = result.get('message', result.get('reply', 'Unknown'))
            
            # Try to parse confidence from the message
            # Expected formats: "Prediction: Fake Confidence: 85.2" or "Prediction: 0.8542"
            confidence = None
            if 'Confidence:' in prediction_message:
                try:
                    confidence = float(prediction_message.split('Confidence:')[1].strip().split()[0])
                except:
                    confidence = None
            elif 'Prediction:' in prediction_message:
                try:
                    pred_value = prediction_message.split('Prediction:')[1].strip()
                    # Try to extract just the number
                    import re
                    numbers = re.findall(r'\d+\.?\d*', pred_value)
                    if numbers:
                        confidence = float(numbers[0])
                except:
                    confidence = None
            
            if "Real Video" in prediction_message and confidence is not None:
                confidence -= 50  # subtract 50
                if confidence < 0:
                    confidence = 0
            elif "Real" in prediction_message and confidence is not None:
                confidence = 100 - confidence
            
            return {
                "prediction": prediction_message,
                "confidence": round(confidence, 2),
                "raw_response": result
            }
        else:
            return {"error": f"Prediction service returned {response.status_code}", "confidence": None}
            
    except requests.exceptions.Timeout:
        return {"error": "Prediction service timeout", "confidence": None}
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}", "confidence": None}


@media_bp.post("/upload")
def upload():
    user = get_authenticated_user()
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

    file_bytes = file.read()
    size = len(file_bytes)
    max_allowed = file_limit_for_mediatype(media_type)
    if size > max_allowed:
        return jsonify({
            "error": f"file too large. limit is {max_allowed // (1024*1024)} MB for {media_type}"
        }), 413

    # Call prediction service for all uploads (anonymous or not)
    prediction_result = call_prediction_service(media_type, file_bytes, filename)
    
    print(prediction_result)

    # Anonymous uploads (not saved)
    if not save_requested or not user:
        return jsonify({
            "status": "predicted",
            "media_type": media_type,
            "confidence": prediction_result.get("confidence"),
            "prediction": prediction_result.get("prediction", "Prediction completed"),
            "message": "anonymous prediction — not saved"
        }), 200

    # Storage quota check
    if not can_store_more(user.get("used_bytes", 0), size):
        return jsonify({"error": "storage quota exceeded"}), 403

    # Save to user directory
    user_dir = ensure_user_dir(user["_id"])
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    stored_path = os.path.join(user_dir, f"{timestamp}_{filename}")

    with open(stored_path, "wb") as f:
        f.write(file_bytes)

    # Insert metadata in DB
    doc = new_media_doc(
        user_id=user["_id"],
        username=user["username"],
        stored_path=stored_path,
        filename=filename,
        size_bytes=size,
        media_type=media_type,
        prediction=prediction_result.get("prediction"),
        confidence=prediction_result.get("confidence"),
        raw_prediction=prediction_result.get("raw_response")
    )
    print(prediction_result.get("prediction"))
    print(prediction_result.get("confidence"))
    res = g.media.insert_one(doc)

    # Update user storage usage
    g.users.update_one(
        {"_id": user["_id"]},
        {"$inc": {"used_bytes": size}, "$set": {"updated_at": datetime.utcnow()}}
    )

    return jsonify({
        "status": "uploaded",
        "media_id": str(res.inserted_id),
        "media_type": media_type,
        "confidence": prediction_result.get("confidence"),
        "prediction": prediction_result.get("prediction", "Prediction completed"),
        "saved": True
    }), 201


@media_bp.delete("/clear_uploads")
def clear_uploads():
    """Deletes all uploaded media for the authenticated user."""
    user = get_authenticated_user()
    if not user:
        return jsonify({"error": "authentication required"}), 401

    media_cursor = g.media.find({"user_id": user["_id"]})
    total_deleted = 0
    total_bytes = 0

    for doc in media_cursor:
        path = doc.get("stored_path")
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass  # skip if already removed
        total_deleted += 1
        total_bytes += doc.get("size_bytes", 0)

    # Remove entries from DB
    g.media.delete_many({"user_id": user["_id"]})

    # Reset usage counter
    g.users.update_one(
        {"_id": user["_id"]},
        {"$inc": {"used_bytes": -total_bytes}, "$set": {"updated_at": datetime.utcnow()}}
    )

    return jsonify({
        "status": "cleared",
        "deleted_count": total_deleted
    }), 200


@media_bp.get("/my_uploads")
def my_uploads():
    """Return all media uploaded by the authenticated user."""
    user = get_authenticated_user()
    if not user:
        return jsonify({"error": "authentication required"}), 401

    media_cursor = g.media.find({"user_id": user["_id"]}).sort("uploaded_at", -1)
    uploads = []
    for doc in media_cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["user_id"] = str(doc.pop("user_id"))
        uploads.append(doc)

    return jsonify({"uploads": uploads}), 200
