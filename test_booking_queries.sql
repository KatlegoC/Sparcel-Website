-- Test Queries for Booking Confirmation Fields
-- Run these queries after applying the migration to verify everything works

-- ============================================================================
-- 1. VERIFY MIGRATION: Check if all new columns exist
-- ============================================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'parcel_journeys'
  AND column_name IN (
    'booking_confirmation',
    'tracking_number',
    'booking_status',
    'courier_company',
    'oid',
    'business_key',
    'track_no',
    'tracking_link',
    'booking_message',
    'booking_status_code',
    'booking_created_at',
    'booking_updated_at'
  )
ORDER BY ordinal_position;

-- Expected: Should return 12 rows


-- ============================================================================
-- 2. CHECK INDEXES: Verify all indexes were created
-- ============================================================================
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE tablename = 'parcel_journeys'
  AND indexname LIKE 'idx_parcel_journeys_%'
ORDER BY indexname;

-- Expected: Should return 5 indexes


-- ============================================================================
-- 3. TEST THE VIEW: Check if parcel_bookings view was created
-- ============================================================================
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_name = 'parcel_bookings';

-- Expected: Should return 1 row with the view definition


-- ============================================================================
-- 4. CHECK TRIGGER: Verify the auto-update trigger exists
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_booking_updated_at';

-- Expected: Should return 1 row


-- ============================================================================
-- 5. SAMPLE DATA: View all parcels with booking information
-- ============================================================================
SELECT 
    bag_id,
    customer_name,
    tracking_number,
    booking_status,
    courier_company,
    oid,
    track_no,
    business_key,
    booking_status_code,
    booking_created_at,
    created_at
FROM parcel_journeys
ORDER BY created_at DESC
LIMIT 10;


-- ============================================================================
-- 6. BOOKING STATISTICS: Count bookings by status
-- ============================================================================
SELECT 
    booking_status,
    COUNT(*) as count,
    COUNT(tracking_number) as with_tracking_number,
    COUNT(oid) as with_oid,
    COUNT(track_no) as with_track_no
FROM parcel_journeys
GROUP BY booking_status
ORDER BY count DESC;


-- ============================================================================
-- 7. RECENT CONFIRMED BOOKINGS: Last 7 days
-- ============================================================================
SELECT 
    bag_id,
    customer_name,
    recipient_name,
    tracking_number,
    courier_company,
    booking_created_at,
    from_location->>'name' as pickup_location,
    to_location->>'name' as delivery_location
FROM parcel_journeys
WHERE booking_status = 'confirmed'
  AND booking_created_at > NOW() - INTERVAL '7 days'
ORDER BY booking_created_at DESC;


-- ============================================================================
-- 8. FAILED BOOKINGS: Check for any booking failures
-- ============================================================================
SELECT 
    bag_id,
    customer_name,
    booking_message,
    booking_status_code,
    booking_created_at
FROM parcel_journeys
WHERE booking_status = 'failed'
ORDER BY booking_created_at DESC;


-- ============================================================================
-- 9. DETAILED BOOKING VIEW: Full booking information for a specific parcel
-- ============================================================================
-- Replace 'BAG123456' with actual bag_id
SELECT 
    bag_id,
    tracking_number,
    booking_status,
    courier_company,
    oid,
    business_key,
    track_no,
    tracking_link,
    booking_message,
    booking_status_code,
    booking_confirmation,
    booking_created_at,
    booking_updated_at
FROM parcel_journeys
WHERE bag_id = 'BAG123456';


-- ============================================================================
-- 10. USE THE VIEW: Simplified booking query
-- ============================================================================
SELECT 
    bag_id,
    customer_name,
    customer_phone,
    recipient_name,
    tracking_number,
    booking_status,
    courier_company,
    pickup_location,
    pickup_address,
    delivery_location,
    delivery_address,
    parcel_size,
    number_of_boxes,
    booking_created_at
