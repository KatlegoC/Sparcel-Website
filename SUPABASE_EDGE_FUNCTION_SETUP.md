# 🚀 Supabase Edge Function Setup - Email Service

## Problem Solved
The original issue was **CORS (Cross-Origin Resource Sharing)** blocking direct calls from the browser to Resend API. This is solved by using a **Supabase Edge Function** that runs on the server side.

---

## 📋 Setup Steps

### Step 1: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
# Get your project reference from Supabase dashboard
supabase link --project-ref YOUR_PROJECT_REF

# Your project ref is in the URL: https://app.supabase.com/project/YOUR_PROJECT_REF
```

### Step 4: Add Resend API Key to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Click **Environment Variables**
4. Add a new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_E66hrzkF_By4ZS4xMgPAKdc7x5yAD1JAj`

### Step 5: Deploy the Edge Function

```bash
# Deploy the email function
supabase functions deploy send-email

# Wait for deployment to complete
```

### Step 6: Update Your Supabase Credentials

Make sure your `.env.local` has the correct Supabase URL:

```bash
# Replace with your actual Supabase project URL
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Remove this line (no longer needed in client)
# VITE_RESEND_API_KEY=re_E66hrzkF_By4ZS4xMgPAKdc7x5yAD1JAj
```

---

## ✅ Verification

### Check Edge Function is Deployed:

1. Go to **Supabase Dashboard** → **Edge Functions**
2. You should see `send-email` function listed
3. Click on it to see deployment status

### Test the Function:

```bash
# Test the function locally (optional)
supabase functions serve send-email
```

---

## 🔄 How It Works Now

### Before (CORS Error):
```
Browser → Resend API ❌ (Blocked by CORS)
```

### After (Working):
```
Browser → Supabase Edge Function → Resend API ✅
```

### Flow:
1. **User submits booking form**
2. **Browser calls Supabase Edge Function** (no CORS issues)
3. **Edge Function calls Resend API** (server-to-server)
4. **Emails sent successfully**
5. **Response sent back to browser**

---

## 🧪 Testing

1. **Update your `.env.local`** with correct Supabase URL
2. **Restart your dev server**: `npm run dev`
3. **Test booking** with the QR code
4. **Check console logs** - should show:
   ```
   📧 Sending emails via Supabase Edge Function...
   📡 Email service response status: 200
   ✅ Both emails sent successfully!
   ```

---

## 🚨 Troubleshooting

### Function Not Found Error:
```
❌ Failed to send emails. Status: 404
```
**Solution**: Make sure the function is deployed and the Supabase URL is correct.

### Environment Variable Error:
```
❌ Email service not configured
```
**Solution**: Make sure `RESEND_API_KEY` is set in Supabase Edge Functions environment variables.

### Supabase Connection Error:
```
❌ Supabase URL not configured
```
**Solution**: Make sure `VITE_SUPABASE_URL` is set in `.env.local`.

---

## 📁 Files Created

1. ✅ `supabase/functions/send-email/index.ts` - Edge Function code
2. ✅ Updated `src/lib/emailService.ts` - Client code to use Edge Function

---

## 🎯 Benefits

- ✅ **No CORS issues** - Server-to-server communication
- ✅ **Secure API keys** - Stored in Supabase, not exposed to browser
- ✅ **Better error handling** - Detailed logs in Supabase dashboard
- ✅ **Scalable** - Handles multiple requests efficiently
- ✅ **Free tier** - Supabase Edge Functions have generous limits

---

## 📞 Next Steps

1. **Install Supabase CLI** and login
2. **Link your project** with correct project ref
3. **Add Resend API key** to Supabase environment variables
4. **Deploy the function** with `supabase functions deploy send-email`
5. **Update `.env.local`** with correct Supabase URL
6. **Test the complete flow** with a new QR code

---

**Created:** 2025-10-15  
**Status:** ✅ Ready to Deploy  
**Issue Fixed:** ✅ CORS Problem Solved
