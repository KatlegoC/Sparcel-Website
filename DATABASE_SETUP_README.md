# Database Setup - Complete Guide

This folder contains everything you need to add booking confirmation fields to your Supabase database.

## 📁 Files Included

### 1. **`supabase_migration_add_booking_fields.sql`**
   - **Purpose:** SQL migration script to add booking fields to the database
   - **What it does:** 
     - Adds 12 new columns for booking data
     - Creates 5 indexes for fast lookups
     - Creates auto-update trigger for timestamps
     - Creates `parcel_bookings` view for easier querying
   - **How to use:** Run this script in Supabase SQL Editor

### 2. **`SUPABASE_MIGRATION_INSTRUCTIONS.md`**
   - **Purpose:** Step-by-step guide to apply the migration
   - **Contains:**
     - Instructions for Supabase Dashboard method
     - Instructions for Supabase CLI method
     - Verification queries
     - Rollback instructions (if needed)
     - Testing steps

### 3. **`BOOKING_DATA_STRUCTURE.md`**
   - **Purpose:** Documentation of booking data structure
   - **Contains:**
     - Complete database schema
     - Data flow explanation
     - Example data
     - Query examples
     - App code references

### 4. **`test_booking_queries.sql`**
   - **Purpose:** Test queries to verify migration and explore data
   - **Contains:**
     - 16+ SQL queries for testing
     - Verification queries
     - Statistics queries
     - Search queries
     - Reporting queries

---

## 🚀 Quick Start Guide

### Step 1: Apply the Migration
1. Open your Supabase Dashboard
2. Go to SQL Editor → New Query
3. Copy and paste the contents of `supabase_migration_add_booking_fields.sql`
4. Click "Run"
5. Wait for confirmation

### Step 2: Verify Migration
1. In SQL Editor, run this query:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'parcel_journeys'
  AND column_name IN ('booking_confirmation', 'tracking_number', 'oid', 'track_no');
```
2. Should return 4 rows

### Step 3: Test the App
1. The app code is already updated ✅
2. Create a new parcel journey through the app
3. Check if booking data is saved correctly
4. Use queries from `test_booking_queries.sql` to verify

---

## 📊 What Data Gets Stored

### From Dropper Group API Response:
```json
{
  "oid": "OID12345678",              // → Saved to: oid
  "businessKey": "BK987654321",      // → Saved to: business_key
  "trackNo": "TRK789012345",         // → Saved to: track_no
  "statusCode": 200,                 // → Saved to: booking_status_code
  "message": "Booking successful",   // → Saved to: booking_message
  "link": "https://track...."        // → Saved to: tracking_link
}
```

### Additional Fields Set by App:
- `tracking_number` = trackNo || businessKey || oid
- `booking_status` = 'confirmed' / 'pending' / 'failed'
- `courier_company` = 'Dropper Group' (or other provider)
- `booking_confirmation` = Full JSON response (JSONB)

---

## 🔍 Useful Queries

### Find Booking by Bag ID
```sql
SELECT * FROM parcel_bookings WHERE bag_id = 'BAG123456';
```

### Find Booking by Tracking Number
```sql
SELECT * FROM parcel_journeys WHERE tracking_number = 'TRK789012';
```

### Get All Confirmed Bookings (Last 7 Days)
```sql
SELECT * FROM parcel_bookings 
WHERE booking_status = 'confirmed' 
  AND booking_created_at > NOW() - INTERVAL '7 days';
```

### Check Failed Bookings
```sql
SELECT bag_id, booking_message, booking_status_code 
FROM parcel_journeys 
WHERE booking_status = 'failed';
```

More queries available in `test_booking_queries.sql`

---

## 🔧 App Updates (Already Done)

The app code has been updated to automatically save all booking fields:

**File:** `src/components/ParcelTracker.tsx`

**Lines 442-450:** Saves booking data to Supabase
```typescript
booking_confirmation: journey.booking_confirmation,
tracking_number: journey.tracking_number,
booking_status: journey.booking_status,
courier_company: journey.courier_company,
oid: journey.booking_confirmation?.oid,
business_key: journey.booking_confirmation?.businessKey,
track_no: journey.booking_confirmation?.trackNo,
tracking_link: journey.booking_confirmation?.link,
booking_message: journey.booking_confirmation?.message,
booking_status_code: journey.booking_confirmation?.statusCode
```

---

## ✅ Migration Checklist

- [ ] Run `supabase_migration_add_booking_fields.sql` in Supabase
- [ ] Verify columns exist (query from Step 2 above)
- [ ] Verify indexes exist (query #2 in `test_booking_queries.sql`)
- [ ] Verify view exists (query #3 in `test_booking_queries.sql`)
- [ ] Test creating a new parcel journey in the app
- [ ] Check if booking data is saved (query #5 in `test_booking_queries.sql`)
- [ ] Test QR code scanning flow
- [ ] Verify courier dashboard shows booking details

---

## 📞 Database Fields Reference

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `booking_confirmation` | JSONB | Full API response | `{"oid": "...", "trackNo": "..."}` |
| `tracking_number` | TEXT | Primary tracking ID | `TRK789012` |
| `booking_status` | TEXT | confirmed/pending/failed | `confirmed` |
| `courier_company` | TEXT | Courier provider | `Dropper Group` |
| `oid` | TEXT | Object ID | `OID12345678` |
| `business_key` | TEXT | Business ref | `BK987654321` |
| `track_no` | TEXT | Tracking number | `TRK789012345` |
| `tracking_link` | TEXT | Tracking URL | `https://track...` |
| `booking_message` | TEXT | API message | `Booking successful` |
| `booking_status_code` | INTEGER | HTTP status | `200` |
| `booking_created_at` | TIMESTAMPTZ | Created time | `2025-10-15 14:30:00` |
| `booking_updated_at` | TIMESTAMPTZ | Updated time | `2025-10-15 14:30:00` |

---

## 🛡️ Safety Notes

- ✅ **No data loss** - This migration only adds columns
- ✅ **Existing data safe** - All current records remain unchanged
- ✅ **Backward compatible** - Old records will have NULL in new fields
- ✅ **Rollback available** - See `SUPABASE_MIGRATION_INSTRUCTIONS.md`

---

## 📚 Additional Resources

- **Supabase Documentation:** https://supabase.com/docs
- **PostgreSQL JSONB:** https://www.postgresql.org/docs/current/datatype-json.html
- **Database Indexes:** https://supabase.com/docs/guides/database/indexes

---

## 🎯 Next Steps After Setup

1. **Test the complete flow:**
   - Generate a QR code
   - Scan and configure a journey
   - Select a delivery quote
   - Submit the booking
   - Scan again to view courier dashboard

2. **Monitor bookings:**
   - Use `parcel_bookings` view for reports
   - Check `booking_status` regularly
   - Track failed bookings

3. **Optimize queries:**
   - Indexes are already created
   - Use the view for common queries
   - Monitor database performance

---

**Created:** 2025-10-15  
**Version:** 1.0  
**Status:** Ready to Deploy ✅

