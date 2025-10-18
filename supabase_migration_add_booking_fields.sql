-- Migration: Add Booking Confirmation Fields to parcel_journeys table
-- This script adds fields to store Dropper Group API booking response data

-- Add new columns to parcel_journeys table
ALTER TABLE parcel_journeys
ADD COLUMN IF NOT EXISTS booking_confirmation JSONB,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS booking_status TEXT CHECK (booking_status IN ('pending', 'confirmed', 'failed')),
ADD COLUMN IF NOT EXISTS courier_company TEXT,
ADD COLUMN IF NOT EXISTS oid TEXT,
ADD COLUMN IF NOT EXISTS business_key TEXT,
ADD COLUMN IF NOT EXISTS track_no TEXT,
ADD COLUMN IF NOT EXISTS tracking_link TEXT,
ADD COLUMN IF NOT EXISTS booking_message TEXT,
ADD COLUMN IF NOT EXISTS booking_status_code INTEGER,
ADD COLUMN IF NOT EXISTS booking_created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS booking_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on tracking_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_tracking_number ON parcel_journeys(tracking_number);

-- Create index on oid for faster lookups
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_oid ON parcel_journeys(oid);

-- Create index on track_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_track_no ON parcel_journeys(track_no);

-- Create index on business_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_business_key ON parcel_journeys(business_key);

-- Create index on booking_status for filtering
CREATE INDEX IF NOT EXISTS idx_parcel_journeys_booking_status ON parcel_journeys(booking_status);

-- Add comments to document the columns
COMMENT ON COLUMN parcel_journeys.booking_confirmation IS 'Full JSON response from Dropper Group API booking';
COMMENT ON COLUMN parcel_journeys.tracking_number IS 'Primary tracking number (trackNo || businessKey || oid)';
COMMENT ON COLUMN parcel_journeys.booking_status IS 'Status of the booking: pending, confirmed, or failed';
COMMENT ON COLUMN parcel_journeys.courier_company IS 'Name of the courier company (e.g., Dropper Group)';
COMMENT ON COLUMN parcel_journeys.oid IS 'Object ID from Dropper Group API';
COMMENT ON COLUMN parcel_journeys.business_key IS 'Business Key from Dropper Group API';
COMMENT ON COLUMN parcel_journeys.track_no IS 'Tracking Number from Dropper Group API';
COMMENT ON COLUMN parcel_journeys.tracking_link IS 'URL link to track the parcel';
COMMENT ON COLUMN parcel_journeys.booking_message IS 'Message from the booking API response';
COMMENT ON COLUMN parcel_journeys.booking_status_code IS 'HTTP status code from booking API';
COMMENT ON COLUMN parcel_journeys.booking_created_at IS 'When the booking was first created';
COMMENT ON COLUMN parcel_journeys.booking_updated_at IS 'When the booking was last updated';

-- Create a function to automatically update booking_updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if booking-related fields have changed
    IF (NEW.booking_confirmation IS DISTINCT FROM OLD.booking_confirmation OR
        NEW.booking_status IS DISTINCT FROM OLD.booking_status OR
        NEW.tracking_number IS DISTINCT FROM OLD.tracking_number) THEN
        NEW.booking_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update booking_updated_at
DROP TRIGGER IF EXISTS trigger_update_booking_updated_at ON parcel_journeys;
CREATE TRIGGER trigger_update_booking_updated_at
    BEFORE UPDATE ON parcel_journeys
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_updated_at();

-- Optional: Create a view for easier querying of booking details
CREATE OR REPLACE VIEW parcel_bookings AS
SELECT 
    pj.id,
    pj.bag_id,
    pj.customer_name,
    pj.customer_phone,
    pj.customer_email,
    pj.recipient_name,
    pj.recipient_phone,
    pj.status,
    pj.tracking_number,
    pj.booking_status,
    pj.courier_company,
    pj.oid,
    pj.business_key,
    pj.track_no,
    pj.tracking_link,
    pj.booking_message,
    pj.booking_status_code,
    pj.booking_created_at,
    pj.booking_updated_at,
    pj.created_at,
    pj.from_location->>'name' as pickup_location,
    pj.from_location->>'address' as pickup_address,
    pj.to_location->>'name' as delivery_location,
    pj.to_location->>'address' as delivery_address,
    pj.parcel_size,
    pj.number_of_boxes
FROM parcel_journeys pj;

COMMENT ON VIEW parcel_bookings IS 'Simplified view of parcel journeys with booking details';

-- Grant permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT, UPDATE ON parcel_journeys TO authenticated;
-- GRANT SELECT ON parcel_bookings TO authenticated;

