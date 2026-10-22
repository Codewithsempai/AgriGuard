import os, tempfile
_d = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_d}/t.db"
os.environ["UPLOAD_DIR"] = f"{_d}/up"
os.environ["ADMIN_EMAIL"] = "admin@x.com"
os.environ["MODEL_PATH"] = f"{_d}/none.keras"
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c: yield c

def auth(c, email):
    c.post("/api/v1/auth/register", json={"email": email, "name": "T", "password": "password123"})
    t = c.post("/api/v1/auth/login", data={"username": email, "password": "password123"}).json()["access_token"]
    return {"Authorization": f"Bearer {t}"}

def test_auth_and_protection(client):
    assert client.get("/api/v1/farms").status_code == 401
    assert client.post("/api/v1/auth/register", json={"email": "a@b.com", "name": "x", "password": "short"}).status_code == 422
    h = auth(client, "a@b.com")
    assert client.post("/api/v1/auth/register", json={"email": "a@b.com", "name": "x", "password": "password123"}).status_code == 409
    assert client.post("/api/v1/auth/login", data={"username": "a@b.com", "password": "wrongpass1"}).status_code == 401
    assert "password_hash" not in client.get("/api/v1/auth/me", headers=h).json()

def test_crud_chain_and_ownership(client):
    a, b = auth(client, "own1@x.com"), auth(client, "own2@x.com")
    farm = client.post("/api/v1/farms", json={"name": "F1"}, headers=a).json()
    field = client.post("/api/v1/fields", json={"farm_id": farm["id"], "name": "North"}, headers=a).json()
    crop = client.post("/api/v1/crops", json={"field_id": field["id"], "name": "Rice"}, headers=a).json()
    assert client.get(f"/api/v1/farms/{farm['id']}", headers=b).status_code == 404
    assert client.put(f"/api/v1/farms/{farm['id']}", json={"name": "hack"}, headers=b).status_code == 404
    assert client.delete(f"/api/v1/farms/{farm['id']}", headers=b).status_code == 404
    assert client.post("/api/v1/fields", json={"farm_id": farm["id"], "name": "x"}, headers=b).status_code == 404
    assert client.get("/api/v1/farms", headers=b).json()["total"] == 0
    assert crop["status"] == "active"

def test_profit_report_and_dashboard(client):
    h = auth(client, "money@x.com")
    f = client.post("/api/v1/farms", json={"name": "F"}, headers=h).json()
    fl = client.post("/api/v1/fields", json={"farm_id": f["id"], "name": "A"}, headers=h).json()
    c = client.post("/api/v1/crops", json={"field_id": fl["id"], "name": "Maize"}, headers=h).json()
    client.post("/api/v1/expenses", json={"crop_id": c["id"], "category": "seeds", "amount": 1000, "spent_on": "2026-01-01"}, headers=h)
    client.post("/api/v1/harvests", json={"crop_id": c["id"], "quantity_kg": 500, "price_per_kg": 6, "harvested_on": "2026-05-01"}, headers=h)
    r = client.get("/api/v1/reports/summary", headers=h).json()
    assert (r["total_cost"], r["revenue"], r["profit"]) == (1000, 3000, 2000)
    assert client.get("/api/v1/reports/summary?format=csv", headers=h).text.startswith("crop,status")
    assert client.get("/api/v1/dashboard", headers=h).json()["crops"] == 1

def test_soil_rules(client):
    h = auth(client, "soil@x.com")
    r = client.post("/api/v1/soil/analyze", json={"ph": 5.0, "nitrogen": 100, "phosphorus": 5, "potassium": 300}, headers=h).json()
    assert r["ratings"] == {"nitrogen": "low", "phosphorus": "low", "potassium": "high"}
    assert any(x["nutrient"] == "pH" for x in r["recommendations"])
    assert client.post("/api/v1/soil/analyze", json={"ph": 15, "nitrogen": 1, "phosphorus": 1, "potassium": 1}, headers=h).status_code == 422

def test_disease_upload_validation_and_demo_mode(client):
    h = auth(client, "leaf@x.com")
    bad = client.post("/api/v1/disease/predict", files={"file": ("a.txt", b"hello", "text/plain")}, headers=h)
    assert bad.status_code == 415
    fake = client.post("/api/v1/disease/predict", files={"file": ("a.jpg", b"notajpeg", "image/jpeg")}, headers=h)
    assert fake.status_code == 415
    ok = client.post("/api/v1/disease/predict", files={"file": ("a.jpg", b"\xff\xd8\xff" + b"0" * 50, "image/jpeg")}, headers=h).json()
    assert ok["mode"] == "demo_no_model" and ok["predictions"] == []
    assert len(client.get("/api/v1/disease/history", headers=h).json()) == 1

