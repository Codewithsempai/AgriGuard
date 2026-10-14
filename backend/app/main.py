import os
from datetime import date
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .db import Base, engine, SessionLocal
from . import models as M
from .api import api

ARTICLES = [
    ("crop-care", "Basic Irrigation Best Practices", "நீர்ப்பாசன அடிப்படைகள் மற்றும் சிறந்த நடைமுறைகள்",
     "Water early in the morning or late in the evening to reduce evaporative loss. Match water volume to crop phenological stage and avoid standing water to prevent root asphyxiation.",
     "அதிகாலை அல்லது மாலையில் நீர் பாய்ச்சுவது ஆவியாதலை குறைக்கும். பயிர் வளர்ச்சி நிலைக்கு ஏற்ப நீரின் அளவை மாற்றவும்; வேர் அழுகலை தடுக்க நீர் தேங்குவதை தவிர்க்கவும்."),
    ("pest", "Integrated Pest Management (IPM) Framework", "ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM)",
     "Scout fields at weekly intervals. Deploy yellow and blue sticky traps, pheromone lures, and conserve predatory spiders and coccinellid beetles. Apply economic threshold levels (ETL) before chemical intervention.",
     "வாரந்தோறும் வயலை கண்காணிக்கவும்; மஞ்சள் மற்றும் நீல ஒட்டும் பொறிகள், இனக்கவர்ச்சி பொறிகளை பயன்படுத்தவும்; நன்மை செய்யும் இயற்கை பூச்சிகளை பாதுகாக்கவும்; பொருளாதார சேத நிலையை தாண்டும்போது மட்டும் மருந்தடிக்கவும்."),
    ("disease", "Preventing Foliar Leaf Blights", "இலை கருகல் நோய் தடுப்பு முறைகள்",
     "Use certified disease-free seeds and seedlings. Avoid late-day overhead sprinklers that leave foliage wet overnight. Maintain row spacing for canopy aeration and destroy infected debris.",
     "சான்றளிக்கப்பட்ட சுத்தமான விதைகளைப் பயன்படுத்தவும். மாலையில் இலைகளில் நீர் தேங்குவதை தவிர்க்கவும்; காற்றோட்டத்திற்கு சீரான இடைவெளி விட்டு நடவு செய்யவும்; நோய் தாக்கிய இலைகளை அகற்றி அழிக்கவும்."),
    ("soil", "Soil Organic Carbon and Micro-Nutrient Management", "மண் கரிம வளம் மற்றும் நுண்ணூட்ட மேலாண்மை",
     "Incorporate well-decomposed FYM (farmyard manure) or vermicompost at 5 tonnes per acre. Apply green manure crops like Sesbania or sunn hemp before main crop cultivation to enhance soil structure and water retention.",
     "ஏக்கருக்கு 5 டன் மக்கிய தொழு உரம் அல்லது மண்புழு உரம் இடவும். தக்கைப்பூண்டு அல்லது சணப்பை போன்ற பசுந்தாள் உரப்பயிர்களை பயிரிட்டு மடக்கி உழுதால் மண்ணின் வளம் மற்றும் நீர்ப்பிடிப்பு திறன் கூடும்."),
    ("weed", "Non-Chemical Weed Management in Row Crops", "களை மேலாண்மை: இரசாயனமற்ற முறைகள்",
     "Utilize organic straw or plastic mulching in vegetable beds. Implement timely inter-cultivation with power weeders at 20 and 40 days after sowing before weeds establish deep root systems.",
     "காய்கறி பயிர்களில் வைக்கோல் அல்லது மல்சிங் தாள்களைப் பயன்படுத்தவும். விதைத்த 20 மற்றும் 40 ஆம் நாட்களில் களையெடுக்கும் கருவிகளைக் கொண்டு இடை உழவு செய்து களைகளை கட்டுப்படுத்தவும்."),
    ("harvest", "Post-Harvest Grain Quality and Moisture Control", "அறுவடைக்கு பின் தானிய பராமரிப்பு",
     "Dry harvested paddy or grains to below 12-14% moisture content before bagging to prevent fungal aflatoxins and storage weevil infestation. Use hermetic storage bags in aerated sheds.",
     "தானியங்களை சேமிக்கும் முன் ஈரப்பதம் 12-14%க்கு குறைவாக இருக்கும் வரை நன்கு உலர்த்தவும். பூஞ்சை மற்றும் வண்டுகள் தாக்குதலை தவிர்க்க காற்றுப்புகாத நவீன பைகளில் சேமிக்கவும்.")
]

SAMPLE_PRICES = [
    ("Tomato", "Coimbatore APMC, TN", 28.5, "INR/kg", "Agmarknet Benchmark Data", True, date.today()),
    ("Paddy (IR-20)", "Madurai Mandi, TN", 2150.0, "INR/quintal", "Agmarknet Benchmark Data", True, date.today()),
    ("Maize", "Dindigul Market, TN", 1950.0, "INR/quintal", "Agmarknet Benchmark Data", True, date.today()),
    ("Onion (Small)", "Tiruchirappalli APMC, TN", 42.0, "INR/kg", "Agmarknet Benchmark Data", True, date.today()),
    ("Groundnut", "Salem Market, TN", 6800.0, "INR/quintal", "Agmarknet Benchmark Data", True, date.today()),
    ("Wheat (Sharbati)", "Khanna Mandi, Punjab", 2450.0, "INR/quintal", "Agmarknet Benchmark Data", True, date.today()),
    ("Cotton (Long Staple)", "Rajkot Mandi, Gujarat", 7200.0, "INR/quintal", "Agmarknet Benchmark Data", True, date.today()),
    ("Potato", "Azadpur APMC, Delhi", 16.0, "INR/kg", "Agmarknet Benchmark Data", True, date.today())
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    upload_dir = os.getenv("UPLOAD_DIR", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    with SessionLocal() as db:
        if db.query(M.Article).count() == 0:
            for c, te, tt, be, bt in ARTICLES:
                db.add(M.Article(category=c, title_en=te, title_ta=tt, body_en=be, body_ta=bt))
            db.commit()
        if db.query(M.MarketPrice).count() == 0:
            for crop, mkt, prc, unt, src, is_smp, dt in SAMPLE_PRICES:
                db.add(M.MarketPrice(crop=crop, market=mkt, price=prc, unit=unt, source=src, is_sample=is_smp, recorded_on=dt))
            db.commit()
    yield

app = FastAPI(
    title="AgriGuard AI API",
    description="Intelligent Agriculture SaaS API for Farm Management, AI Crop Diagnostics, Weather, and Soil Insights",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Vite local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for crop disease image viewing
upload_path = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(upload_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")

app.include_router(api)

@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "app": "AgriGuard AI"}
