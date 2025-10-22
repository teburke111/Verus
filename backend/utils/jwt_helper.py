import time
import jwt
from config.settings import settings

def create_jwt(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = int(time.time()) + settings.JWT_EXPIRES_SECONDS
    token = jwt.encode(data, settings.JWT_SECRET, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