def test_admin_and_knowledge(client):
    adm, usr = auth(client, "admin@x.com"), auth(client, "plain@x.com")
    assert client.get("/api/v1/admin/users", headers=usr).status_code == 403
    assert client.get("/api/v1/admin/users", headers=adm).status_code == 200
    body = {"crop": "Rice", "market": "Coimbatore", "price": 2200, "source": "test", "is_sample": True, "recorded_on": "2026-10-01"}
    assert client.post("/api/v1/market-prices", json=body, headers=usr).status_code == 403
    assert client.post("/api/v1/market-prices", json=body, headers=adm).status_code == 201
    assert client.get("/api/v1/market-prices?crop=rice", headers=usr).json()["items"][0]["is_sample"] is True
    assert "நீர்" in client.get("/api/v1/knowledge?lang=ta&q=irrigation", headers=usr).json()[0]["title"]

def test_tasks_and_notifications(client):
    h = auth(client, "tasker@x.com")
    f = client.post("/api/v1/farms", json={"name": "TaskFarm"}, headers=h).json()
    fl = client.post("/api/v1/fields", json={"farm_id": f["id"], "name": "East"}, headers=h).json()
    c = client.post("/api/v1/crops", json={"field_id": fl["id"], "name": "Tomato"}, headers=h).json()
    t = client.post("/api/v1/tasks", json={
        "crop_id": c["id"],
        "title": "Irrigate tomatoes",
        "task_type": "irrigation",
        "due_date": "2026-01-01",
        "completed": False
    }, headers=h).json()
    assert t["completed"] is False
    t_toggled = client.post(f"/api/v1/tasks/{t['id']}/toggle", headers=h).json()
    assert t_toggled["completed"] is True
    
    # Overdue task generates notification on read
    client.post("/api/v1/tasks", json={
        "crop_id": c["id"],
        "title": "Overdue fertilizing",
        "task_type": "fertilization",
        "due_date": "2025-01-01",
        "completed": False
    }, headers=h)
    notifs = client.get("/api/v1/notifications", headers=h).json()
    assert len(notifs) >= 1
    assert client.post("/api/v1/notifications/read-all", headers=h).status_code == 200

def test_admin_article_management(client):
    adm, usr = auth(client, "admin2@x.com"), auth(client, "farmer2@x.com")
    art_payload = {
        "category": "pest",
        "title_en": "Aphid Control Methods",
        "title_ta": "அசுவினி கட்டுப்பாடு",
        "body_en": "Use neem oil spray and yellow sticky traps.",
        "body_ta": "வேப்பெண்ணெய் கரைசல் தெளிக்கவும்."
    }
    assert client.post("/api/v1/knowledge", json=art_payload, headers=usr).status_code == 403
    # admin@x.com was registered as admin in earlier test
    adm_real = auth(client, "admin@x.com")
    created = client.post("/api/v1/knowledge", json=art_payload, headers=adm_real).json()
    assert created["title_en"] == "Aphid Control Methods"
    
    updated = client.put(f"/api/v1/knowledge/{created['id']}", json={**art_payload, "title_en": "Aphid Management Updated"}, headers=adm_real).json()
    assert updated["title_en"] == "Aphid Management Updated"
    
    assert client.delete(f"/api/v1/knowledge/{created['id']}", headers=adm_real).status_code == 204
    assert client.get(f"/api/v1/knowledge?q=Aphid", headers=usr).json() == []

def test_real_model_inference_when_configured(client):
    # Temporarily point MODEL_PATH and LABELS_PATH to the saved model
    from PIL import Image
    import io
    img_buf = io.BytesIO()
    Image.new("RGB", (224, 224), color=(34, 139, 34)).save(img_buf, format="JPEG")
    img_bytes = img_buf.getvalue()

    h = auth(client, "ai_tester@x.com")
    # Point to the actual built model in models/
    m_path = os.path.abspath("backend/models/disease_model.keras") if os.path.exists("backend/models/disease_model.keras") else os.path.abspath("models/disease_model.keras")
    l_path = os.path.abspath("backend/models/labels.json") if os.path.exists("backend/models/labels.json") else os.path.abspath("models/labels.json")
    os.environ["MODEL_PATH"] = m_path
    os.environ["LABELS_PATH"] = l_path
    old_key = os.environ.get("GEMINI_API_KEY")
    os.environ["GEMINI_API_KEY"] = ""
    
    try:
        res = client.post("/api/v1/disease/predict", files={"file": ("leaf.jpg", img_bytes, "image/jpeg")}, headers=h)
        assert res.status_code == 200
        data = res.json()
        assert data["mode"] == "model"
        assert len(data["predictions"]) == 3
        assert "confidence" in data["predictions"][0]
        assert "details" in data["predictions"][0]
        assert data["predictions"][0]["details"]["crop"] in ["Tomato", "Potato", "Corn (Maize)", "Bell Pepper / Chilli", "Rice (Paddy)"]
    finally:
        if old_key is not None:
            os.environ["GEMINI_API_KEY"] = old_key

