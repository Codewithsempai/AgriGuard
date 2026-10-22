"""Business logic: disease model, weather."""
import json, os
from datetime import datetime
import httpx
from .disease_data import get_disease_details

# --- Disease model ---
_model = None

def get_model_paths():
    env_model = os.getenv("MODEL_PATH")
    env_labels = os.getenv("LABELS_PATH")
    if env_model:
        model_p = env_model if os.path.exists(env_model) else None
    else:
        cand_models = [
            "models/disease_model.keras",
            "backend/models/disease_model.keras",
            os.path.join(os.path.dirname(__file__), "..", "models", "disease_model.keras")
        ]
        model_p = next((p for p in cand_models if os.path.exists(p)), None)

    if env_labels:
        labels_p = env_labels if os.path.exists(env_labels) else None
    else:
        cand_labels = [
            "models/labels.json",
            "backend/models/labels.json",
            os.path.join(os.path.dirname(__file__), "..", "models", "labels.json")
        ]
        labels_p = next((p for p in cand_labels if os.path.exists(p)), None)

    return model_p, labels_p

# --- Disease model & Gemini Vision AI ---
_model = None

def get_model_paths():
    env_model = os.getenv("MODEL_PATH")
    env_labels = os.getenv("LABELS_PATH")
    if env_model:
        model_p = env_model if os.path.exists(env_model) else None
    else:
        cand_models = [
            "models/disease_model.keras",
            "backend/models/disease_model.keras",
            os.path.join(os.path.dirname(__file__), "..", "models", "disease_model.keras")
        ]
        model_p = next((p for p in cand_models if os.path.exists(p)), None)

    if env_labels:
        labels_p = env_labels if os.path.exists(env_labels) else None
    else:
        cand_labels = [
            "models/labels.json",
            "backend/models/labels.json",
            os.path.join(os.path.dirname(__file__), "..", "models", "labels.json")
        ]
        labels_p = next((p for p in cand_labels if os.path.exists(p)), None)

    return model_p, labels_p

def get_gemini_key() -> str | None:
    if "GEMINI_API_KEY" in os.environ:
        val = os.environ["GEMINI_API_KEY"].strip()
        return val if len(val) > 10 else None
    if "GOOGLE_API_KEY" in os.environ:
        val = os.environ["GOOGLE_API_KEY"].strip()
        return val if len(val) > 10 else None
    cand_env = [
        os.path.join(os.path.dirname(__file__), "..", ".env"),
        ".env",
        "backend/.env",
        "../backend/.env"
    ]
    for p in cand_env:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip().startswith("GEMINI_API_KEY="):
                            val = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                            if len(val) > 10:
                                os.environ["GEMINI_API_KEY"] = val
                                return val
            except Exception:
                pass
    return None

def model_available():
    gemini_key = get_gemini_key()
    if gemini_key:
        return True
    m, l = get_model_paths()
    return bool(m and l)

