# 🌾 AgriGuard AI — Enterprise Precision Agriculture Platform

> **Created by:** Dayanithi  
> **License:** Non-Commercial License (Modifications Allowed • Cannot Be Sold)  
> **Architecture:** Modern Monolithic Hybrid (React 19 + TypeScript + FastAPI + SQLite + Gemini Vision AI)

---

## 📖 Overview

**AgriGuard AI** is a precision agricultural SaaS platform built to empower farmers, agronomists, and farm managers with AI-powered disease diagnostics, global weather forecasting, soil health advisory, crop lifecycle tracking, and farm financial management.

The system is engineered for local offline execution on Windows using SQLite, requiring **no MySQL, no external database servers, no XAMPP, and no IoT hardware**.

---

## ✨ Key Features

1. **🌿 AI Crop Disease Detection (Google Gemini Multimodal Vision + TensorFlow):**
   - High-confidence leaf pathology diagnosis from image uploads.
   - Evidence-based treatment guidance (Cultural, Biological, Chemical, and Prevention).
   - **Full Bilingual Support:** AI diagnoses, visible symptoms, and treatment protocols are rendered in **English** or **Tamil (தமிழ்)**.
2. **🗑️ Detection History Management:**
   - Chronological archive of all leaf scans and treatment plans.
   - Delete scans **one-by-one** with image cleanup, or **Clear All History** in one click with confirmation.
3. **🌍 Global Weather Intelligence (Open-Meteo):**
   - Search **any city, town, village, or district worldwide** with live geocoding auto-complete.
   - **One-tap GPS Location:** Fetch pinpoint agrometeorological data right at your field coordinates.
   - Quick agricultural hub buttons (*Coimbatore, Thanjavur, Madurai, Salem, Punjab, Nashik, Bengaluru, Delhi*).
   - Direct manual coordinates entry (Latitude / Longitude).
   - 7-day temperature trends, rainfall accumulation, and chemical spray window advisory.
4. **🌱 Soil Health & Fertility Advisor:**
   - Rule-based agronomic evaluator assessing Available N, P, K (kg/ha) and pH.
   - Tailored recommendations for agricultural lime, gypsum, and crop-specific nutrient balance.
5. **📊 Farm Financials & Margin Management:**
   - Multi-category input expense tracking (Seeds, Fertilizer, Labor, Irrigation, Transport).
   - Harvest commodity sales yield logging and automated net profit calculation.
6. **💻 Universal Responsiveness & Collapsible Desktop Sidebar:**
   - **PC / Laptop:** Click the top-left hamburger icon to hide the sidebar into widescreen mode; click again to bring it back.
   - **Mobile / Tablet:** Fixed bottom quick-navigation bar (`Home`, `AI Scan`, `Weather`, `Tasks`, `Menu`) and smooth slide-over drawer with backdrop blur.
7. **🌗 Monochrome Obsidian Luxury UI & Full Dark/Light Mode:**
   - Black & white glassmorphism design with luminous borders, custom scrollbars, and dynamic theme switching.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Recharts, Lucide React, Axios |
| **Backend** | Python 3.14, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite 3, PBKDF2 Password Hashing, JWT |
| **AI / ML** | Google Gemini Vision AI (`gemini-3.5-flash-lite`), TensorFlow 2.22 / Keras, Pillow, NumPy |
| **APIs** | Open-Meteo Weather API & Open-Meteo Geocoding (free, no API key required) |
| **Testing** | Pytest for backend REST API; Vitest & React Testing Library for frontend |

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.11+** (Python 3.12, 3.13, or 3.14 recommended)
- **Node.js 18+** or **20+** (with `npm`)
- **Git** (optional, for cloning)

---

### 2. Backend Setup

Open a terminal (PowerShell or Command Prompt) and navigate to the project directory:

```powershell
cd e:\DT\agriguard\backend
```

#### A. Create and Activate Virtual Environment
```powershell
# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1

# (Or on Windows Command Prompt: .\.venv\Scripts\activate.bat)
```

#### B. Install Python Dependencies
```powershell
pip install -r requirements.txt
```

#### C. Configure Environment Variables
Verify or create `backend/.env` (a template is available in `backend/.env.example`):

```env
SECRET_KEY=change-this-to-a-secure-random-32-byte-string-for-production-deployment-2026
ADMIN_EMAIL=admin@agriguard.com
DATABASE_URL=sqlite:///agriguard.db
UPLOAD_DIR=uploads
MODEL_PATH=models/disease_model.keras
LABELS_PATH=models/labels.json
VITE_API_URL=http://localhost:8000/api/v1

# Optional: Add your Google Gemini API key for high-accuracy multimodal leaf diagnosis
GEMINI_API_KEY=your_gemini_api_key_here
```

#### D. Seed Database with Realistic Demo Data
Populate the SQLite database with sample farms, crops, expenses, harvests, and agricultural knowledge articles:

```powershell
python scripts\seed_demo_data.py
```

---

### 3. Frontend Setup

Open a new terminal or navigate to the `frontend` folder:

```powershell
cd e:\DT\agriguard\frontend
```

#### A. Install Node Modules
```powershell
npm install
```

#### B. Verify Production Build
```powershell
npm run build
```

---

### 4. Running the Application

You can run AgriGuard AI using any of the following methods:

#### Method A: Unified PowerShell Launcher (Recommended)
From the root directory (`e:\DT\agriguard`), run:
```powershell
.\dev.ps1
```
This runs both the FastAPI backend and Vite frontend dev server inside your terminal.

#### Method B: One-Click Batch Script
Double-click or execute from the root directory:
```powershell
.\run_all.bat
```

#### Method C: Manual Terminal Execution

**Terminal 1 — Backend (FastAPI):**
```powershell
cd e:\DT\agriguard\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend (Vite):**
```powershell
cd e:\DT\agriguard\frontend
npm run dev
```

---

## 🌐 Application Access & Credentials

| Service | URL | Description |
|---|---|---|
| **Web Application** | [http://localhost:5173](http://localhost:5173) | Main user interface |
| **API Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI |
| **Alternative API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc API specifications |

### Default Seeded User Credentials

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Farmer (Owner)** | `demo@farm.com` | `password123` | Full access to Farms, Crops, Scans, Expenses & Weather |
| **Administrator** | `admin@agriguard.com` | `admin12345` | System oversight, User management, Knowledge Base admin |

---

## 🧪 Running Automated Tests

### Backend Tests (Pytest)
```powershell
cd e:\DT\agriguard\backend
.\.venv\Scripts\Activate.ps1
python -m pytest -v
```
*(All 9 tests verify auth, CRUD ownership, profit calculations, soil rules, and disease prediction).*

### Frontend Tests (Vitest)
```powershell
cd e:\DT\agriguard\frontend
npm test -- --run
```
*(Tests cover layout rendering, bilingual language switching, theme toggling, and routing).*

---

## 📄 License & Attribution

```
NON-COMMERCIAL SOURCE LICENSE

Copyright (c) 2026 Dayanithi. All rights reserved.
Created by: Dayanithi
```

- **Modification Allowed:** You are free to modify, customize, and extend this codebase for personal, educational, research, and non-commercial farm usage.
- **Cannot Be Sold:** This software, its source code, and its derived assets **CANNOT be sold, monetized, leased, rented, or distributed as part of any commercial product or paid service** without explicit written permission from **Dayanithi**.
- See the full [LICENSE](file:///e:/DT/agriguard/LICENSE) file for complete legal terms.
