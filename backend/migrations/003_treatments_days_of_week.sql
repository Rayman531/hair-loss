-- Add days_of_week column to treatments table
-- This stores the specific days a treatment is scheduled (e.g. ['monday', 'wednesday', 'friday'])
ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS days_of_week text[] NOT NULL DEFAULT '{}';
