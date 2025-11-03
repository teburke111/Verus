# backend/config/db.py
from flask import g
from pymongo import MongoClient
from config.settings import settings

client = None
db = None  # <-- define a global db object

def init_db(app):
    global client, db
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]

    # attach to flask global context
    @app.before_request
    def before_request():
        g.db = db
        g.users = db["users"]
        g.media = db["media"]

    @app.teardown_appcontext
    def teardown(exception):
        pass


