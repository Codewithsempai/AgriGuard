# AgriGuard AI — Database Design & Schema Documentation

## 1. Engine & Strategy
- **Database Engine:** SQLite 3 (local file-based, zero configuration, zero separate daemon).
- **ORM:** SQLAlchemy 2.0 with type-annotated `Mapped` attributes and `DeclarativeBase`.
- **Location:** Configurable via `DATABASE_URL` (defaults to `sqlite:///agriguard.db`).
- **Data Integrity:** Cascading deletes on child relationships (`farms -> fields -> crops -> tasks/expenses/harvests`).
- **User Isolation:** All private records inherit from `Owned` with indexed `user_id` foreign key.

## 2. Table Specifications

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, INDEX | User login email address |
| `name` | VARCHAR(120) | NOT NULL | Farmer full name |
| `password_hash`| VARCHAR(255) | NOT NULL | PBKDF2-HMAC-SHA256 salt & hash |
| `role` | VARCHAR(20) | DEFAULT 'farmer' | 'farmer' or 'admin' |
| `language` | VARCHAR(5) | DEFAULT 'en' | Preferred UI language ('en' / 'ta') |
| `created_at` | DATETIME | NOT NULL | User registration timestamp |

### `farms`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Farm identifier |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `name` | VARCHAR(120) | NOT NULL | Farm plot title |
| `location` | VARCHAR(200) | NULLABLE | Geographic location / district |
| `latitude` | FLOAT | NULLABLE | Decimal latitude coordinate |
| `longitude`| FLOAT | NULLABLE | Decimal longitude coordinate |
| `area_acres`| FLOAT | NULLABLE | Total acreage |

### `fields`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Field identifier |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `farm_id` | INTEGER | FK(farms.id, CASCADE) | Parent farm identifier |
| `name` | VARCHAR(120) | NOT NULL | Field section / block name |
| `area_acres`| FLOAT | NULLABLE | Block acreage |
| `soil_type`| VARCHAR(60) | NULLABLE | Soil texture class |

### `crops`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Crop identifier |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `field_id` | INTEGER | FK(fields.id, CASCADE) | Cultivation field block |
| `name` | VARCHAR(80) | NOT NULL | Crop species (e.g. Tomato, Rice) |
| `variety` | VARCHAR(80) | NULLABLE | Cultivar / hybrid name |
| `planting_date` | DATE | NULLABLE | Sowing date |
| `growth_stage` | VARCHAR(40) | DEFAULT 'sowing' | Sowing, Vegetative, Flowering, Fruiting, Maturity |
| `expected_harvest` | DATE | NULLABLE | Forecasted harvest deadline |
| `expected_yield_kg` | FLOAT | NULLABLE | Projected yield |
| `status` | VARCHAR(30) | DEFAULT 'active' | 'active', 'harvested', 'failed' |

### `expenses`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Expense transaction ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `crop_id` | INTEGER | FK(crops.id, SET NULL) | Optional linked crop cycle |
| `category` | VARCHAR(30) | NOT NULL | seeds, fertilizer, labor, irrigation, transport, other |
| `amount` | FLOAT | CHECK(amount >= 0) | Expenditure amount (INR) |
| `spent_on` | DATE | NOT NULL | Date of payment |
| `note` | VARCHAR(300) | NULLABLE | Supplier or item details |

### `harvests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Harvest record ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `crop_id` | INTEGER | FK(crops.id, CASCADE) | Harvested crop |
| `quantity_kg` | FLOAT | CHECK(quantity_kg >= 0) | Harvested commodity weight in kg |
| `price_per_kg` | FLOAT | CHECK(price_per_kg >= 0) | Sale price realized per kg |
| `harvested_on` | DATE | NOT NULL | Date of harvest |

### `disease_analyses`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Analysis record ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `crop_id` | INTEGER | FK(crops.id, SET NULL) | Optional linked crop |
| `image_path` | VARCHAR(300) | NOT NULL | Local path on disk |
| `mode` | VARCHAR(20) | NOT NULL | 'model' or 'demo_no_model' |
| `predicted_label` | VARCHAR(120) | NULLABLE | Classified disease pathogen |
| `confidence` | FLOAT | NULLABLE | Probability estimate |
| `created_at` | DATETIME | NOT NULL | Timestamp |

### `soil_tests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Soil test ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `field_id` | INTEGER | FK(fields.id, SET NULL) | Optional field block |
| `crop_name` | VARCHAR(80) | NULLABLE | Planned crop species |
| `ph` | FLOAT | NOT NULL | Soil pH (0 - 14) |
| `nitrogen` | FLOAT | NOT NULL | Available N (kg/ha) |
| `phosphorus` | FLOAT | NOT NULL | Available P (kg/ha) |
| `potassium` | FLOAT | NOT NULL | Available K (kg/ha) |
| `soil_type` | VARCHAR(60) | NULLABLE | Soil texture |
| `tested_on` | DATE | NOT NULL | Sample collection date |

### `tasks`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Activity task ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Owner user ID |
| `crop_id` | INTEGER | FK(crops.id, SET NULL) | Associated crop |
| `title` | VARCHAR(200) | NOT NULL | Operation description |
| `task_type`| VARCHAR(30) | NOT NULL | sowing, irrigation, fertilization, pest_inspection, harvesting, other |
| `due_date` | DATE | INDEX | Target completion date |
| `completed`| BOOLEAN | DEFAULT FALSE | Status toggle |

### `notifications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Notification ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Recipient user ID |
| `title` | VARCHAR(200) | NOT NULL | Alert summary |
| `message` | TEXT | NOT NULL | Detailed context |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read state |
| `created_at` | DATETIME | NOT NULL | Notification generation timestamp |

### `pest_observations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Scouting log ID |
| `user_id` | INTEGER | FK(users.id, CASCADE) | Observer user ID |
| `crop_id` | INTEGER | FK(crops.id, SET NULL) | Monitored crop |
| `kind` | VARCHAR(20) | NOT NULL | 'pest' or 'weed' |
| `description` | TEXT | NOT NULL | Observed symptoms |
| `severity` | VARCHAR(20) | DEFAULT 'low' | low, medium, high |
| `observed_on` | DATE | NOT NULL | Date observed |

### `market_prices`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Benchmark record ID |
| `crop` | VARCHAR(80) | INDEX | Commodity name |
| `market` | VARCHAR(120) | INDEX | APMC mandi name |
| `price` | FLOAT | NOT NULL | Market wholesale price |
| `unit` | VARCHAR(20) | NOT NULL | 'INR/quintal' or 'INR/kg' |
| `source` | VARCHAR(200) | NOT NULL | Data provider / source |
| `is_sample` | BOOLEAN | DEFAULT FALSE | Tag identifying development sample records |
| `recorded_on` | DATE | INDEX | Reporting date |

### `articles`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Article ID |
| `category` | VARCHAR(40) | INDEX | crop-care, pest, disease, soil, weed, harvest |
| `title_en` | VARCHAR(200) | NOT NULL | English guide title |
| `title_ta` | VARCHAR(200) | NULLABLE | Tamil guide title |
| `body_en` | TEXT | NOT NULL | English guide content |
| `body_ta` | TEXT | NULLABLE | Tamil guide content |
