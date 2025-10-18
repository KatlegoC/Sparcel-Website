# Booking Data Structure

This document explains what booking data is stored in the database for each parcel journey.

## Database Schema Overview

### `parcel_journeys` Table - Booking Fields

| Column Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| `booking_confirmation` | JSONB | Full API response from Dropper Group | `{"oid": "12345", "trackNo": "TRK789", ...}` |
| `tracking_number` | TEXT | Primary tracking ID (prioritized) | `"TRK789012"` |
| `booking_status` | TEXT | Status of booking | `"confirmed"` |
| `courier_company` | TEXT | Courier provider name | `"Dropper Group"` |
| `oid` | TEXT | Object ID from API | `"OID12345678"` |
| `business_key` | TEXT | Business reference key | `"BK987654321"` |
| `track_no` | TEXT | Tracking number from API | `"TRK789012"` |
| `tracking_link` | TEXT | URL to track parcel | `"https://track.dropper.co.za/..."` |
| `booking_message` | TEXT | API response message | `"Booking successful"` |
| `booking_status_code` | INTEGER | HTTP status code | `200` |
| `booking_created_at` | TIMESTAMPTZ | When booking was created | `"2025-10-15 14:30:00"` |
| `booking_updated_at` | TIMESTAMPTZ | Last update timestamp | `"2025-10-15 14:30:00"` |

---

## Data Flow

### 1. User Configures Parcel Journey
```json
{
  "bag_id": "BAG123456",
  "customer_name": "John Doe",
  "customer_phone": "0821234567",
  "customer_email": "john@example.com",
  "from_location": {...},
  "to_location": {...},
  "parcel_size": "medium",
  "number_of_boxes": 2
}
```

### 2. System Creates Booking with Dropper Group API

**API Response Example:**
```json
{
  "oid": "OID987654321",
  "businessKey": "BK123456789",
  "trackNo": "TRK789012345",
  "statusCode": 200,
  "message": "Booking created successfully",
  "link": "https://track.dropper.co.za/TRK789012345"
}
```

### 3. Data Saved to Database

**Full Record in `parcel_journeys` Table:**
```json
{
  "bag_id": "BAG123456",
  "customer_name": "John Doe",
  "customer_phone": "0821234567",
  "customer_email": "john@example.com",
  "customer_id_number": "9001015800088",
  "recipient_name": "Jane Smith",
  "recipient_phone": "0829876543",
  "recipient_email": "jane@example.com",
  "from_location": {
    "lat": -33.9249,
    "lng": 18.4241,
    "name": "Spaza Shop - Khayelitsha",
    "address": "123 Main Rd, Khayelitsha, Cape Town"
  },
  "to_location": {
    "lat": -33.9258,
    "lng": 18.4232,
    "name": "Spaza Shop - Gugulethu",
    "address": "456 NY Rd, Gugulethu, Cape Town"
  },
  "parcel_size": "medium",
  "number_of_boxes": 2,
  "special_instructions": "Handle with care",
  "status": "pending",
  
  // BOOKING CONFIRMATION FIELDS (NEW):
  "booking_confirmation": {
    "oid": "OID987654321",
    "businessKey": "BK123456789",
    "trackNo": "TRK789012345",
    "statusCode": 200,
    "message": "Booking created successfully",
    "link": "https://track.dropper.co.za/TRK789012345"
  },
  "tracking_number": "TRK789012345",      // Prioritized: trackNo || businessKey || oid
  "booking_status": "confirmed",           // confirmed/pending/failed
  "courier_company": "Dropper Group",
  "oid": "OID987654321",
  "business_key": "BK123456789",
  "track_no": "TRK789012345",
  "tracking_link": "https://track.dropper.co.za/TRK789012345",
  "booking_message": "Booking created successfully",
  "booking_status_code": 200,
  "booking_created_at": "2025-10-15T14:30:00Z",
  "booking_updated_at": "2025-10-15T14:30:00Z",
  "created_at": "2025-10-15T14:25:00Z"
}
```

---

## Tracking Number Priority

The `tracking_number` field uses the following priority:

```javascript
tracking_number = trackNo || businessKey || oid || 'N/A'
```

**Priority Order:**
1. **`trackNo`** (preferred) - The actual courier tracking number
2. **`businessKey`** (fallback) - Business reference if trackNo not available
3. **`oid`** (fallback) - Object ID if neither trackNo nor businessKey available
4. **`'N/A'`** (last resort) - If none of the above are available

---

## Booking Status Values

| Status | Description | When It's Set |
|--------|-------------|---------------|
| `pending` | Booking not yet confirmed | Before API call or during processing |
| `confirmed` | Booking successful | When `trackNo`, `businessKey`, `oid`, or `statusCode === 200` |
| `failed` | Booking failed | When API returns error or no success indicators |

---

## Query Examples

### Get All Confirmed Bookings
```sql
SELECT bag_id, tracking_number, courier_company, booking_created_at
FROM parcel_journeys
WHERE booking_status = 'confirmed'
ORDER BY booking_created_at DESC;
```

### Find Booking by Tracking Number
```sql
SELECT *
FROM parcel_journeys
WHERE tracking_number = 'TRK789012345';
```

### Get Failed Bookings
```sql
SELECT bag_id, booking_message, booking_status_code
FROM parcel_journeys
WHERE booking_status = 'failed';
```

### Use the View for Simplified Access
```sql
SELECT *
FROM parcel_bookings
WHERE booking_status = 'confirmed'
  AND booking_created_at > NOW() - INTERVAL '7 days';
```

---

## App Code Reference

### Where Data is Saved

**File:** `src/components/ParcelTracker.tsx`

**Lines 760-786:** After successful booking creation
```typescript
// Store booking confirmation in the journey data
journeyData.booking_confirmation = bookingResponse;

// Also store booking details separately for easy access
journeyData.tracking_number = bookingResponse.trackNo || bookingResponse.businessKey || bookingResponse.oid || 'N/A';
journeyData.booking_status = 'confirmed';
journeyData.courier_company = localQuoteSelection?.provider || 'Dropper Group';

// Update the saved journey with booking confirmation
await saveJourneyToStorage(journeyData);
```

**Lines 442-450:** Save to Supabase with all booking fields
```typescript
await supabase.from('parcel_journeys').upsert({
  // ... other fields ...
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
});
```

---

## Integration Points

### 1. Dropper Group API
- **Endpoint:** `https://api.droppergroup.co.za/droppa/services/v1/create/book`
- **Method:** POST
- **Returns:** `DropperBookingResponse` object

### 2. Local Storage (Fallback)
- Key: `parcelJourneys`
- Stores same data structure if Supabase is unavailable

### 3. Courier Dashboard Display
- **Lines 919-950:** Display booking information in courier view
- Shows: tracking number, booking status, courier company, tracking link

---

## Important Notes

1. **Full API Response Preserved:** The entire `booking_confirmation` JSONB field stores the complete API response for reference
2. **Individual Fields for Querying:** Separate columns (`oid`, `track_no`, etc.) allow fast indexed queries
3. **Auto-updating Timestamp:** `booking_updated_at` automatically updates when booking fields change
4. **Backward Compatible:** Existing records without bookings will have NULL values in these fields

---

**Last Updated:** 2025-10-15  
**Database Version:** 1.0

