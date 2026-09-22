-- ==============================================================================
-- SIH NER Smart Logistics & Accessibility Intelligence Platform
-- Database Schema for Supabase / PostgreSQL
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROUTES TABLE
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL,
    baseline_health_score NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Safe', 'Moderate', 'Risky', 'Critical')),
    coordinates JSONB, -- GeoJSON or coordinate array for route visualization
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(100) NOT NULL, -- 'Bridge Damage', 'Landslide', 'Flooding', 'Road Block'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    description TEXT NOT NULL,
    affected_route VARCHAR(50) REFERENCES routes(id) ON DELETE SET NULL,
    is_demo BOOLEAN DEFAULT TRUE, -- Clearly marked as DEMO INCIDENT
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Verifying', 'Resolved', 'In Progress')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(50),
    cargo VARCHAR(100) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Normal', 'Medium', 'High', 'Critical')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('On Route', 'Delayed', 'Rerouted', 'Stationary', 'Delivered')),
    current_lat NUMERIC(10, 6),
    current_lng NUMERIC(10, 6),
    progress_percent NUMERIC(5, 2) DEFAULT 0,
    eta_hours NUMERIC(5, 2),
    gps_mode VARCHAR(50) DEFAULT 'SIMULATED', -- GPS MODE: SIMULATED
    route_id VARCHAR(50) REFERENCES routes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. WEATHER TABLE
CREATE TABLE IF NOT EXISTS weather (
    city VARCHAR(100) PRIMARY KEY,
    temp_c NUMERIC(5, 2),
    feels_like_c NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    wind_speed_ms NUMERIC(5, 2),
    rainfall_mm NUMERIC(6, 2) DEFAULT 0,
    condition VARCHAR(100),
    source VARCHAR(50) DEFAULT 'OpenWeather', -- Source: OpenWeather
    is_demo_mode BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ROUTE PREDICTIONS TABLE (RandomForestClassifier outputs)
CREATE TABLE IF NOT EXISTS route_predictions (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) REFERENCES routes(id) ON DELETE CASCADE,
    disruption_probability NUMERIC(5, 4) NOT NULL, -- 0.0000 to 1.0000 from predict_proba
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    prediction_reason TEXT,
    top_factors JSONB,
    model_version VARCHAR(50) DEFAULT 'RandomForest-v1.0',
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ALERTS TABLE (with strict UNIQUE alert_id)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL, -- Keep alerts.alert_id UNIQUE
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    description TEXT NOT NULL,
    route_id VARCHAR(50) REFERENCES routes(id) ON DELETE SET NULL,
    vehicle_id VARCHAR(50) REFERENCES vehicles(id) ON DELETE SET NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FIELD REPORTS TABLE (Crowdsourced / Volunteer road hazard reports)
CREATE TABLE IF NOT EXISTS field_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(50),
    incident_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Moderate', 'Medium', 'High', 'Critical')),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    affected_route VARCHAR(50),
    reporter_id VARCHAR(100) DEFAULT 'Citizen / Field Volunteer',
    photo_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending Verification' CHECK (status IN ('Pending Sync', 'Pending Verification', 'Verified', 'Rejected', 'Pending Review')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and public policies for field_reports
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on field_reports" 
ON field_reports FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on field_reports" 
ON field_reports FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on field_reports" 
ON field_reports FOR UPDATE 
USING (true);

-- 8. PROFILES TABLE (Official accounts linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'official' CHECK (role IN ('official', 'admin')),
    agency VARCHAR(100),
    designation VARCHAR(100),
    official_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public or authenticated read on profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- ==============================================================================
-- SEED DATA (Standard NER Corridors & Required Baseline Entities)
-- ==============================================================================

-- Seed Routes
INSERT INTO routes (id, name, origin, destination, distance_km, baseline_health_score, risk_level)
VALUES
    ('R001', 'Guwahati to Imphal Highway (NH27/NH29/NH2)', 'Guwahati', 'Imphal', 360.00, 25.00, 'Critical'),
    ('R002', 'Shillong to Silchar Highway (NH6)', 'Shillong', 'Silchar', 220.00, 35.00, 'Risky'),
    ('R003', 'Siliguri to Gangtok Highway (NH10)', 'Siliguri', 'Gangtok', 115.00, 40.00, 'Risky')
ON CONFLICT (id) DO UPDATE 
SET baseline_health_score = EXCLUDED.baseline_health_score,
    risk_level = EXCLUDED.risk_level;

-- Seed Vehicles
INSERT INTO vehicles (id, vehicle_number, cargo, origin, destination, priority, status, current_lat, current_lng, progress_percent, eta_hours, gps_mode, route_id)
VALUES
    ('V001', 'AS-01-MD-9012', 'Medicine', 'Guwahati', 'Imphal', 'Critical', 'On Route', 25.7500, 93.1800, 42.0, 5.5, 'SIMULATED', 'R001'),
    ('V002', 'ML-05-FD-4421', 'Food', 'Shillong', 'Silchar', 'High', 'Delayed', 25.4200, 92.2100, 30.0, 7.0, 'SIMULATED', 'R002')
ON CONFLICT (id) DO NOTHING;

-- Seed Incidents (Clearly marked DEMO INCIDENT)
INSERT INTO incidents (id, type, severity, latitude, longitude, description, affected_route, is_demo, status)
VALUES
    ('INC-001', 'Bridge Damage', 'Critical', 24.8010, 93.1250, 'DEMO INCIDENT: Critical bridge damage near Jiribam due to flash floods. Single-lane movement restricted for heavy transport.', 'R001', TRUE, 'Active'),
    ('INC-002', 'Landslide', 'High', 25.1200, 92.3800, 'DEMO INCIDENT: High-risk landslide near Sonapur tunnel corridor on NH6. Debris clearance underway.', 'R002', TRUE, 'Active'),
    ('INC-003', 'Flooding & Road Damage', 'High', 26.9800, 88.5100, 'DEMO INCIDENT: Flood/road damage near Teesta corridor on NH10. Caution advised.', 'R003', TRUE, 'Active')
ON CONFLICT (id) DO NOTHING;
