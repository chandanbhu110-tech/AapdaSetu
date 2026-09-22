-- ==============================================================================
-- SIH NER Smart Logistics Platform - Missing Remote Supabase Tables SQL
-- Run this in your Supabase Project SQL Editor if you wish to persist
-- citizen field reports and model predictions directly to PostgreSQL.
-- (The web application runs gracefully with offline localStorage fallback
-- even if these tables are not yet created).
-- ==============================================================================

-- 1. FIELD REPORTS TABLE (for crowdsourced / volunteer road hazards)
CREATE TABLE IF NOT EXISTS public.field_reports (
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

-- 3. PROFILES TABLE (for Official accounts linked with Supabase Auth)
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

-- Trigger to automatically create profile record when an official registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, agency, designation, official_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Emergency Official'),
    COALESCE(new.raw_user_meta_data->>'role', 'official'),
    COALESCE(new.raw_user_meta_data->>'agency', 'NER Logistics Command'),
    COALESCE(new.raw_user_meta_data->>'designation', 'Operations Officer'),
    COALESCE(new.raw_user_meta_data->>'official_id', 'OFF-' || SUBSTRING(new.id::text, 1, 6))
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      agency = EXCLUDED.agency,
      designation = EXCLUDED.designation,
      official_id = EXCLUDED.official_id,
      updated_at = CURRENT_TIMESTAMP;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
