# 🚀 Supabase Setup Instructions

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Enter project details:
   - **Name**: `sparcel-parcel-tracking`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"

### 2. Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Create Environment File
Create a file called `.env.local` in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-setup.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute

### 5. Test the Integration
1. Restart your development server: `npm run dev`
2. Configure a new parcel journey
3. Check your Supabase dashboard → **Table Editor** → `parcel_journeys` to see the data
4. Scan the QR code to verify it loads from Supabase

## ✅ What's Now Working

- **Real-time database storage** instead of localStorage
- **Automatic data persistence** across sessions
- **Proper error handling** with localStorage fallback
- **Upsert operations** (create or update existing records)
- **Data conversion** between local and database formats

## 🔧 Features Added

- **Supabase Integration**: Primary data storage
- **localStorage Fallback**: Backup when Supabase is unavailable
- **Async Operations**: Proper handling of database calls
- **Error Handling**: Graceful degradation to localStorage
- **Data Persistence**: Parcel journeys survive browser restarts

## 🚨 Troubleshooting

### Common Issues
1. **"Missing Supabase environment variables"** - Check `.env.local` file exists
2. **"Table doesn't exist"** - Run the SQL setup script
3. **"Permission denied"** - Check RLS policies in Supabase

### Debug Mode
Check browser console for detailed error messages and database operation logs.

## 📈 Next Steps

- **Add user authentication** for secure access
- **Implement real-time subscriptions** for live updates
- **Add admin dashboard** for courier management
- **Set up email notifications** for status updates