FROM parcel_bookings
ORDER BY booking_created_at DESC
LIMIT 20;


-- ============================================================================
-- 11. TRACKING NUMBER SEARCH: Find parcel by tracking number
-- ============================================================================
-- Replace 'TRK123456' with actual tracking number
SELECT 
    bag_id,
    customer_name,
    recipient_name,
    tracking_number,
    booking_status,
    courier_company,
    tracking_link,
    status as delivery_status,
    created_at,
    booking_created_at
FROM parcel_journeys
WHERE tracking_number = 'TRK123456'
   OR oid = 'TRK123456'
   OR track_no = 'TRK123456'
   OR business_key = 'TRK123456';


-- ============================================================================
-- 12. BOOKINGS WITHOUT TRACKING: Find parcels that might need attention
-- ============================================================================
SELECT 
    bag_id,
    customer_name,
    booking_status,
    booking_message,
    booking_status_code,
    created_at
FROM parcel_journeys
WHERE booking_status = 'confirmed'
  AND tracking_number IS NULL
ORDER BY created_at DESC;


-- ============================================================================
-- 13. COURIER COMPANY BREAKDOWN: Count bookings by courier
-- ============================================================================
SELECT 
    courier_company,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN booking_status = 'failed' THEN 1 END) as failed,
    COUNT(CASE WHEN booking_status = 'pending' THEN 1 END) as pending
FROM parcel_journeys
WHERE courier_company IS NOT NULL
GROUP BY courier_company
ORDER BY total_bookings DESC;


-- ============================================================================
-- 14. JSON DATA: Extract specific fields from booking_confirmation
-- ============================================================================
SELECT 
    bag_id,
    booking_confirmation->>'trackNo' as json_track_no,
    booking_confirmation->>'oid' as json_oid,
    booking_confirmation->>'businessKey' as json_business_key,
    booking_confirmation->>'message' as json_message,
    (booking_confirmation->>'statusCode')::integer as json_status_code
FROM parcel_journeys
WHERE booking_confirmation IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;


-- ============================================================================
-- 15. BOOKING UPDATES: Check when bookings were last updated
-- ============================================================================
SELECT 
    bag_id,
    tracking_number,
    booking_status,
    booking_created_at,
    booking_updated_at,
    (booking_updated_at - booking_created_at) as time_since_creation
FROM parcel_journeys
WHERE booking_confirmation IS NOT NULL
ORDER BY booking_updated_at DESC
LIMIT 20;


-- ============================================================================
-- 16. COMPREHENSIVE REPORT: All booking data for export
-- ============================================================================
SELECT 
    pj.bag_id,
    pj.customer_name,
    pj.customer_phone,
    pj.customer_email,
    pj.recipient_name,
    pj.recipient_phone,
    pj.tracking_number,
    pj.booking_status,
    pj.courier_company,
    pj.oid,
    pj.track_no,
    pj.business_key,
    pj.tracking_link,
    pj.booking_message,
    pj.booking_status_code,
    pj.from_location->>'name' as pickup_location,
    pj.from_location->>'address' as pickup_address,
    pj.to_location->>'name' as delivery_location,
    pj.to_location->>'address' as delivery_address,
    pj.parcel_size,
    pj.number_of_boxes,
    pj.special_instructions,
    pj.status as delivery_status,
    pj.created_at as journey_created,
    pj.booking_created_at,
    pj.booking_updated_at
FROM parcel_journeys pj
WHERE pj.booking_confirmation IS NOT NULL
ORDER BY pj.created_at DESC;


-- ============================================================================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- Delete test bookings (BE CAREFUL!)
-- DELETE FROM parcel_journeys WHERE bag_id LIKE 'TEST%';

-- Reset booking status for a specific parcel
-- UPDATE parcel_journeys 
-- SET booking_status = 'pending',
--     booking_confirmation = NULL,
--     tracking_number = NULL
-- WHERE bag_id = 'BAG123456';

