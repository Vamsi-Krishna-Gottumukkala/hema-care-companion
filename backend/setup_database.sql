-- HemaAI Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT,
  age INTEGER,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_type TEXT NOT NULL CHECK (input_type IN ('manual', 'report_upload', 'both')),
  wbc DECIMAL, rbc DECIMAL, hemoglobin DECIMAL, platelet DECIMAL,
  neutrophils DECIMAL, lymphocytes DECIMAL, monocytes DECIMAL, eosinophils DECIMAL,
  report_file_url TEXT,
  status TEXT CHECK (status IN ('detected', 'not_detected')),
  cancer_type TEXT CHECK (cancer_type IN ('ALL', 'AML', 'CLL', 'CML', 'none')),
  risk_level TEXT CHECK (risk_level IN ('high', 'medium', 'low')),
  confidence_score DECIMAL,
  ai_explanation JSONB,
  parameter_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  rating DECIMAL,
  specializations TEXT[],
  lat DECIMAL,
  lng DECIMAL,
  beds INTEGER,
  founded INTEGER,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'google_maps')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT,
  experience TEXT,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  hospital_name TEXT,
  rating DECIMAL,
  patients INTEGER,
  education TEXT,
  avatar TEXT,
  available BOOLEAN DEFAULT true,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE CASCADE,
  file_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR')),
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Disable RLS for now (we handle auth in FastAPI with service role key)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for report uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Seed an admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, avatar, status)
VALUES (
  'Dr. Michael Chen',
  'admin@hemaai.com',
  '$2b$12$LJ3m4ys3xZ2Z0h8JvNbieu7YfXvXlP3xI5t5YB/bKQvVFf2MGLWXK',
  'admin',
  'MC',
  'active'
) ON CONFLICT (email) DO NOTHING;
