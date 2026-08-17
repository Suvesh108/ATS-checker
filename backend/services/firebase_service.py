import os
import json
import uuid

# File-based local database path
DB_FILE = os.path.join(os.path.dirname(__file__), "..", "local_db.json")

def load_db() -> dict:
    if not os.path.exists(DB_FILE):
        return {}
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_db(data: dict):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

# ─── Mock Firestore Classes ──────────────────────────────────────────────────

class MockDocument:
    def __init__(self, collection_name, doc_id, data=None):
        self.collection_name = collection_name
        self.id = doc_id
        self._data = data

    @property
    def exists(self) -> bool:
        return self._data is not None

    def to_dict(self) -> dict:
        return self._data or {}

class MockDocRef:
    def __init__(self, collection_name, doc_id):
        self.collection_name = collection_name
        self.id = doc_id

    def get(self) -> MockDocument:
        db_data = load_db()
        doc_data = db_data.get(self.collection_name, {}).get(self.id)
        return MockDocument(self.collection_name, self.id, doc_data)

    def set(self, data: dict):
        db_data = load_db()
        if self.collection_name not in db_data:
            db_data[self.collection_name] = {}
        db_data[self.collection_name][self.id] = data
        save_db(db_data)

    def update(self, data: dict):
        db_data = load_db()
        if self.collection_name in db_data and self.id in db_data[self.collection_name]:
            db_data[self.collection_name][self.id].update(data)
            save_db(db_data)

    def delete(self):
        db_data = load_db()
        if self.collection_name in db_data and self.id in db_data[self.collection_name]:
            del db_data[self.collection_name][self.id]
            save_db(db_data)

class MockQuery:
    def __init__(self, collection_name, filters=None):
        self.collection_name = collection_name
        self.filters = filters or []

    def where(self, field_path, op_string, value) -> 'MockQuery':
        new_filters = self.filters + [(field_path, op_string, value)]
        return MockQuery(self.collection_name, new_filters)

    def stream(self) -> list:
        db_data = load_db()
        docs = db_data.get(self.collection_name, {})
        results = []
        for doc_id, doc_data in docs.items():
            match = True
            for field, op, val in self.filters:
                doc_val = doc_data.get(field)
                if op == "==":
                    if doc_val != val:
                        match = False
                        break
            if match:
                results.append(MockDocument(self.collection_name, doc_id, doc_data))
        return results

class MockCollection:
    def __init__(self, name):
        self.name = name

    def document(self, doc_id=None) -> MockDocRef:
        if doc_id is None:
            doc_id = str(uuid.uuid4())
        return MockDocRef(self.name, doc_id)

    def where(self, field_path, op_string, value) -> MockQuery:
        return MockQuery(self.name, [(field_path, op_string, value)])

class MockFirestore:
    def collection(self, name) -> MockCollection:
        return MockCollection(name)

# ─── Mock Storage Classes ────────────────────────────────────────────────────

class MockBlob:
    def __init__(self, name):
        self.name = name
        self.public_url = f"https://example.com/mock-resumes/{os.path.basename(name)}"

    def upload_from_string(self, data, content_type=None):
        pass

    def make_public(self):
        pass

    def delete(self):
        pass

class MockBucket:
    def blob(self, name) -> MockBlob:
        return MockBlob(name)

# ─── Exports ─────────────────────────────────────────────────────────────────

_initialized = False
db = None
bucket = None

def init_firebase():
    global _initialized, db, bucket
    if _initialized:
        return
    db = MockFirestore()
    bucket = MockBucket()
    _initialized = True

def get_db():
    return db

def get_bucket():
    return bucket

def verify_token(token: str) -> dict:
    # Always return a valid mock user for token verification
    return {
        "uid": "mock-user-123",
        "email": "mockuser@example.com",
        "name": "Mock User",
        "picture": "https://lh3.googleusercontent.com/a/default-user"
    }

def create_firebase_user(email: str, password: str) -> str:
    # Always return mock user ID
    return "mock-user-123"
