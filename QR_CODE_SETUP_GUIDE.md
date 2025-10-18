# QR Code Generation Setup Guide

This guide will help you set up the Supabase Storage-based QR code generation system for your Sparcel platform.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

### 2. Set up Supabase Storage

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the sidebar
3. Create a new bucket called `qr-codes`
4. Set it as **Public** (so QR codes can be accessed via URL)

### 3. Run Database Migration

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_qr_codes_migration.sql`
4. Click **Run** to execute the migration

### 4. Set Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# For server-side operations (API routes)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Base URL for QR codes
VITE_QR_BASE_URL=https://www.sparcel.co.za
```

### 5. Deploy API Endpoint

If you're using Vercel, create a `api` folder in your project root and add the `generate-qr.js` file.

For other platforms, adapt the API endpoint accordingly.

## 📱 Usage Examples

### Generate a Single QR Code

```typescript
import { generateQRCode } from '@/lib/qrCodeService';

const result = await generateQRCode();
console.log(result);
// {
//   bagId: "BAG123456789",
//   qrUrl: "https://www.sparcel.co.za/?bag=BAG123456789",
//   imageUrl: "https://your-project.supabase.co/storage/v1/object/public/qr-codes/qr-BAG123456789.png",
//   storagePath: "qr-BAG123456789.png",
//   success: true
// }
```

### Generate Multiple QR Codes

```typescript
import { generateBatchQRCodes } from '@/lib/qrCodeService';

const result = await generateBatchQRCodes(50);
console.log(`Generated ${result.totalGenerated} QR codes`);
```

### Use the QR Code Generator Component

```tsx
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

function AdminDashboard() {
  return (
    <div>
      <h1>QR Code Management</h1>
      <QRCodeGenerator 
        onQRCodeGenerated={(result) => {
          console.log('New QR code generated:', result.bagId);
        }}
      />
    </div>
  );
}
```

## 🎯 Integration with ParcelTracker

Update your `ParcelTracker.tsx` to use the new QR code system:

```typescript
import { generateTestQRCode, markQRCodeAsUsed } from '@/lib/qrCodeService';

// When a parcel journey is created successfully
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing code ...
  
  // Mark QR code as used
  if (currentQRCode) {
    await markQRCodeAsUsed(currentQRCode);
  }
  
  // ... rest of the code ...
};
```

## 📊 Admin Dashboard Features

The QR Code Generator component provides:

- **Single QR Generation**: Generate one QR code with custom or auto-generated bag ID
- **Batch Generation**: Generate multiple QR codes at once
- **Statistics**: View usage statistics (total, active, used, unused)
- **Download**: Download QR code images
- **Error Handling**: Comprehensive error handling and user feedback

## 🔧 API Endpoints

### Generate Single QR Code
```bash
POST /api/generate-qr
Content-Type: application/json

{
  "action": "generate-single",
  "bagId": "BAG123456", // optional
  "baseUrl": "https://www.sparcel.co.za"
}
```

### Generate Batch QR Codes
```bash
POST /api/generate-qr
Content-Type: application/json

{
  "action": "generate-batch",
  "count": 10,
  "baseUrl": "https://www.sparcel.co.za"
}
```

### Get Statistics
```bash
GET /api/generate-qr?action=stats
```

## 🗄️ Database Schema

The migration creates:

- `qr_codes` table for tracking QR code metadata
- `qr_code_stats` view for statistics
- Storage bucket `qr-codes` for image files
- Row Level Security (RLS) policies
- Automatic triggers to mark QR codes as used

## 🔒 Security Features

- **Row Level Security**: Only authenticated users can read QR codes
- **Service Role**: Only service role can create/update/delete QR codes
- **Storage Policies**: Public read access for QR code images
- **Input Validation**: Bag ID validation and sanitization

## 📈 Monitoring & Analytics

Track QR code usage with the built-in statistics:

```typescript
import { getQRCodeStats } from '@/lib/qrCodeService';

const stats = await getQRCodeStats();
console.log(stats);
// {
//   total: 1000,
//   active: 750,
//   used: 250,
//   unused: 750
// }
```

## 🚨 Troubleshooting

### Common Issues

1. **Storage Upload Fails**
   - Check if the `qr-codes` bucket exists and is public
   - Verify your service role key has storage permissions

2. **Database Insert Fails**
   - Ensure the migration was run successfully
   - Check RLS policies are correctly configured

3. **QR Code Not Accessible**
   - Verify the storage bucket is public
   - Check the public URL is correctly generated

### Debug Mode

Enable debug logging by setting:

```env
DEBUG_QR_CODES=true
```

## 🎨 Customization

### Custom QR Code Styling

Modify the QR code generation in `api/generate-qr.js`:

```javascript
const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
  width: 300,
  margin: 2,
  color: {
    dark: '#FF5823', // Your brand color
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M'
});
```

### Custom Bag ID Format

Modify the `generateBagId` function in `src/lib/qrCodeService.ts`:

```typescript
export const generateBagId = (): string => {
  // Custom format: SPARCEL-YYYY-MM-DD-XXXXX
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `SPARCEL-${date}-${random}`;
};
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Check the browser console for error messages
4. Verify all environment variables are set correctly

---

**Ready to go!** Your QR code generation system is now set up and ready for production use. 🎉
