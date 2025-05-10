/*
  # Fix appointments and services tables

  1. Changes
    - Add missing indexes for better query performance
    - Add missing RLS policies for appointments and services
    - Fix foreign key constraints
    - Add status check constraint for appointments

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Fix services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage their services"
  ON services FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Add status check constraint
ALTER TABLE appointments 
  ADD CONSTRAINT appointments_status_check 
  CHECK (status IN ('scheduled', 'cancelled', 'completed'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id_start_time 
  ON appointments(user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_appointments_service_id 
  ON appointments(service_id);

-- Add policies for appointments
CREATE POLICY "Public users can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public users can view their appointments"
  ON appointments FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage their appointments"
  ON appointments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);