# Disease model setup
1. Train a classifier (e.g. MobileNetV2 transfer learning on PlantVillage) in Colab/Kaggle.
2. Save as `backend/models/disease_model.keras` and class names (ordered list) as `backend/models/labels.json`.
3. `pip install tensorflow pillow numpy`. Inputs are resized to the model's input shape; **add your model's preprocessing in `services.predict_disease` if it needs scaling** (e.g. MobileNetV2 `preprocess_input`).
4. Restart the API. `/disease/predict` then returns top-3 real predictions with confidence.
Until then the endpoint runs in labeled demo mode and returns no diagnosis.
