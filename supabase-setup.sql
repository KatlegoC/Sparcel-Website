-- Create the parcel_journeys table for Sparcel
CREATE TABLE IF NOT EXISTS parcel_journeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bag_id TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_id_number TEXT,
  recipient_name TEXT,
  recipient_phone TEXT,
  recipient_email TEXT,
  from_location JSONB,
  to_location JSONB,
  parcel_size TEXT,
  number_of_boxes INTEGER DEFAULT 1,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-transit', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on bag_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_bag_id ON parcel_journeys(bag_id);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_status ON parcel_journeys(status);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_parcel_journeys_updated_at 
    BEFORE UPDATE ON parcel_journeys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE parcel_journeys ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for now - you can restrict this later)
CREATE POLICY "Allow all operations on parcel_journeys" ON parcel_journeys
    FOR ALL USING (true)
    WITH CHECK (true); 