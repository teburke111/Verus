# backend/config/db.py
from flask import g
from pymongo import MongoClient, errors
from config.settings import settings

client = None
db = None  # global db object

def init_db(app):
    global client, db
    try:
        client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        # Test connection immediately
        client.server_info()
        print(f"✅ Connected to MongoDB at {settings.MONGO_URI}")
        db = client[settings.DB_NAME]
    except errors.ServerSelectionTimeoutError as e:
        print(f"❌ Failed to connect to MongoDB at {settings.MONGO_URI}: {e}")
        db = None

    # attach to Flask global context
    @app.before_request
    def before_request():
        if db is not None:
            g.db = db
            g.users = db["users"]
            g.media = db["media"]
        else:
            g.db = None
            g.users = None
            g.media = None

    @app.teardown_appcontext
    def teardown(exception):
        pass
