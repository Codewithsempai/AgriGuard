import os
import sys
from datetime import date, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db import Base, engine, SessionLocal
from app import models as M
from app.security import hash_password

def seed():
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        # Check or create demo farmer
        farmer = db.query(M.User).filter_by(email="demo@farm.com").first()
        if not farmer:
            farmer = M.User(
                email="demo@farm.com",
                name="Senthil Murugan",
                password_hash=hash_password("password123"),
                role="farmer",
                language="en"
            )
            db.add(farmer)
            db.commit()
            print("Created demo farmer: demo@farm.com / password123")

        # Check or create demo admin
        admin = db.query(M.User).filter_by(email="admin@agriguard.com").first()
        if not admin:
            admin = M.User(
                email="admin@agriguard.com",
                name="AgriGuard Admin",
                password_hash=hash_password("admin12345"),
                role="admin",
                language="en"
            )
            db.add(admin)
            db.commit()
            print("Created demo admin: admin@agriguard.com / admin12345")

        # Add sample farm, field, crops, tasks and expenses for demo farmer if none exist
        if db.query(M.Farm).filter_by(user_id=farmer.id).count() == 0:
            farm = M.Farm(
                user_id=farmer.id,
                name="Green Acres Agro Farm",
                location="Pollachi, Tamil Nadu",
                latitude=10.6609,
                longitude=77.0048,
                area_acres=12.5
            )
            db.add(farm)
            db.commit()

            field1 = M.Field(user_id=farmer.id, farm_id=farm.id, name="North Block A", area_acres=4.5, soil_type="Red Sandy Loam")
            field2 = M.Field(user_id=farmer.id, farm_id=farm.id, name="South Block B", area_acres=5.0, soil_type="Black Cotton Soil")
            db.add_all([field1, field2])
            db.commit()

            today = date.today()
            crop1 = M.Crop(
                user_id=farmer.id, field_id=field1.id, name="Tomato", variety="Shivam F1 Hybrid",
                planting_date=today - timedelta(days=35), growth_stage="flowering",
                expected_harvest=today + timedelta(days=40), expected_yield_kg=4500.0, status="active"
            )
            crop2 = M.Crop(
                user_id=farmer.id, field_id=field2.id, name="Paddy (Rice)", variety="CO-51 High Yielding",
                planting_date=today - timedelta(days=60), growth_stage="fruiting",
                expected_harvest=today + timedelta(days=30), expected_yield_kg=6000.0, status="active"
            )
            db.add_all([crop1, crop2])
            db.commit()

            # Add expenses
            db.add_all([
                M.Expense(user_id=farmer.id, crop_id=crop1.id, category="seeds", amount=2400.0, spent_on=today - timedelta(days=35), note="Certified F1 hybrid tomato seeds"),
                M.Expense(user_id=farmer.id, crop_id=crop1.id, category="fertilizer", amount=3600.0, spent_on=today - timedelta(days=20), note="19:19:19 water soluble fertigation pack"),
                M.Expense(user_id=farmer.id, crop_id=crop1.id, category="labor", amount=4000.0, spent_on=today - timedelta(days=10), note="Staking and trellising labor"),
                M.Expense(user_id=farmer.id, crop_id=crop2.id, category="seeds", amount=3100.0, spent_on=today - timedelta(days=60), note="TNAU foundation paddy seed bags"),
                M.Expense(user_id=farmer.id, crop_id=crop2.id, category="irrigation", amount=2200.0, spent_on=today - timedelta(days=15), note="Canal feeder channel maintenance")
            ])

            # Add previous harvest
            db.add(M.Harvest(user_id=farmer.id, crop_id=crop1.id, quantity_kg=850.0, price_per_kg=28.0, harvested_on=today - timedelta(days=2)))

            # Add upcoming and overdue tasks
            db.add_all([
                M.Task(user_id=farmer.id, crop_id=crop1.id, title="Drip fertigation with potassium nitrate", task_type="fertilization", due_date=today + timedelta(days=2), completed=False),
                M.Task(user_id=farmer.id, crop_id=crop1.id, title="Scout lower leaves for early blight target spots", task_type="pest_inspection", due_date=today - timedelta(days=1), completed=False), # Overdue
                M.Task(user_id=farmer.id, crop_id=crop2.id, title="Water depth regulation before panicle emergence", task_type="irrigation", due_date=today + timedelta(days=4), completed=False),
            ])

            # Add soil test
            db.add(M.SoilTest(
                user_id=farmer.id, field_id=field1.id, crop_name="tomato",
                ph=6.4, nitrogen=250.0, phosphorus=18.5, potassium=210.0,
                soil_type="Red Sandy Loam", tested_on=today - timedelta(days=12)
            ))

            db.commit()
            print("Successfully seeded realistic farm demo data!")

if __name__ == "__main__":
    seed()
