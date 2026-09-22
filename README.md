# AI-Based Smart Logistics & Accessibility Intelligence Platform for North Eastern Region (NER)

**Emergency Rebuilt Prototype for Smart India Hackathon (SIH)**

A resilient, functional, and high-reliability decision-support and dispatch platform engineered specifically for the unique terrain, meteorological vulnerabilities, and logistical bottlenecks of Northeast India.

---

## 1. Problem Statement
Northeast India faces severe logistical vulnerabilities:
- High frequency of flash floods, cloudbursts, and monsoon landslides cutting off key national highways (NH2, NH6, NH10, NH27).
- Critical lifelines (e.g., medical cargo from Guwahati to Imphal or Silchar) frequently become trapped at bridge bottlenecks or mountain pass cuts.
- Conventional navigation engines fail to account for hill slope physics, rainfall thresholds, and dynamic structural damage.

---

## 2. Solution Overview
The platform demonstrates an end-to-end resilient operations loop:
**`MONITOR → PREDICT → OPTIMIZE → TRACK → ALERT`**

1. **MONITOR**: Aggregates real-time weather observations (OpenWeather API) and ground hazard telemetry (State PWD / citizen field reports).
2. **PREDICT**: Quantifies disruption risk using a trained Scikit-Learn **`RandomForestClassifier`** with `predict_proba()`.
3. **OPTIMIZE**: Recommends safer all-weather corridors using **OSRM** and multi-factor safety weighting (40% Health, 30% AI Disruption Risk, 20% ETA, 10% Incident Severity).
4. **TRACK**: Monitors essential freight units (e.g., Medicine Vehicle V001) along corridor geometries with simulated GPS telemetry.
5. **ALERT**: Automatically triggers priority dispatch alerts (such as **"Critical Medicine Delivery at Risk"**) with deduplication and unique constraint enforcement.

---

## 3. Technology Stack
- **Frontend**: React 19, Vite, Vanilla CSS Design System (High-contrast command-center dark mode).
- **Mapping & GIS**: Leaflet, React-Leaflet, OpenStreetMap.
- **Routing Engine**: OSRM (Open Source Routing Machine) public driving API.
- **Meteorology**: OpenWeather Current Weather API (`api.openweathermap.org`).
- **Database**: Supabase / PostgreSQL schema (`supabase/schema.sql`) with offline fallback.
- **AI & Machine Learning**: Python 3.12, Scikit-learn, Pandas, NumPy, Joblib (`RandomForestClassifier`).

---

## 4. AI Approach & Disruption Prediction Model
- **Model**: `RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)`
- **Evaluation**: Trained with an 80/20 train/test split. Computes real, unfaked metrics:
  - Accuracy: **57.92%**
  - Precision: **0.6048**
  - Recall: **0.5906**
  - F1 Score: **0.5976**
  - ROC-AUC: **0.6247**
- **Features Analyzed**:
  - `rainfall_1h`, `rainfall_24h`, `wind_speed`
  - `road_condition_score`, `traffic_level`
  - `incident_count`, `incident_severity`
  - `route_health_score`, `elevation`, `slope`
  - `historical_disruptions`, `distance_to_incident`
- **Output**: Generates actual probability scores via `predict_proba()`, categorized into:
  - `0 – 24%`: Low Risk
  - `25 – 49%`: Medium Risk
  - `50 – 74%`: High Risk
  - `75 – 100%`: Critical Risk

> **Honest AI Limitation Notice:**
> The ML model is trained on labeled **synthetic demo training data** (`ml/data/disruption_history.csv`) calibrated to simulate realistic NER monsoon hazards and slope physics. It does not claim to use official unverified historical incident logs.

---

## 5. Route Health Score (Rule-Based, NOT ML)
To ensure complete transparency for government authorities, the platform distinctly separates AI predictions from rule-based calculations:
- **Formula**:
  $$\text{Score} = (\text{RoadCondition} \times 0.45) - \text{WeatherPenalty} - (\text{IncidentCount} \times 10) - \text{SeverityDeduction} + 35$$
- **Tiers**:
  - 80–100: **Safe** (Green)
  - 60–79: **Moderate** (Yellow)
  - 40–59: **Risky** (Orange)
  - 0–39: **Critical** (Red)

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+) & npm
- Python 3.10+ (with `pandas`, `scikit-learn`, `joblib`, `numpy`)

### Step 1: Clone and Install Dependencies
```bash
npm install
```

### Step 2: (Optional) Re-train Random Forest Model
```bash
python ml/train_model.py
python ml/predict_routes.py
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your optional API keys:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```
*(If no API key is provided, the platform automatically runs in resilient **DEMO DATA MODE** with clearly labeled badges so the demonstration never crashes).*

### Step 4: Run the Application
```bash
npm run dev
```

---

## 7. Primary Demonstration & Judging Flow

1. **Authority Command Center**:
   - Inspect dynamic real-time KPIs (Total Routes, Accessible Routes, High Risk, Blocked, Active Vehicles, Critical Alerts).
   - Review Regional Route Connectivity Matrix.
2. **Main Dashboard**:
   - Review the `MONITOR → PREDICT → OPTIMIZE → TRACK → ALERT` workflow header.
   - Observe the spotlight on **Guwahati → Imphal (R001)**.
   - Verify the OpenWeather widget (`LIVE • OPENWEATHER` or `DEMO DATA MODE`).
   - Examine the rule-based **Route Health Score: 25/100 (Critical)**.
   - Inspect the **Random Forest AI Disruption Risk: 54.1% (High)**.
3. **Route Intelligence & Alternate Routing**:
   - Click **"Evaluate OSRM Safer Route"**.
   - Review the multi-factor optimization breakdown (40% Health, 30% AI, 20% ETA, 10% Incident).
   - Observe the green alternate bypass corridor recommendation via Lumding/Silchar.
4. **Simulated GPS Fleet Tracking**:
   - Track vehicle **V001** (Medicine cargo, Critical priority) advancing along route coordinates.
   - Verify the prominent badge: **`GPS MODE: SIMULATED`**.
5. **Critical Alert Engine**:
   - Confirm the trigger: **"Critical Medicine Delivery at Risk"**.
   - Verify alert deduplication and the unique `alert_id` constraint.
6. **Field Reports**:
   - Submit a ground incident report with optional browser geolocation.
   - Observe the report immediately update the state and display on the Live Map.

---

## 8. Honest Limitations
1. **Synthetic Training Data**: The Random Forest classifier was trained on synthetic NER monsoon simulation data.
2. **Simulated GPS Telemetry**: Vehicle positions advance along calculated corridor geometries using simulated timers; this does not connect to real physical OBD-II/GPS hardware.
3. **Prototype Scope**: This software is a demonstration prototype designed for SIH and is not currently certified for production emergency services dispatch.

