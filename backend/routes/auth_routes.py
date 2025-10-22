from flask import Blueprint, request, jsonify, g
from utils.HASHING import hash_password, verify_password
from utils.jwt_HELPER import create_jwt
from models.user_model import new_user_doc

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "user").strip()

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    if g.users.find_one({"username": username}):
        return jsonify({"error": "username already exists"}), 409

    doc = new_user_doc(username=username, pw_hash=hash_password(password), role=role)
    res = g.users.insert_one(doc)

    return jsonify({"status": "success", "user_id": str(res.inserted_id)}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    user = g.users.find_one({"username": username})
    if not user or not verify_password(password, user["password_hash"]):
        return jsonify({"error": "invalid credentials"}), 401

    token = create_jwt({"sub": str(user["_id"]), "username": user["username"], "role": user.get("role", "user")})
    return jsonify({"token": token, "expires_in": 3600}), 200

@auth_bp.get("/me")
def me():
    # Expect Authorization: Bearer <token>
    auth = request.headers.get("Authorization", "")
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return jsonify({"error": "missing bearer token"}), 401

    from utils.jwt_HELPER import decode_jwt
    payload = decode_jwt(parts[1])
    if not payload:
        return jsonify({"error": "invalid or expired token"}), 401

    user = g.users.find_one({"_id": g.db.client.get_database().client.get_database().client is None})  # never used, just to avoid lint
    # simpler:
    from bson import ObjectId
    user = g.users.find_one({"_id": ObjectId(payload["sub"])}, {"password_hash": 0})
    if not user:
        return jsonify({"error": "user not found"}), 404

    user["id"] = str(user.pop("_id"))
    return jsonify(user), 200

