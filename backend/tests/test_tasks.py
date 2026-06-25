import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base, get_db
from main import app

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def get_token():
    client.post("/api/auth/register", json={"username": "testuser", "email": "test@example.com", "password": "pass123"})
    res = client.post("/api/auth/login", json={"email": "test@example.com", "password": "pass123"})
    return res.json()["access_token"]

def auth(token): return {"Authorization": f"Bearer {token}"}

def test_register():
    res = client.post("/api/auth/register", json={"username": "user1", "email": "u1@test.com", "password": "pass123"})
    assert res.status_code == 201
    assert "access_token" in res.json()

def test_login():
    client.post("/api/auth/register", json={"username": "user2", "email": "u2@test.com", "password": "pass123"})
    res = client.post("/api/auth/login", json={"email": "u2@test.com", "password": "pass123"})
    assert res.status_code == 200

def test_create_task():
    token = get_token()
    res = client.post("/api/tasks/", json={"title": "Test Task", "priority": "high"}, headers=auth(token))
    assert res.status_code == 201
    assert res.json()["title"] == "Test Task"

def test_get_tasks():
    token = get_token()
    client.post("/api/tasks/", json={"title": "Task 1"}, headers=auth(token))
    client.post("/api/tasks/", json={"title": "Task 2"}, headers=auth(token))
    res = client.get("/api/tasks/", headers=auth(token))
    assert res.status_code == 200
    assert len(res.json()) == 2

def test_update_task():
    token = get_token()
    task_id = client.post("/api/tasks/", json={"title": "Old"}, headers=auth(token)).json()["id"]
    res = client.put(f"/api/tasks/{task_id}", json={"title": "New"}, headers=auth(token))
    assert res.json()["title"] == "New"

def test_delete_task():
    token = get_token()
    task_id = client.post("/api/tasks/", json={"title": "Delete me"}, headers=auth(token)).json()["id"]
    res = client.delete(f"/api/tasks/{task_id}", headers=auth(token))
    assert res.status_code == 204

def test_toggle_complete():
    token = get_token()
    task_id = client.post("/api/tasks/", json={"title": "Toggle"}, headers=auth(token)).json()["id"]
    res = client.patch(f"/api/tasks/{task_id}/complete", headers=auth(token))
    assert res.json()["is_completed"] == True

def test_health():
    assert client.get("/health").status_code == 200
