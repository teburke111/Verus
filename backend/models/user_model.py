from datetime import datetime

def new_user_doc(username: str, pw_hash: str, role: str = "user"):
    """
    Returns a structured MongoDB document for a new user.
    """
    return {
        "username": username,
        "password_hash": pw_hash,
        "role": role,
        "used_bytes": 0,  # Track per-user storage usage
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
