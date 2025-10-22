from flask import g
from pymongo import MongoClient
from config.settings import settings

_MONGO_CLIENT = None

def get_client():
    global _MONGO_CLIENT
    if _MONGO_CLIENT is None:
        _MONGO_CLIENT = MongoClient(settings.MONGO_URI)
    return _MONGO_CLIENT

def get_db():
    client = get_client()
    return client[settings.MONGO_DB_NAME]

def init_db(app):
    @app.before_request
    def before_request():
        g.db = get_db()
        g.users = g.db["users"]
        g.media = g.db["media"]
        g.media.create_index("user_id")
        g.media.create_index("created_at")
        g.users.create_index("username", unique=True)

