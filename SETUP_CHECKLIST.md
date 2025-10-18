# 🚀 QR Code System Setup Checklist

Follow these steps to complete the setup of your Supabase Storage-based QR code generation system.

## ✅ **Step 1: Database Setup**
- [ ] Go to your Supabase dashboard
- [ ] Navigate to **SQL Editor**
- [ ] Copy and paste the contents of `supabase_qr_codes_migration.sql`
- [ ] Click **Run** to execute the migration
- [ ] Verify the `qr_codes` table was created
- [ ] Verify the `qr-codes` storage bucket was created

## ✅ **Step 2: Environment Variables**
- [ ] Add the following to your `.env.local` file:
  ```env
  VITE_SUPABASE_URL=your_supabase_url_here
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
  VITE_QR_BASE_URL=https://www.sparcel.co.za
  ```
- [ ] Get your keys from Supabase Dashboard > Settings > API
- [ ] Make sure `.env.local` is in your `.gitignore`

## ✅ **Step 3: Dependencies**
- [ ] Run `npm install` to install the qrcode package
- [ ] Verify the package is installed: `npm list qrcode`

## ✅ **Step 4: API Endpoint (Vercel)**
- [ ] Deploy your project to Vercel
- [ ] Add the environment variables in Vercel dashboard
- [ ] Verify the API endpoint is accessible at `/api/generate-qr`

## ✅ **Step 5: Test the System**
- [ ] Add the QRCodeTest component to your app temporarily
- [ ] Run the test to verify everything works
- [ ] Check that QR codes are uploaded to Supabase Storage
- [ ] Verify database records are created

## ✅ **Step 6: Integration**
- [ ] The ParcelTracker component is already updated
- [ ] QR codes will be automatically marked as used when parcel journeys are created
- [ ] Test the full flow: generate QR → scan QR → create journey → mark as used

## ✅ **Step 7: Admin Dashboard (Optional)**
- [ ] Add the AdminDashboard component to your app
- [ ] Create a route for admin access
- [ ] Test QR code generation and management features

## 🧪 **Testing Commands**

### Test QR Code Generation
```bash
# Test the API endpoint directly
curl -X POST https://your-domain.vercel.app/api/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"action": "generate-single"}'
```

### Test Statistics
```bash
curl https://your-domain.vercel.app/api/generate-qr?action=stats
```

## 🔍 **Verification Steps**

1. **Database Check**: Go to Supabase > Table Editor > qr_codes
2. **Storage Check**: Go to Supabase > Storage > qr-codes bucket
3. **API Check**: Test the endpoints with curl or Postman
4. **Frontend Check**: Use the QRCodeTest component

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Failed to upload QR code"**
   - Check if the `qr-codes` bucket exists and is public
   - Verify your service role key has storage permissions

2. **"Database insert error"**
   - Ensure the migration was run successfully
   - Check RLS policies are correctly configured

3. **"API endpoint not found"**
   - Verify the API file is in the correct location
   - Check Vercel deployment logs

4. **"Environment variables not found"**
   - Double-check your `.env.local` file
   - Verify variable names match exactly

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs
4. Verify all environment variables are set
5. Ensure the database migration was successful

## 🎉 **Success Indicators**

You'll know the system is working when:
- ✅ QR codes are generated successfully
- ✅ Images are uploaded to Supabase Storage
- ✅ Database records are created
- ✅ QR codes can be downloaded
- ✅ Statistics are displayed correctly
- ✅ Parcel journeys mark QR codes as used

---

**Once all steps are complete, your QR code generation system will be fully operational!** 🚀
