# Supabase Setup for Sparcel Parcel Tracking

## 🚀 Quick Setup

### 1. Environment Variables
The `.env.local` file has been created with your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your public API key

### 2. Database Setup
Run the SQL script in your Supabase SQL Editor:

1. Go to [https://supabase.com/dashboard/project/kqukfdnkjbqeqgmbxvhz](https://supabase.com/dashboard/project/kqukfdnkjbqeqgmbxvhz)
2. Click **"SQL Editor"** in the left sidebar
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **"Run"** to execute the script

### 3. What Gets Created
- **`parcel_journeys`** table with all necessary fields
- **Indexes** for fast lookups by bag_id and status
- **Automatic timestamp updates** via triggers
- **Row Level Security (RLS)** enabled with open policies

## 📊 Database Schema

```sql
parcel_journeys
├── id (UUID, Primary Key)
├── bag_id (TEXT, Unique)
├── customer_name (TEXT)
├── customer_phone (TEXT)
├── recipient_name (TEXT)
├── recipient_phone (TEXT)
├── from_location (JSONB)
├── to_location (JSONB)
├── parcel_size (TEXT)
├── number_of_boxes (INTEGER)
├── special_instructions (TEXT)
├── status (TEXT: pending/in-transit/delivered)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔧 Features

### ✅ What's Working Now
- **Real-time database storage** instead of localStorage
- **Automatic data persistence** across sessions
- **Proper error handling** for database operations
- **Data conversion** between local and database formats
- **Upsert operations** (create or update existing records)

### 🎯 Benefits
- **Data persistence** - parcel journeys survive browser restarts
- **Scalability** - can handle thousands of parcels
- **Real-time updates** - multiple users can see the same data
- **Backup & recovery** - automatic database backups
- **Analytics** - can query parcel data for business insights

## 🧪 Testing

1. **Configure a new parcel** - data saves to Supabase
2. **Scan the same QR code** - loads data from database
3. **Check Supabase dashboard** - see your data in real-time

## 🔒 Security Notes

- **RLS is enabled** but currently allows all operations
- **Consider restricting access** based on your business rules
- **API key is public** (safe for client-side use)

## 🚨 Troubleshooting

### Common Issues
1. **"Missing Supabase environment variables"** - Check `.env.local` file
2. **"Table doesn't exist"** - Run the SQL setup script
3. **"Permission denied"** - Check RLS policies in Supabase

### Debug Mode
Check browser console for detailed error messages and database operation logs.

## 📈 Next Steps

- **Add user authentication** for secure access
- **Implement real-time subscriptions** for live updates
- **Add admin dashboard** for courier management
- **Set up email notifications** for status updates 