-- Supabase QR Codes Migration
-- Run this in your Supabase SQL editor

-- Create QR codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bag_id VARCHAR(50) UNIQUE NOT NULL,
  qr_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_bag_id ON public.qr_codes(bag_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON public.qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON public.qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_used_at ON public.qr_codes(used_at);

-- Create storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-codes', 
  'qr-codes', 
  true, 
  1048576, -- 1MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read QR codes
CREATE POLICY "Allow authenticated users to read QR codes" ON public.qr_codes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow service role to insert QR codes
CREATE POLICY "Allow service role to insert QR codes" ON public.qr_codes
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow service role to update QR codes
CREATE POLICY "Allow service role to update QR codes" ON public.qr_codes
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policy: Allow service role to delete QR codes
CREATE POLICY "Allow service role to delete QR codes" ON public.qr_codes
  FOR DELETE USING (auth.role() = 'service_role');

-- Storage policies for QR codes bucket
CREATE POLICY "Allow public read access to QR codes" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-codes');

CREATE POLICY "Allow service role to upload QR codes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'service_role');

CREATE POLICY "Allow service role to update QR codes" ON storage.objects
  FOR UPDATE USING (bucket_id = 'qr-codes' AND auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete QR codes" ON storage.objects
  FOR DELETE USING (bucket_id = 'qr-codes' AND auth.role() = 'service_role');

-- Function to automatically update used_at when a parcel journey is created
CREATE OR REPLACE FUNCTION update_qr_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the QR code status to 'used' and set used_at timestamp
  UPDATE public.qr_codes 
  SET 
    status = 'used',
    used_at = NOW()
  WHERE bag_id = NEW.bag_id AND status = 'active';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update QR code usage
CREATE TRIGGER trigger_update_qr_code_usage
  AFTER INSERT ON public.parcel_journeys
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_code_usage();

-- Create a view for QR code statistics
CREATE OR REPLACE VIEW qr_code_stats AS
SELECT 
  COUNT(*) as total_qr_codes,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_qr_codes,
  COUNT(CASE WHEN status = 'used' THEN 1 END) as used_qr_codes,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_qr_codes,
  COUNT(CASE WHEN used_at IS NOT NULL THEN 1 END) as total_used,
  COUNT(CASE WHEN used_at IS NULL THEN 1 END) as total_unused,
  DATE_TRUNC('day', created_at) as date_created
FROM public.qr_codes
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date_created DESC;

-- Grant permissions
GRANT SELECT ON qr_code_stats TO authenticated;
GRANT ALL ON public.qr_codes TO service_role;

-- Insert some sample data (optional - remove in production)
-- INSERT INTO public.qr_codes (bag_id, qr_url, storage_path, public_url) VALUES
-- ('BAG123456', 'https://www.sparcel.co.za/?bag=BAG123456', 'qr-BAG123456.png', 'https://your-project.supabase.co/storage/v1/object/public/qr-codes/qr-BAG123456.png');

COMMENT ON TABLE public.qr_codes IS 'Stores metadata for generated QR codes';
COMMENT ON COLUMN public.qr_codes.bag_id IS 'Unique bag identifier used in QR code URL';
COMMENT ON COLUMN public.qr_codes.qr_url IS 'Full URL encoded in the QR code';
COMMENT ON COLUMN public.qr_codes.storage_path IS 'Path to QR code image in Supabase Storage';
COMMENT ON COLUMN public.qr_codes.public_url IS 'Public URL to access the QR code image';
COMMENT ON COLUMN public.qr_codes.status IS 'Status of the QR code: active, used, or inactive';
COMMENT ON COLUMN public.qr_codes.used_at IS 'Timestamp when the QR code was first used for a parcel journey';
