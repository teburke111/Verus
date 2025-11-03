import time
import jwt
from config.settings import settings
# Import specific exceptions for better error handling
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

def create_jwt(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = int(time.time()) + settings.JWT_EXPIRES_SECONDS
    
    # FIX: Changed JWT_SECRET to JWT_SECRET_KEY for consistency
    token = jwt.encode(data, settings.JWT_SECRET_KEY, algorithm="HS256")
    
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

def decode_jwt(token: str) -> dict | None:
    try:
        # FIX: Changed JWT_SECRET to JWT_SECRET_KEY to match app config
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    except ExpiredSignatureError:
        return None
    except InvalidTokenError:
        return None
    # Added a catch-all for the original AttributeError (or other issues)
    except Exception as e:
        # Log the error if necessary, but return None to continue flow
        print(f"Error decoding JWT: {e}") 
        return None

