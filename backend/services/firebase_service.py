import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from config import (
    FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL, FIREBASE_STORAGE_BUCKET
)

_initialized = False
db = None
bucket = None


def init_firebase():
    global _initialized, db, bucket
    if _initialized:
        return
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": FIREBASE_PROJECT_ID,
        "private_key": FIREBASE_PRIVATE_KEY,
        "client_email": FIREBASE_CLIENT_EMAIL,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred, {"storageBucket": FIREBASE_STORAGE_BUCKET})
    db = firestore.client()
    bucket = storage.bucket()
    _initialized = True


def get_db():
    return db


def get_bucket():
    return bucket


def verify_token(token: str) -> dict:
    return auth.verify_id_token(token)


def create_firebase_user(email: str, password: str) -> str:
    user = auth.create_user(email=email, password=password)
    return user.uid
