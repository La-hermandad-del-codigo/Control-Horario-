-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Work Sessions Table
CREATE TABLE work_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  total_duration INTERVAL,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'abandoned')) NOT NULL,
  notes TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Work Pauses Table
CREATE TABLE work_pauses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES work_sessions(id) ON DELETE CASCADE NOT NULL,
  pause_start TIMESTAMPTZ NOT NULL,
  pause_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX idx_user_sessions ON work_sessions(user_id, created_at DESC);
CREATE INDEX idx_session_status ON work_sessions(user_id, status);
CREATE INDEX idx_session_pauses ON work_pauses(session_id);

-- 5. Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Logic Functions & Triggers

-- Validate Single Active Session
CREATE OR REPLACE FUNCTION validate_single_active_session()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('active', 'paused') THEN
    IF EXISTS (
      SELECT 1 FROM work_sessions
      WHERE user_id = NEW.user_id
        AND status IN ('active', 'paused')
        AND id != COALESCE(NEW.id, uuid_nil())
    ) THEN
      RAISE EXCEPTION 'Ya existe una sesión activa para este usuario';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_single_active_session
  BEFORE INSERT OR UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_single_active_session();

-- Validate Max Duration (16h)
CREATE OR REPLACE FUNCTION validate_max_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    IF EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))/3600 > 16 THEN
      RAISE EXCEPTION 'Una sesión no puede durar más de 16 horas.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_max_session_duration
  BEFORE INSERT OR UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_max_session_duration();

-- Check Abandoned Sessions (RPC)
CREATE OR REPLACE FUNCTION check_abandoned_sessions()
RETURNS TABLE (
  session_id UUID,
  hours_since_start DOUBLE PRECISION
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as session_id,
    EXTRACT(EPOCH FROM (NOW() - start_time))/3600 as hours_since_start
  FROM work_sessions
  WHERE user_id = auth.uid()
    AND status IN ('active', 'paused')
    AND start_time < NOW() - INTERVAL '24 hours';
END;
$$ language 'plpgsql';

-- 7. Row Level Security Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Work Sessions
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" 
  ON work_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
  ON work_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
  ON work_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
  ON work_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Work Pauses
ALTER TABLE work_pauses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pauses of own sessions" 
  ON work_pauses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM work_sessions 
      WHERE work_sessions.id = work_pauses.session_id 
      AND work_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pauses to own sessions" 
  ON work_pauses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_sessions 
      WHERE work_sessions.id = work_pauses.session_id 
      AND work_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pauses of own sessions" 
  ON work_pauses FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM work_sessions 
      WHERE work_sessions.id = work_pauses.session_id 
      AND work_sessions.user_id = auth.uid()
    )
  );
