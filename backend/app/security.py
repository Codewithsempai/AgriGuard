import os, hmac, hashlib, secrets, time
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .db import get_db
from .models import User

def secret() -> str:
    return os.getenv("SECRET_KEY", "agriguard-ai-secure-jwt-secret-key-32-bytes-minimum-length-2026")

def hash_password(pw: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 200_000).hex()
    return f"{salt}${h}"

def verify_password(pw: str, stored: str) -> bool:
    salt, h = stored.split("$", 1)
    cand = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 200_000).hex()
    return hmac.compare_digest(cand, h)

def make_token(user_id: int, hours: int = 12) -> str:
    return jwt.encode({"sub": str(user_id), "exp": int(time.time()) + hours * 3600}, secret(), algorithm="HS256")

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> User:
    try:
        uid = int(jwt.decode(token, secret(), algorithms=["HS256"])["sub"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    user = db.get(User, uid)
    if not user:
        raise HTTPException(401, "User not found")
    return user

def admin_only(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user
