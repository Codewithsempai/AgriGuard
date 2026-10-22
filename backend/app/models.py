from datetime import datetime, date, timezone
from sqlalchemy import ForeignKey, String, Float, Date, DateTime, Text, Boolean, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

def now(): return datetime.now(timezone.utc)

class Owned:
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="farmer")
    language: Mapped[str] = mapped_column(String(5), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Farm(Owned, Base):
    __tablename__ = "farms"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    location: Mapped[str | None] = mapped_column(String(200))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    area_acres: Mapped[float | None] = mapped_column(Float)

class Field(Owned, Base):
    __tablename__ = "fields"
    id: Mapped[int] = mapped_column(primary_key=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    area_acres: Mapped[float | None] = mapped_column(Float)
    soil_type: Mapped[str | None] = mapped_column(String(60))

class Crop(Owned, Base):
    __tablename__ = "crops"
    id: Mapped[int] = mapped_column(primary_key=True)
    field_id: Mapped[int] = mapped_column(ForeignKey("fields.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    variety: Mapped[str | None] = mapped_column(String(80))
    planting_date: Mapped[date | None] = mapped_column(Date)
    growth_stage: Mapped[str] = mapped_column(String(40), default="sowing")
    expected_harvest: Mapped[date | None] = mapped_column(Date)
    expected_yield_kg: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default="active")

class Expense(Owned, Base):
    __tablename__ = "expenses"
    __table_args__ = (CheckConstraint("amount >= 0"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    crop_id: Mapped[int | None] = mapped_column(ForeignKey("crops.id", ondelete="SET NULL"), index=True)
    category: Mapped[str] = mapped_column(String(30))
    amount: Mapped[float] = mapped_column(Float)
    spent_on: Mapped[date] = mapped_column(Date)
    note: Mapped[str | None] = mapped_column(String(300))

class Harvest(Owned, Base):
    __tablename__ = "harvests"
    __table_args__ = (CheckConstraint("quantity_kg >= 0 AND price_per_kg >= 0"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id", ondelete="CASCADE"), index=True)
    quantity_kg: Mapped[float] = mapped_column(Float)
    price_per_kg: Mapped[float] = mapped_column(Float)
    harvested_on: Mapped[date] = mapped_column(Date)

class Task(Owned, Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    crop_id: Mapped[int | None] = mapped_column(ForeignKey("crops.id", ondelete="SET NULL"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    task_type: Mapped[str] = mapped_column(String(30))
    due_date: Mapped[date] = mapped_column(Date, index=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

class Notification(Owned, Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text, default="")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class PestObservation(Owned, Base):
    __tablename__ = "pest_observations"
    id: Mapped[int] = mapped_column(primary_key=True)
    crop_id: Mapped[int | None] = mapped_column(ForeignKey("crops.id", ondelete="SET NULL"), index=True)
    kind: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20), default="low")
    observed_on: Mapped[date] = mapped_column(Date, default=date.today)

class MarketPrice(Base):
    __tablename__ = "market_prices"
    id: Mapped[int] = mapped_column(primary_key=True)
    crop: Mapped[str] = mapped_column(String(80), index=True)
    market: Mapped[str] = mapped_column(String(120), index=True)
    price: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20), default="INR/quintal")
    source: Mapped[str] = mapped_column(String(200))
    is_sample: Mapped[bool] = mapped_column(Boolean, default=False)
    recorded_on: Mapped[date] = mapped_column(Date, index=True)

class DiseaseAnalysis(Owned, Base):
    __tablename__ = "disease_analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    crop_id: Mapped[int | None] = mapped_column(ForeignKey("crops.id", ondelete="SET NULL"))
    image_path: Mapped[str] = mapped_column(String(300))
    mode: Mapped[str] = mapped_column(String(20))
    predicted_label: Mapped[str | None] = mapped_column(String(120))
    confidence: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    payload: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(100))
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Article(Base):
    __tablename__ = "articles"
    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    title_en: Mapped[str] = mapped_column(String(200))
    title_ta: Mapped[str | None] = mapped_column(String(200))
    body_en: Mapped[str] = mapped_column(Text)
    body_ta: Mapped[str | None] = mapped_column(Text)
