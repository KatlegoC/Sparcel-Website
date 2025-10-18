-- Update existing parcel_journeys table with new columns
-- This is safe to run on existing tables with data

-- Add missing columns to existing table
ALTER TABLE parcel_journeys 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_id_number TEXT,
ADD COLUMN IF NOT EXISTS recipient_email TEXT;

-- Verify the table structure (optional - just to check)
-- You can run this to see all columns:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'parcel_journeys' 
-- ORDER BY ordinal_position;


