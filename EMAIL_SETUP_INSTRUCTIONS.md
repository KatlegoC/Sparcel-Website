# 📧 Email Confirmation Setup Instructions

## Overview

The app now sends beautiful HTML email confirmations to both the **customer** (sender) and **recipient** when a parcel journey is booked successfully.

---

## 🚀 Quick Setup with Resend (Recommended)

### Step 1: Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. **Free Tier**: 3,000 emails/month (perfect for getting started!)

### Step 2: Get Your API Key
1. After signing in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Name it something like "Sparcel Production"
4. Copy the API key (starts with `re_...`)

### Step 3: Verify Your Domain (Optional but Recommended)

**Option A: Use Your Own Domain (Best for production)**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `sparcel.co.za`)
4. Add the DNS records shown to your domain registrar
5. Wait for verification (usually 5-10 minutes)
6. Update email addresses in `src/lib/emailService.ts`:
   ```typescript
   from: 'Sparcel <bookings@sparcel.co.za>'
   from: 'Sparcel <notifications@sparcel.co.za>'
   ```

**Option B: Use Resend's Sandbox (For testing)**
- You can send emails immediately without domain verification
- Emails will come from `onboarding@resend.dev`
- Update email addresses in `src/lib/emailService.ts`:
   ```typescript
   from: 'Sparcel <onboarding@resend.dev>'
   ```

### Step 4: Add API Key to Your Project

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add your Resend API key:
   ```bash
   VITE_RESEND_API_KEY=re_your_api_key_here
   ```

3. **Your complete `.env.local` should look like:**
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_RESEND_API_KEY=re_your_api_key_here
   ```

### Step 5: Restart Your Dev Server

```bash
npm run dev
```

---

## ✅ What Gets Sent

### Customer Email (Sender)
- **Subject**: `✅ Booking Confirmed - BAG123456`
- **Contains**:
  - Booking details (Bag ID, Tracking Number, Courier)
  - **Drop-off instructions** with pickup location name and address
  - Delivery location details
  - Recipient information
  - Parcel size and box count
  - Track parcel button (if tracking link available)

### Recipient Email
- **Subject**: `📦 Parcel On The Way - TRK123456`
- **Contains**:
  - Notification that someone sent them a parcel
  - Tracking information
  - Delivery location details
  - Parcel details
  - Sender contact information
  - Track parcel button (if tracking link available)

---

## 🎨 Email Preview

### Customer Email Example:
```
🎉 Booking Confirmed!
Your parcel journey is all set

📦 Booking Details
Bag ID: BAG123456
Tracking Number: TRK789012
Courier: Dropper Group
[Track Your Parcel Button]

📍 NEXT STEP - Drop Off Your Parcel
Please take your parcel to:
Spaza Shop - Khayelitsha
123 Main Rd, Khayelitsha, Cape Town

✅ Your parcel is booked for collection at this pickup point

📍 Delivery Details
Delivering to: Spaza Shop - Gugulethu
456 NY Rd, Gugulethu, Cape Town
Recipient: Jane Doe
Contact: 0829876543

📋 Parcel Information
Size: MEDIUM
Number of Boxes: 2
```

---

## 🔧 Testing

### Test Locally:

1. **With API Key Configured:**
   - Fill out the parcel booking form
   - Submit with valid customer and recipient emails
   - Check your email inboxes for confirmation emails
   - Check browser console for email sending logs

2. **Without API Key (Development):**
   - Emails won't be sent
   - App still works normally
   - Console will show: `⚠️ Resend API key not configured. Skipping email sending.`
   - Console will log: `📧 Email would have been sent to: [emails]`

---

## 🚨 Troubleshooting

### Emails Not Being Sent?

1. **Check API Key is Set:**
   ```bash
   # In your terminal
   echo $VITE_RESEND_API_KEY
   ```
   Should show your API key

2. **Check Environment Variables Loaded:**
   - Restart your dev server after adding `.env.local`
   - Environment variables only load on server start

3. **Check Resend Dashboard:**
   - Go to **Logs** in Resend dashboard
   - See if API requests are being received
   - Check for any error messages

4. **Check Browser Console:**
   - Look for email sending logs
   - Check for any error messages

5. **Check Email Addresses:**
   - Make sure customer and recipient emails are valid
   - Check spam folder for received emails

### Domain Verification Issues?

1. **DNS Records Not Propagating:**
   - DNS changes can take up to 24-48 hours
   - Use [DNSChecker.org](https://dnschecker.org) to verify propagation

2. **Use Sandbox Mode:**
   - While waiting for domain verification, use `onboarding@resend.dev`
   - Works immediately, no verification needed

---

## 💰 Pricing

### Resend Free Tier:
- ✅ **3,000 emails/month** - FREE
- ✅ **100 emails/day** - FREE
- ✅ **Unlimited domains**
- ✅ **Unlimited team members**

### Paid Plans (if you need more):
- **Pro**: $20/month - 50,000 emails
- **Business**: Custom pricing

For most small to medium businesses, the **free tier is plenty!**

---

## 🔐 Security Notes

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - API keys should stay private

2. **Rotate API Keys Regularly**
   - Create new key in Resend dashboard
   - Delete old key
   - Update `.env.local`

3. **Use Different Keys for Different Environments**
   - Development key for local testing
   - Production key for deployed app

---

## 🎯 Alternative Email Services

If you prefer other services, you can modify `src/lib/emailService.ts`:

### SendGrid
- Free tier: 100 emails/day
- API: https://sendgrid.com/docs/api-reference/

### Mailgun
- Free tier: 5,000 emails/month
- API: https://documentation.mailgun.com/en/latest/

### Postmark
- Free tier: 100 emails/month
- API: https://postmarkapp.com/developer

---

## ✅ Verification Checklist

- [ ] Created Resend account
- [ ] Got API key from dashboard
- [ ] Added `VITE_RESEND_API_KEY` to `.env.local`
- [ ] Restarted dev server
- [ ] Tested booking with real email
- [ ] Received customer email
- [ ] Received recipient email
- [ ] Emails look good on mobile and desktop
- [ ] (Optional) Verified custom domain

---

## 📞 Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Community**: https://resend.com/community

---

**Created:** 2025-10-15  
**Status:** ✅ Ready to Use  
**Free Tier:** 3,000 emails/month

