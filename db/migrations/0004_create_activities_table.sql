-- Create enum type for activity status
CREATE TYPE activity_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Create activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  volunteer_id TEXT NOT NULL REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status activity_status NOT NULL DEFAULT 'scheduled',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_activities_volunteer_id ON activities(volunteer_id);
CREATE INDEX idx_activities_date ON activities(date);
