import csv, io, json, os, uuid
from datetime import date, datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session
from . import models as M, schemas as S, services as svc
from .db import get_db
from .security import hash_password, verify_password, make_token, current_user, admin_only
from .disease_data import get_disease_details

api = APIRouter(prefix="/api/v1")

def row(o):
    return {c.name: getattr(o, c.name) for c in o.__table__.columns if c.name != "password_hash"}

# ---------- Auth ----------
@api.post("/auth/register", status_code=201, tags=["auth"])
def register(data: S.RegisterIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(M.User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")
    role = "admin" if email == os.getenv("ADMIN_EMAIL", "").lower() else "farmer"
    u = M.User(email=email, name=data.name, password_hash=hash_password(data.password), role=role)
    db.add(u); db.commit()
    return row(u)

@api.post("/auth/login", tags=["auth"])
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(M.User).filter_by(email=form.username.lower()).first()
    if not u or not verify_password(form.password, u.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": make_token(u.id), "token_type": "bearer", "user": row(u)}

@api.get("/auth/me", tags=["auth"])
def me(user=Depends(current_user)):
    return row(user)

@api.put("/auth/me", tags=["auth"])
def update_me(data: S.ProfileIn, user=Depends(current_user), db: Session = Depends(get_db)):
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(user, k, v)
    db.commit()
    return row(user)

@api.get("/admin/users", tags=["admin"])
def admin_users(_=Depends(admin_only), db: Session = Depends(get_db)):
    return [row(u) for u in db.query(M.User).order_by(M.User.id)]

# ---------- Generic owned CRUD ----------
def owned_or_404(db, Model, id_, user):
    o = db.get(Model, id_)
    if not o or o.user_id != user.id:
        raise HTTPException(404, f"{Model.__name__} not found")
    return o

def make_crud(path, Model, Schema, parents=()):
    r = APIRouter(prefix=path, tags=[path.strip("/")])
    def check(data, db, user):
        for fk, P in parents:
            if data.get(fk) is not None:
                owned_or_404(db, P, data[fk], user)
    @r.get("")
    def list_(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500), q: str | None = None,
              db: Session = Depends(get_db), user=Depends(current_user)):
        qs = db.query(Model).filter(Model.user_id == user.id)
        if q and hasattr(Model, "name"):
            qs = qs.filter(Model.name.ilike(f"%{q}%"))
        return {"total": qs.count(), "items": [row(i) for i in qs.order_by(Model.id.desc()).offset(skip).limit(limit)]}
    @r.post("", status_code=201)
    def create(data: Schema, db: Session = Depends(get_db), user=Depends(current_user)):
        d = data.model_dump(); check(d, db, user)
        o = Model(user_id=user.id, **d); db.add(o); db.commit(); return row(o)
    @r.get("/{id_}")
    def get_(id_: int, db: Session = Depends(get_db), user=Depends(current_user)):
        return row(owned_or_404(db, Model, id_, user))
    @r.put("/{id_}")
    def update(id_: int, data: Schema, db: Session = Depends(get_db), user=Depends(current_user)):
        o = owned_or_404(db, Model, id_, user); d = data.model_dump(); check(d, db, user)
        for k, v in d.items(): setattr(o, k, v)
        db.commit(); return row(o)
    @r.delete("/{id_}", status_code=204)
    def delete(id_: int, db: Session = Depends(get_db), user=Depends(current_user)):
        db.delete(owned_or_404(db, Model, id_, user)); db.commit()
    return r

api.include_router(make_crud("/farms", M.Farm, S.FarmIn))
api.include_router(make_crud("/fields", M.Field, S.FieldIn, [("farm_id", M.Farm)]))
api.include_router(make_crud("/crops", M.Crop, S.CropIn, [("field_id", M.Field)]))
api.include_router(make_crud("/expenses", M.Expense, S.ExpenseIn, [("crop_id", M.Crop)]))
api.include_router(make_crud("/harvests", M.Harvest, S.HarvestIn, [("crop_id", M.Crop)]))
api.include_router(make_crud("/tasks", M.Task, S.TaskIn, [("crop_id", M.Crop)]))
api.include_router(make_crud("/pest-observations", M.PestObservation, S.PestIn, [("crop_id", M.Crop)]))

# Task completion toggle
@api.post("/tasks/{id_}/toggle", tags=["tasks"])
def toggle_task(id_: int, db: Session = Depends(get_db), user=Depends(current_user)):
    t = owned_or_404(db, M.Task, id_, user)
    t.completed = not t.completed
    db.commit()
    return row(t)

# ---------- Notifications ----------
@api.get("/notifications", tags=["notifications"])
def notifications(db: Session = Depends(get_db), user=Depends(current_user)):
    today = date.today()
    for t in db.query(M.Task).filter(M.Task.user_id == user.id, M.Task.completed == False, M.Task.due_date < today):
        title = f"Overdue: {t.title}"
        if not db.query(M.Notification).filter_by(user_id=user.id, title=title).first():
            db.add(M.Notification(user_id=user.id, title=title, message=f"Task was scheduled for {t.due_date}"))
    db.commit()
    items = db.query(M.Notification).filter_by(user_id=user.id).order_by(M.Notification.id.desc()).limit(100)
    return [row(n) for n in items]

@api.post("/notifications/{id_}/read", tags=["notifications"])
def mark_read(id_: int, db: Session = Depends(get_db), user=Depends(current_user)):
    n = owned_or_404(db, M.Notification, id_, user); n.is_read = True; db.commit(); return row(n)

@api.post("/notifications/read-all", tags=["notifications"])
def mark_all_read(db: Session = Depends(get_db), user=Depends(current_user)):
    db.query(M.Notification).filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.commit()
    return {"status": "ok"}

# ---------- Soil ----------
@api.post("/soil/analyze", tags=["soil"])
def soil_analyze(data: S.SoilIn, db: Session = Depends(get_db), user=Depends(current_user)):
    if data.field_id is not None:
        owned_or_404(db, M.Field, data.field_id, user)
    result = svc.analyze_soil(data.ph, data.nitrogen, data.phosphorus, data.potassium, data.crop_name)
    if data.save:
        d = data.model_dump(exclude={"save"})
        db.add(M.SoilTest(user_id=user.id, **d))
        db.commit()
    return result

@api.get("/soil/history", tags=["soil"])
def soil_history(db: Session = Depends(get_db), user=Depends(current_user)):
    items = db.query(M.SoilTest).filter_by(user_id=user.id).order_by(M.SoilTest.id.desc()).all()
    out = []
    for s in items:
        r = row(s)
        analysis = svc.analyze_soil(s.ph, s.nitrogen, s.phosphorus, s.potassium, s.crop_name)
        r["ratings"] = analysis["ratings"]
        r["recommendations"] = analysis["recommendations"]
        out.append(r)
    return out

# ---------- Disease detection ----------
ALLOWED = {"image/jpeg": b"\xff\xd8\xff", "image/png": b"\x89PNG\r\n\x1a\n"}
MAX_BYTES = 10 * 1024 * 1024

@api.post("/disease/predict", tags=["disease"])
async def disease_predict(file: UploadFile = File(...), crop_id: int | None = Form(None),
                          language: str = Form("en"),
                          db: Session = Depends(get_db), user=Depends(current_user)):
    if file.content_type not in ALLOWED:
        raise HTTPException(415, "Only JPEG or PNG images are allowed")
    content = await file.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(413, "Image larger than 10 MB")
    if not content.startswith(ALLOWED[file.content_type]):
        raise HTTPException(415, "File content does not match image type")
    if crop_id is not None:
        owned_or_404(db, M.Crop, crop_id, user)
        
    up = os.getenv("UPLOAD_DIR", "uploads")
    os.makedirs(up, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{'jpg' if file.content_type == 'image/jpeg' else 'png'}"
    path = os.path.join(up, filename)
    with open(path, "wb") as f:
        f.write(content)
        
    try:
        preds = svc.predict_disease(path, language=language)
    except ImportError:
        raise HTTPException(503, "Model file exists but tensorflow/pillow/numpy are not installed")
    except Exception:
        raise HTTPException(415, "Invalid or unsupported image file")
        
    image_rel_url = f"/uploads/{filename}"
    if preds is None:
        rec = M.DiseaseAnalysis(user_id=user.id, crop_id=crop_id, image_path=path, mode="demo_no_model")
        db.add(rec); db.commit()
        return {
            "id": rec.id,
            "mode": "demo_no_model",
            "predictions": [],
            "image_url": image_rel_url,
            "message": "DEMO MODE: no trained model is configured, so no diagnosis was produced. See docs/AI_MODEL.md."
        }
        
    top = preds[0]
    engine_name = top.get("engine", "model")
    mode_str = "gemini" if "Gemini" in engine_name else "model"
    rec = M.DiseaseAnalysis(user_id=user.id, crop_id=crop_id, image_path=path, mode=mode_str,
                            predicted_label=top["label"], confidence=top["confidence"])
    db.add(rec); db.commit()
    return {
        "id": rec.id,
        "mode": mode_str,
        "engine": engine_name,
        "predictions": preds,
        "top_prediction": top,
        "is_uncertain": top["confidence"] < 0.35,
        "image_url": image_rel_url,
        "created_at": rec.created_at.isoformat(),
        "message": "AI diagnosis generated. Consult a qualified agronomist before taking chemical intervention."
    }

@api.get("/disease/engine-status", tags=["disease"])
def disease_engine_status():
    gemini_key = svc.get_gemini_key()
    has_gemini = bool(gemini_key)
    return {
        "gemini_active": has_gemini,
        "engine": "Google Gemini Vision AI" if has_gemini else "TensorFlow Deep-Learning (Local)",
        "model_available": svc.model_available()
    }

class GeminiKeyIn(BaseModel):
    api_key: str

@api.post("/disease/configure-key", tags=["disease"])
def configure_gemini_key(body: GeminiKeyIn):
    key = body.api_key.strip()
    os.environ["GEMINI_API_KEY"] = key
    env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                content = f.read()
            import re
            if "GEMINI_API_KEY=" in content:
                content = re.sub(r"GEMINI_API_KEY=.*", f"GEMINI_API_KEY={key}", content)
            else:
                content += f"\nGEMINI_API_KEY={key}\n"
            with open(env_file, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception:
            pass
    return {"status": "ok", "gemini_active": len(key) > 10}

@api.get("/disease/history", tags=["disease"])
def disease_history(db: Session = Depends(get_db), user=Depends(current_user)):
    records = db.query(M.DiseaseAnalysis).filter_by(user_id=user.id).order_by(M.DiseaseAnalysis.id.desc()).all()
    out = []
    for d in records:
        r = row(d)
        filename = os.path.basename(d.image_path)
        r["image_url"] = f"/uploads/{filename}"
        if d.predicted_label:
            r["details"] = get_disease_details(d.predicted_label)
        out.append(r)
    return out

@api.delete("/disease/history/{id}", tags=["disease"])
def delete_disease_history_item(id: int, db: Session = Depends(get_db), user=Depends(current_user)):
    rec = db.query(M.DiseaseAnalysis).filter_by(id=id, user_id=user.id).first()
    if not rec:
        raise HTTPException(404, "Disease analysis scan not found")
    if rec.image_path and os.path.exists(rec.image_path):
        try:
            os.remove(rec.image_path)
        except Exception:
            pass
    db.delete(rec)
    db.commit()
    return {"status": "deleted", "id": id}

@api.delete("/disease/history", tags=["disease"])
def delete_all_disease_history(db: Session = Depends(get_db), user=Depends(current_user)):
    records = db.query(M.DiseaseAnalysis).filter_by(user_id=user.id).all()
    count = len(records)
    for rec in records:
        if rec.image_path and os.path.exists(rec.image_path):
            try:
                os.remove(rec.image_path)
            except Exception:
                pass
        db.delete(rec)
    db.commit()
    return {"status": "cleared", "count": count}

# ---------- Weather ----------
@api.get("/weather/forecast", tags=["weather"])
def weather(lat: float = Query(..., ge=-90, le=90), lon: float = Query(..., ge=-180, le=180),
            db: Session = Depends(get_db), _=Depends(current_user)):
    try:
        data = svc.fetch_weather(lat, lon)
    except Exception:
        raise HTTPException(503, "Weather service unavailable. No data is shown rather than fake data.")
    db.add(M.WeatherRecord(latitude=lat, longitude=lon, payload=json.dumps(data), source="Open-Meteo"))
    db.commit()
    return {"source": "Open-Meteo (open-meteo.com)", "fetched_at": datetime.utcnow().isoformat() + "Z", "data": data}

# ---------- Market prices & knowledge ----------
@api.get("/market-prices", tags=["market"])
def market_prices(crop: str | None = None, market: str | None = None, on: date | None = None,
                  skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=200),
                  db: Session = Depends(get_db), _=Depends(current_user)):
    q = db.query(M.MarketPrice)
    if crop: q = q.filter(M.MarketPrice.crop.ilike(f"%{crop}%"))
    if market: q = q.filter(M.MarketPrice.market.ilike(f"%{market}%"))
    if on: q = q.filter(M.MarketPrice.recorded_on == on)
    return {"total": q.count(), "items": [row(p) for p in q.order_by(M.MarketPrice.recorded_on.desc()).offset(skip).limit(limit)]}

class PriceIn(S.BaseModel):
    crop: str; market: str; price: float = S.F(ge=0); unit: str = "INR/quintal"
    source: str; is_sample: bool = False; recorded_on: date

@api.post("/market-prices", status_code=201, tags=["market"])
def add_price(data: PriceIn, _=Depends(admin_only), db: Session = Depends(get_db)):
    p = M.MarketPrice(**data.model_dump())
    db.add(p); db.commit()
    return row(p)

@api.delete("/market-prices/{id_}", status_code=204, tags=["market"])
def delete_price(id_: int, _=Depends(admin_only), db: Session = Depends(get_db)):
    p = db.get(M.MarketPrice, id_)
    if not p: raise HTTPException(404, "Market price record not found")
    db.delete(p); db.commit()

class ArticleIn(S.BaseModel):
    category: str = S.F(min_length=2, max_length=40)
    title_en: str = S.F(min_length=3, max_length=200)
    title_ta: str | None = None
    body_en: str = S.F(min_length=5)
    body_ta: str | None = None

@api.get("/knowledge", tags=["knowledge"])
def knowledge(q: str | None = None, category: str | None = None, lang: str = Query("en", pattern="^(en|ta)$"),
              db: Session = Depends(get_db), _=Depends(current_user)):
    qs = db.query(M.Article)
    if category:
        qs = qs.filter(M.Article.category == category)
    if q:
        qs = qs.filter(M.Article.title_en.ilike(f"%{q}%") | M.Article.body_en.ilike(f"%{q}%") |
                       M.Article.title_ta.ilike(f"%{q}%") | M.Article.body_ta.ilike(f"%{q}%"))
    out = []
    for a in qs.order_by(M.Article.id):
        out.append({
            "id": a.id,
            "category": a.category,
            "title_en": a.title_en,
            "title_ta": a.title_ta,
            "body_en": a.body_en,
            "body_ta": a.body_ta,
            "title": (a.title_ta if lang == "ta" and a.title_ta else a.title_en),
            "body": (a.body_ta if lang == "ta" and a.body_ta else a.body_en),
            "language": "ta" if lang == "ta" and a.title_ta else "en"
        })
    return out

@api.post("/knowledge", status_code=201, tags=["knowledge"])
def create_article(data: ArticleIn, _=Depends(admin_only), db: Session = Depends(get_db)):
    art = M.Article(**data.model_dump())
    db.add(art); db.commit()
    return row(art)

@api.put("/knowledge/{id_}", tags=["knowledge"])
def update_article(id_: int, data: ArticleIn, _=Depends(admin_only), db: Session = Depends(get_db)):
    art = db.get(M.Article, id_)
    if not art: raise HTTPException(404, "Article not found")
    for k, v in data.model_dump().items(): setattr(art, k, v)
    db.commit()
    return row(art)

@api.delete("/knowledge/{id_}", status_code=204, tags=["knowledge"])
def delete_article(id_: int, _=Depends(admin_only), db: Session = Depends(get_db)):
    art = db.get(M.Article, id_)
    if not art: raise HTTPException(404, "Article not found")
    db.delete(art); db.commit()

# ---------- Dashboard & reports ----------
def totals(db, uid):
    cost = db.query(func.coalesce(func.sum(M.Expense.amount), 0)).filter_by(user_id=uid).scalar()
    rev = db.query(func.coalesce(func.sum(M.Harvest.quantity_kg * M.Harvest.price_per_kg), 0)).filter_by(user_id=uid).scalar()
    return {"total_cost": round(cost, 2), "revenue": round(rev, 2), "profit": round(rev - cost, 2)}

@api.get("/dashboard", tags=["dashboard"])
def dashboard(db: Session = Depends(get_db), user=Depends(current_user)):
    c = lambda m, **f: db.query(m).filter_by(user_id=user.id, **f).count()
    today = date.today()
    crops_active = db.query(M.Crop).filter_by(user_id=user.id, status="active").all()
    recent_tasks = db.query(M.Task).filter_by(user_id=user.id).order_by(M.Task.due_date).limit(5).all()
    recent_expenses = db.query(M.Expense).filter_by(user_id=user.id).order_by(M.Expense.spent_on.desc()).limit(5).all()
    recent_disease = db.query(M.DiseaseAnalysis).filter_by(user_id=user.id).order_by(M.DiseaseAnalysis.id.desc()).limit(5).all()
    
    return {
        "farms": c(M.Farm),
        "fields": c(M.Field),
        "crops": c(M.Crop),
        "active_crops_count": len(crops_active),
        "tasks_pending": c(M.Task, completed=False),
        "tasks_overdue": db.query(M.Task).filter(M.Task.user_id == user.id, M.Task.completed == False, M.Task.due_date < today).count(),
        "expected_yield_kg": round(db.query(func.coalesce(func.sum(M.Crop.expected_yield_kg), 0)).filter_by(user_id=user.id, status="active").scalar(), 2),
        "unread_notifications": c(M.Notification, is_read=False),
        "recent_tasks": [row(t) for t in recent_tasks],
        "recent_expenses": [row(e) for e in recent_expenses],
        "recent_disease": [row(d) for d in recent_disease],
        **totals(db, user.id)
    }

@api.get("/reports/summary", tags=["reports"])
def report_summary(format: str = Query("json", pattern="^(json|csv)$"), db: Session = Depends(get_db), user=Depends(current_user)):
    by_cat = db.query(M.Expense.category, func.sum(M.Expense.amount)).filter_by(user_id=user.id).group_by(M.Expense.category).all()
    crops = []
    for cr in db.query(M.Crop).filter_by(user_id=user.id):
        cost = db.query(func.coalesce(func.sum(M.Expense.amount), 0)).filter_by(crop_id=cr.id).scalar()
        rev = db.query(func.coalesce(func.sum(M.Harvest.quantity_kg * M.Harvest.price_per_kg), 0)).filter_by(crop_id=cr.id).scalar()
        crops.append({"crop": cr.name, "status": cr.status, "cost": round(cost, 2), "revenue": round(rev, 2), "profit": round(rev - cost, 2)})
    if format == "csv":
        buf = io.StringIO(); w = csv.DictWriter(buf, fieldnames=["crop", "status", "cost", "revenue", "profit"])
        w.writeheader(); w.writerows(crops)
        return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                                 headers={"Content-Disposition": "attachment; filename=crop_summary.csv"})
    return {
        **totals(db, user.id),
        "expenses_by_category": {k: round(v, 2) for k, v in by_cat},
        "crops": crops
    }
