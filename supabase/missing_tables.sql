-- ==============================================================================
-- SIH NER Smart Logistics Platform - Missing Remote Supabase Tables SQL
-- Run this in your Supabase Project SQL Editor if you wish to persist
-- citizen field reports and model predictions directly to PostgreSQL.
-- (The web application runs gracefully with offline localStorage fallback
-- even if these tables are not yet created).
-- ==============================================================================

-- 1. FIELD REPORTS TABLE (for crowdsourced / volunteer road hazards)
CREATE TABLE IF NOT EXISTS public.field_reports (
    id SERIAL PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Moderate', 'Medium', 'High', 'Critical')),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    affected_route VARCHAR(50),
    reporter_role VARCHAR(100) DEFAULT 'Citizen / Field Volunteer',
    status VARCHAR(50) DEFAULT 'Pending Verification' CHECK (status IN ('Pending Sync', 'Pending Verification', 'Verified', 'Rejected')),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and public policies for demo access if RLS is on
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on field_reports" 
ON public.field_reports FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on field_reports" 
ON public.field_reports FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on field_reports" 
ON public.field_reports FOR UPDATE 
USING (true);

-- 2. ROUTE PREDICTIONS TABLE (for Scikit-Learn RandomForestClassifier inferences)
CREATE TABLE IF NOT EXISTS public.route_predictions (
    id SERIAL PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    disruption_probability NUMERIC(5, 4) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    prediction_reason TEXT,
    top_factors JSONB,
    model_version VARCHAR(50) DEFAULT 'RandomForestClassifier-v1.0',
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.route_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on route_predictions" 
ON public.route_predictions FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on route_predictions" 
ON public.route_predictions FOR INSERT 
WITH CHECK (true);
