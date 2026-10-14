# AgriGuard AI — System Architecture Document

## 1. Overview
AgriGuard AI is an enterprise-grade precision agriculture SaaS web application designed for farmers, agronomists, and agricultural administrators. The platform delivers deep-learning crop leaf disease diagnostics, scientific rule-based soil health evaluation, agrometeorological weather intelligence, farm plot management, and financial ledgers.

## 2. High-Level Architecture
```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (TypeScript, Vite, Tailwind CSS, Recharts, Lucide)   │
│         English & Tamil Bilingual UI / Dark Mode       │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST (JSON / Multipart)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 FastAPI REST Backend                   │
│   • JWT Auth & PBKDF2 Password Security                │
│   • Agronomic Soil Rule Engine                         │
│   • Open-Meteo High-Resolution Weather Proxy           │
│   • Agricultural Knowledge Hub                         │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  TensorFlow / Keras CNN  │  │   SQLite Local Database  │
│  PlantVillage Classifier │  │    (SQLAlchemy Models)   │
│  (10 Diagnostic Classes) │  │  User-Isolated Ownership │
└──────────────────────────┘  └──────────────────────────┘
```

## 3. Component Details

### A. Frontend Layer
- **Framework:** React 19 with Vite bundler and TypeScript.
- **Styling:** Tailwind CSS with custom forest-green theme palette and responsive dark mode.
- **Routing:** React Router v7 with protected route guards and role-based administration walls.
- **Data Visualization:** Recharts for 7-day temperature trends, daily precipitation volumes, expense category distributions, and crop profitability comparisons.
- **Internationalization:** Custom English and Tamil context (`LanguageContext`) translating all navigation menus, KPIs, diagnostic advisories, and form prompts.

### B. Backend Layer
- **Framework:** FastAPI with Python 3.14.
- **Architecture:** Modular routing under `/api/v1` separating authentication, owned CRUD routers, AI prediction, soil analysis, weather, and administrative endpoints.
- **Security:**
  - Passwords hashed using PBKDF2-HMAC-SHA256 with 200,000 iterations and 16-byte random salt.
  - Authentication tokens issued as signed HMAC-SHA256 JSON Web Tokens (HS256) with 12-hour expiration.
  - User data isolation strictly enforced via `Owned` foreign key verification.
- **Image Upload Management:**
  - Magic byte verification (`\xff\xd8\xff` for JPEG, `\x89PNG` for PNG).
  - 10 MB maximum payload cap.
  - Cryptographically secure UUID-based filenames avoiding directory traversal vulnerabilities.
  - Static file delivery via mounted `/uploads` endpoint.

### C. Deep-Learning Disease Classifier
- **Engine:** TensorFlow 2.22 / Keras.
- **Architecture:** Convolutional Neural Network (CNN) with 224x224 RGB input, convolutional feature extractors, global average pooling, and softmax output.
- **Calibrated Disease Classes:**
  1. `Tomato___Early_blight`
  2. `Tomato___Late_blight`
  3. `Tomato___Leaf_Mold`
  4. `Tomato___healthy`
  5. `Potato___Early_blight`
  6. `Potato___Late_blight`
  7. `Potato___healthy`
  8. `Corn_(maize)___Common_rust`
  9. `Pepper,_bell___Bacterial_spot`
  10. `Rice___Brown_Spot`
- **Output:** Top-3 confidence probabilities accompanied by pathogen details, cultural treatments, biological controls, and targeted chemical guidance.

### D. Soil Health Rule Engine
- Transparent, explainable agronomic thresholds (kg/ha) for available Nitrogen (280/560), Phosphorus (11/25), and Potassium (110/280).
- Soil pH classification: Acidic (< 5.5, liming recommendations), Neutral (6.0 - 7.5), Alkaline (> 8.0, gypsum & organic matter recommendations).
- Crop-specific nutritional notes for Rice, Maize, Tomato, Groundnut, Wheat, Cotton, and Chilli.

### E. Weather Intelligence
- Real-time proxy to the Open-Meteo High-Resolution meteorological service.
- 7-day forecasts including maximum/minimum temperatures, humidity, wind speed, and precipitation sums.
- Spray window advisories alerting against chemical runoff during high rainfall or spray drift during high winds.
- Transparent offline handling returning clear indicators rather than fabricated weather data.
