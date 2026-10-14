from datetime import date
from pydantic import BaseModel, EmailStr, Field as F

class RegisterIn(BaseModel):
    email: str = F(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=255)
    name: str = F(min_length=1, max_length=120)
    password: str = F(min_length=8, max_length=128)

class ProfileIn(BaseModel):
    name: str | None = F(default=None, min_length=1, max_length=120)
    language: str | None = F(default=None, pattern="^(en|ta)$")

class FarmIn(BaseModel):
    name: str = F(min_length=1, max_length=120)
    location: str | None = None
    latitude: float | None = F(default=None, ge=-90, le=90)
    longitude: float | None = F(default=None, ge=-180, le=180)
    area_acres: float | None = F(default=None, ge=0)

class FieldIn(BaseModel):
    farm_id: int
    name: str = F(min_length=1, max_length=120)
    area_acres: float | None = F(default=None, ge=0)
    soil_type: str | None = None

class CropIn(BaseModel):
    field_id: int
    name: str = F(min_length=1, max_length=80)
    variety: str | None = None
    planting_date: date | None = None
    growth_stage: str = "sowing"
    expected_harvest: date | None = None
    expected_yield_kg: float | None = F(default=None, ge=0)
    status: str = F(default="active", pattern="^(active|harvested|failed)$")

class ExpenseIn(BaseModel):
    crop_id: int | None = None
    category: str = F(pattern="^(seeds|fertilizer|labor|irrigation|transport|other)$")
    amount: float = F(ge=0)
    spent_on: date
    note: str | None = F(default=None, max_length=300)

class HarvestIn(BaseModel):
    crop_id: int
    quantity_kg: float = F(ge=0)
    price_per_kg: float = F(ge=0)
    harvested_on: date

class TaskIn(BaseModel):
    crop_id: int | None = None
    title: str = F(min_length=1, max_length=200)
    task_type: str = F(pattern="^(sowing|irrigation|fertilization|pest_inspection|harvesting|other)$")
    due_date: date
    completed: bool = False

class PestIn(BaseModel):
    crop_id: int | None = None
    kind: str = F(pattern="^(pest|weed)$")
    description: str = F(min_length=1)
    severity: str = F(default="low", pattern="^(low|medium|high)$")
    observed_on: date = F(default_factory=date.today)

class SoilIn(BaseModel):
    field_id: int | None = None
    crop_name: str | None = None
    ph: float = F(ge=0, le=14)
    nitrogen: float = F(ge=0, description="available N, kg/ha")
    phosphorus: float = F(ge=0, description="available P, kg/ha")
    potassium: float = F(ge=0, description="available K, kg/ha")
    soil_type: str | None = None
    save: bool = True
