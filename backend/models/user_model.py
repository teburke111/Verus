from datetime import datetime

def new_user_doc(username: str, pw_hash: str, role: str = "user"):
    return {
        "username": username,
        "password_hash": pw_hash,
        "role": role,                     # "user" or "admin"
        "used_bytes": 0,                  # running total of stored files
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

