-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create deliverables table
CREATE TABLE IF NOT EXISTS deliverables (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  due_date DATE NOT NULL,
  grade_weight DECIMAL(5,2) NOT NULL CHECK (grade_weight >= 0 AND grade_weight <= 100),
  estimated_hours DECIMAL(5,2) NOT NULL CHECK (estimated_hours > 0),
  hours_completed DECIMAL(5,2) DEFAULT 0 CHECK (hours_completed >= 0),
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverables_course ON deliverables(course_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_due_date ON deliverables(due_date);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hours DECIMAL(4,2) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

-- Create schedule_sessions table
CREATE TABLE IF NOT EXISTS schedule_sessions (
  id SERIAL PRIMARY KEY,
  deliverable_id INTEGER NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  allocated_hours DECIMAL(4,2) NOT NULL CHECK (allocated_hours > 0),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'partial', 'missed')),
  actual_hours DECIMAL(4,2) CHECK (actual_hours >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_deliverable ON schedule_sessions(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON schedule_sessions(scheduled_date);
