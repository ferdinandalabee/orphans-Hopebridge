-- Add first_name and last_name columns to volunteer_profiles table
ALTER TABLE volunteer_profiles
ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT '';