def predict_disease_gemini(path: str, api_key: str, language: str = "en"):
    """Diagnoses leaf pathology using Google Gemini Multimodal Vision API with multi-language support (English & Tamil)."""
    import base64
    
    with open(path, "rb") as f:
        img_bytes = f.read()
    b64_img = base64.b64encode(img_bytes).decode("utf-8")
    mime = "image/png" if path.lower().endswith(".png") else "image/jpeg"
    
    if language == "ta":
        lang_instruction = (
            "CRITICAL REQUIREMENT: The user's language is TAMIL (தமிழ்). All disease diagnoses, crop names, visible symptoms, "
            "cultural measures, biological treatments, chemical remedies with exact dosages, and preventive guidelines MUST "
            "be written completely in natural, accurate TAMIL (தமிழ்). The JSON keys must remain in English, but every string "
            "value and list item must be in Tamil."
        )
    else:
        lang_instruction = "Provide all diagnoses, symptoms, and treatment instructions in clear, actionable English."

    prompt = (
        "You are an expert plant pathologist and agronomist. Inspect this crop leaf photo carefully. "
        "Identify the crop, whether it is healthy or diseased, the exact disease or pest name, "
        "an honest confidence score (between 0.70 and 0.99), specific visible symptoms, and actionable "
        f"treatment protocols (cultural, biological, chemical, prevention). {lang_instruction} "
        "Respond ONLY with a valid JSON object in this exact schema, without markdown formatting:\n"
        "{\n"
        '  "label": "Crop Name - Condition",\n'
        '  "confidence": 0.94,\n'
        '  "crop": "Crop Name",\n'
        '  "is_healthy": false,\n'
        '  "symptoms": ["Symptom 1", "Symptom 2"],\n'
        '  "cultural": ["Sanitation or pruning advice", "Watering adjustments"],\n'
        '  "biological": ["Organic spray or biocontrol agent"],\n'
        '  "chemical": ["Recommended fungicide/pesticide with dosage"],\n'
        '  "prevention": ["Crop rotation and hygiene measure"],\n'
        '  "description": "Concise summary of the disease biology."\n'
        "}"
    )
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": mime, "data": b64_img}}
            ]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024
        }
    }
    
    headers = {
        "x-goog-api-key": api_key.strip(),
        "Content-Type": "application/json"
    }
    
    # Try active Gemini models
    models = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite"]
    for m in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key.strip()}"
        try:
            resp = httpx.post(url, json=payload, headers=headers, timeout=25.0)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if raw_text.startswith("```"):
                    raw_text = raw_text.split("\n", 1)[1]
                if raw_text.endswith("```"):
                    raw_text = raw_text.rsplit("\n", 1)[0]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:].strip()
                parsed = json.loads(raw_text)
                symptoms_list = parsed.get("symptoms", [])
                symptoms_text = " • ".join(symptoms_list) if isinstance(symptoms_list, list) else str(symptoms_list)
                
                label_val = parsed.get("label", "Crop Leaf Observation")
                crop_val = parsed.get("crop", "Cultivated Crop")
                
                return [{
                    "label": label_val,
                    "confidence": round(float(parsed.get("confidence", 0.94)), 4),
                    "engine": "Google Gemini Vision AI",
                    "details": {
                        "crop": crop_val,
                        "common_name": label_val,
                        "tamil_name": label_val if language == "ta" else f"{crop_val} - நோயியல் பகுப்பாய்வு",
                        "pathogen": "Identified by Google Gemini Vision AI",
                        "symptoms": {
                            "en": symptoms_text if language != "ta" else "Visible foliar lesions detected.",
                            "ta": symptoms_text if language == "ta" else "கள அறிகுறிகள் மற்றும் நோயியல் பகுப்பாய்வு."
                        },
                        "treatments": {
                            "cultural": parsed.get("cultural", ["Maintain clean cultivation and remove symptomatic foliage."]),
                            "biological": parsed.get("biological", ["Apply beneficial bio-control agents (e.g. Trichoderma or Bacillus)."]),
                            "chemical": parsed.get("chemical", ["Consult local agricultural officer or apply recommended active ingredients."])
                        },
                        "prevention": " • ".join(parsed.get("prevention", [])) if isinstance(parsed.get("prevention"), list) else str(parsed.get("prevention", "Maintain crop hygiene.")),
                        "description": parsed.get("description", "High-confidence multimodal vision diagnosis from Google Gemini AI.")
                    }
                }]
        except Exception:
            continue
            
    return None

def predict_disease(path, language: str = "en"):
    """Tries Google Gemini Vision first if GEMINI_API_KEY is configured; falls back to TensorFlow."""
    global _model
    gemini_key = get_gemini_key()
    if gemini_key:
        gemini_result = predict_disease_gemini(path, gemini_key, language=language)
        if gemini_result:
            return gemini_result

    if not model_available():
        return None
    import numpy as np
    from PIL import Image
    import tensorflow as tf
    
    model_p, labels_p = get_model_paths()
    if not (model_p and labels_p):
        return None
    if _model is None:
        _model = tf.keras.models.load_model(model_p)
    with open(labels_p, "r", encoding="utf-8") as f:
        labels = json.load(f)
        
    size = _model.input_shape[1:3]
    # Load, convert to RGB, resize, normalize float32
    img = Image.open(path).convert("RGB").resize(size)
    x = np.asarray(img, dtype="float32")[None] / 255.0
    probs = _model.predict(x, verbose=0)[0]
    top_indices = sorted(range(len(probs)), key=lambda i: -probs[i])[:3]
    
    results = []
    for idx in top_indices:
        label = labels[idx]
        conf = round(float(probs[idx]), 4)
        info = get_disease_details(label)
        results.append({
            "label": label,
            "confidence": conf,
            "engine": "TensorFlow Deep-Learning (Local)",
            "details": info
        })
    return results

# --- Weather via Open-Meteo (no key needed); never fabricates on failure ---
def fetch_weather(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "timezone": "auto",
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "forecast_days": 7
    }
    r = httpx.get(url, params=params, timeout=10)
    r.raise_for_status()
    return r.json()
