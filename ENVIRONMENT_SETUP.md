# Environment Variables Setup

Add these variables to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# For server-side operations (API routes)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Base URL for QR codes
VITE_QR_BASE_URL=https://www.sparcel.co.za

# Email Configuration (already set)
VITE_RESEND_API_KEY=re_E66hrzkF_By4ZS4xMgPAKdc7x5yAD1JAj
```

## How to get your Supabase keys:

1. Go to your Supabase dashboard
2. Select your project
3. Go to Settings > API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Important Notes:

- The `service_role` key should be kept secret and only used server-side
- The `anon` key is safe to use in frontend code
- Make sure to add `.env.local` to your `.gitignore` file
