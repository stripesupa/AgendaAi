/*
  # Initial database schema for AgendaFull

  1. New Tables
    - `users` - Store barbershop information
    - `services` - Store services offered by barbershops
    - `working_hours` - Store working hours for each day of the week
    - `appointments` - Store client appointments

  2. Security
    - Enable RLS on all tables
    - Set up policies for authenticated users to access their own data
*/

-- Create users table to store barbershop information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  shop_name TEXT NOT NULL,
  shop_slug TEXT NOT NULL UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create working hours table
CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL, -- 0-6, where 0 is Sunday
  start_time TEXT NOT NULL, -- format: "09:00"
  end_time TEXT NOT NULL, -- format: "18:00"
  is_working_day BOOLEAN NOT NULL DEFAULT TRUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ensure each user has only one entry per day
  UNIQUE(user_id, day_of_week)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for users
-- Users can only read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for services
-- Owners can perform all operations on their services
CREATE POLICY "Owners can perform all operations on their services" ON services
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can read services (for public booking page)
CREATE POLICY "Anyone can read services" ON services
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for working hours
-- Owners can perform all operations on their working hours
CREATE POLICY "Owners can perform all operations on their working hours" ON working_hours
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can read working hours (for public booking page)
CREATE POLICY "Anyone can read working hours" ON working_hours
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for appointments
-- Owners can perform all operations on their appointments
CREATE POLICY "Owners can perform all operations on their appointments" ON appointments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow creating appointments for anyone (for public booking page)
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create function to create user profile after sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, shop_name, shop_slug, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'shop_name',
    NEW.raw_user_meta_data->>'shop_slug',
    'trial'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_user_id ON working_hours(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);