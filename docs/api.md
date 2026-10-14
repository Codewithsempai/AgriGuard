# AgriGuard AI — REST API Reference

Base URL: `http://localhost:8000/api/v1`
Interactive Swagger Documentation: `http://localhost:8000/docs`

---

## 1. Authentication & Users
- `POST /auth/register` — Register a new farmer account.
- `POST /auth/login` — Authenticate and receive signed Bearer JWT token.
- `GET /auth/me` — Retrieve current authenticated user profile.
- `PUT /auth/me` — Update name or preferred interface language.
- `GET /admin/users` — [Admin Only] Retrieve all user accounts.

## 2. Dashboard
- `GET /dashboard` — Aggregated farm count, active crops, pending tasks, overdue alerts, total expenses, revenue, profit, recent activity feeds.

## 3. Farms & Fields
- `GET /farms` — List farms belonging to the user (`?q=` search supported).
- `POST /farms` — Create a new farm plot.
- `GET /farms/{id}` — Get farm details.
- `PUT /farms/{id}` — Update farm details.
- `DELETE /farms/{id}` — Delete farm and cascade child fields/crops.
- `GET /fields` — List fields belonging to the user.
- `POST /fields` — Create a new field under a farm.
- `GET /fields/{id}` — Get field details.
- `PUT /fields/{id}` — Update field.
- `DELETE /fields/{id}` — Delete field and associated crops.

## 4. Crops
- `GET /crops` — List crops.
- `POST /crops` — Register new crop variety in a field.
- `GET /crops/{id}` — Get crop details.
- `PUT /crops/{id}` — Update crop lifecycle status, stage, or dates.
- `DELETE /crops/{id}` — Delete crop record.

## 5. AI Crop Disease Detection
- `POST /disease/predict` — Upload a JPEG/PNG leaf photo for deep-learning inference. Returns top-3 predicted pathogens, confidence percentages, observed symptoms, and cultural/biological/chemical treatment guidance.
- `GET /disease/history` — Retrieve all stored image scans and past diagnoses.

## 6. Soil Health Advisor
- `POST /soil/analyze` — Evaluates Nitrogen, Phosphorus, Potassium, and pH levels against agronomic benchmarks; returns nutrient ratings, lime/gypsum advice, and crop notes.
- `GET /soil/history` — Retrieve past soil test records.

## 7. Agrometeorology Weather
- `GET /weather/forecast?lat={lat}&lon={lon}` — 7-day meteorological forecast from Open-Meteo with spray window feasibility advisories.

## 8. Expenses & Financials
- `GET /expenses` — List operational expenditures.
- `POST /expenses` — Log a new farm expense.
- `PUT /expenses/{id}` — Edit expense.
- `DELETE /expenses/{id}` — Delete expense.

## 9. Harvest Records
- `GET /harvests` — List harvest transactions with quantities and selling rates.
- `POST /harvests` — Record harvest yield and revenue.
- `PUT /harvests/{id}` — Edit harvest record.
- `DELETE /harvests/{id}` — Delete harvest record.

## 10. Farm Activity Calendar & Tasks
- `GET /tasks` — List scheduled farming activities.
- `POST /tasks` — Add new sowing, irrigation, or spraying task.
- `PUT /tasks/{id}` — Edit task details.
- `POST /tasks/{id}/toggle` — Toggle task completion status.
- `DELETE /tasks/{id}` — Delete task.

## 11. Pest & Weed Log
- `GET /pest-observations` — List scouting logs.
- `POST /pest-observations` — Log new pest/weed sighting.
- `DELETE /pest-observations/{id}` — Delete scouting log.

## 12. Knowledge Centre
- `GET /knowledge?q={q}&category={category}&lang={lang}` — Search agricultural guides in English or Tamil.
- `POST /knowledge` — [Admin Only] Publish new guide.
- `PUT /knowledge/{id}` — [Admin Only] Edit published guide.
- `DELETE /knowledge/{id}` — [Admin Only] Delete guide.

## 13. Market Price Intelligence
- `GET /market-prices?crop={crop}&market={market}&on={date}` — Search wholesale mandi commodity prices.
- `POST /market-prices` — [Admin Only] Add benchmark price record.
- `DELETE /market-prices/{id}` — [Admin Only] Delete benchmark price record.

## 14. Notifications & Alerts
- `GET /notifications` — List alerts (auto-generates notifications for overdue activities).
- `POST /notifications/{id}/read` — Mark alert as read.
- `POST /notifications/read-all` — Mark all user alerts as read.

## 15. Reports & Analytics
- `GET /reports/summary?format=json` — Aggregated crop financial ledgers, category expense totals, and net margin ROI.
- `GET /reports/summary?format=csv` — Direct CSV download stream for offline spreadsheet analysis.
