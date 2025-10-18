# Supabase Database Migration Instructions

This guide will help you add the booking confirmation fields to your `parcel_journeys` table in Supabase.

## What This Migration Does

This migration adds the following fields to store **Dropper Group API booking confirmation data**:

### New Columns Added:
1. **`booking_confirmation`** (JSONB) - Full JSON response from Dropper Group API
2. **`tracking_number`** (TEXT) - Primary tracking number (trackNo || businessKey || oid)
3. **`booking_status`** (TEXT) - Status: 'pending', 'confirmed', or 'failed'
4. **`courier_company`** (TEXT) - Name of courier company (e.g., "Dropper Group")
5. **`oid`** (TEXT) - Object ID from Dropper Group API
6. **`business_key`** (TEXT) - Business Key from Dropper Group API
7. **`track_no`** (TEXT) - Tracking Number from Dropper Group API
8. **`tracking_link`** (TEXT) - URL to track the parcel
9. **`booking_message`** (TEXT) - Message from booking API response
10. **`booking_status_code`** (INTEGER) - HTTP status code from booking API
11. **`booking_created_at`** (TIMESTAMPTZ) - When booking was created
12. **`booking_updated_at`** (TIMESTAMPTZ) - When booking was last updated

### Additional Features:
- **Indexes** on `tracking_number`, `oid`, `track_no`, `business_key`, and `booking_status` for faster lookups
- **Auto-updating trigger** for `booking_updated_at` timestamp
- **View** (`parcel_bookings`) for easier querying of booking details

---

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration Script**
   - Open `supabase_migration_add_booking_fields.sql` from this project
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for confirmation message
   - Check for any errors in the output

5. **Verify the Migration**
   - Go to "Table Editor" in the left sidebar
   - Select `parcel_journeys` table
   - Verify that the new columns are visible

---

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to Your Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Run the Migration**
   ```bash
   supabase db push --file supabase_migration_add_booking_fields.sql
   ```

---

## Verification Queries

After running the migration, verify it worked correctly:

### 1. Check if columns exist
```sql
SELECT column_name, data_type, is_nullable
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
    'tracking_link'
  )
ORDER BY column_name;
```

### 2. Check indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'parcel_journeys'
  AND indexname LIKE 'idx_parcel_journeys_%';
```

### 3. Test the view
```sql
SELECT * FROM parcel_bookings LIMIT 5;
```

---

## What Happens to Existing Data?

- **Existing records are safe** - All existing `parcel_journeys` records remain unchanged
- **New columns are nullable** - Existing records will have NULL values for the new booking fields
- **No data loss** - This is an additive migration (only adds columns, doesn't remove anything)

---

## Rollback (if needed)

If you need to undo this migration:

```sql
-- Remove the view
DROP VIEW IF EXISTS parcel_bookings;

-- Remove the trigger
DROP TRIGGER IF EXISTS trigger_update_booking_updated_at ON parcel_journeys;
DROP FUNCTION IF EXISTS update_booking_updated_at();

-- Remove the indexes
DROP INDEX IF EXISTS idx_parcel_journeys_tracking_number;
DROP INDEX IF EXISTS idx_parcel_journeys_oid;
DROP INDEX IF EXISTS idx_parcel_journeys_track_no;
DROP INDEX IF EXISTS idx_parcel_journeys_business_key;
DROP INDEX IF EXISTS idx_parcel_journeys_booking_status;

-- Remove the columns
ALTER TABLE parcel_journeys
DROP COLUMN IF EXISTS booking_confirmation,
DROP COLUMN IF EXISTS tracking_number,
DROP COLUMN IF EXISTS booking_status,
DROP COLUMN IF EXISTS courier_company,
DROP COLUMN IF EXISTS oid,
DROP COLUMN IF EXISTS business_key,
DROP COLUMN IF EXISTS track_no,
DROP COLUMN IF EXISTS tracking_link,
DROP COLUMN IF EXISTS booking_message,
DROP COLUMN IF EXISTS booking_status_code,
DROP COLUMN IF EXISTS booking_created_at,
DROP COLUMN IF EXISTS booking_updated_at;
```

---

## Testing After Migration

1. **Create a test parcel journey** using the app
2. **Check the database** to ensure all fields are being saved
3. **Scan the QR code again** to verify the courier dashboard displays correctly

### Example Query to Check Data:
```sql
SELECT 
  bag_id,
  tracking_number,
  booking_status,
  courier_company,
  oid,
  track_no,
  booking_created_at
FROM parcel_journeys
WHERE bag_id = 'YOUR_TEST_BAG_ID';
```

---

## Support

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify your database permissions
3. Ensure you have the necessary privileges to ALTER tables

---

## Next Steps After Migration

Once the migration is complete:
1. The app is already updated to save all booking fields ✅
2. Test the QR code flow with a new booking
3. Check that tracking numbers are properly saved
4. Verify the courier dashboard displays all booking details

---

**Migration File:** `supabase_migration_add_booking_fields.sql`  
**Created:** 2025-10-15  
**Version:** 1.0

