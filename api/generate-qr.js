// QR Code Generation API for Vercel
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate a unique bag ID
function generateBagId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BAG${timestamp}${random}`.toUpperCase();
}

// Generate QR code and upload to Supabase Storage
async function generateQRCode(bagId, baseUrl = 'https://www.sparcel.co.za') {
  try {
    const qrUrl = `${baseUrl}/?bag=${bagId}`;
    
    // Generate QR code as buffer with custom styling
    const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#FF5823', // Sparcel brand orange
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    // Upload to Supabase Storage
    const fileName = `qr-${bagId}.png`;
    const { data, error } = await supabase.storage
      .from('qr-codes')
      .upload(fileName, qrCodeBuffer, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload QR code: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('qr-codes')
      .getPublicUrl(fileName);
    
    // Save QR code metadata to database
    const { error: dbError } = await supabase
      .from('qr_codes')
      .insert({
        bag_id: bagId,
        qr_url: qrUrl,
        storage_path: data.path,
        public_url: publicUrl,
        status: 'active'
      });
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      // Don't throw here - QR code was generated successfully
    }
    
    return {
      bagId,
      qrUrl,
      imageUrl: publicUrl,
      storagePath: data.path,
      success: true
    };
    
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
}

// Generate multiple QR codes in batch
async function generateBatchQRCodes(count = 10, baseUrl = 'https://www.sparcel.co.za') {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const bagId = generateBagId();
      const result = await generateQRCode(bagId, baseUrl);
      results.push(result);
    } catch (error) {
      errors.push({ index: i, error: error.message });
    }
  }
  
  return {
    qrCodes: results,
    errors,
    totalGenerated: results.length,
    totalErrors: errors.length
  };
}

// Get QR code usage statistics
async function getQRCodeStats() {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('status, created_at, used_at');
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      active: data.filter(qr => qr.status === 'active').length,
      used: data.filter(qr => qr.used_at !== null).length,
      unused: data.filter(qr => qr.used_at === null).length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting QR code stats:', error);
    throw error;
  }
}

// API endpoint handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    if (req.method === 'POST') {
      const { action, count, bagId, baseUrl } = req.body;
      
      switch (action) {
        case 'generate-single':
          const result = await generateQRCode(bagId || generateBagId(), baseUrl);
          res.status(200).json(result);
          break;
          
        case 'generate-batch':
          const batchResult = await generateBatchQRCodes(count || 10, baseUrl);
          res.status(200).json(batchResult);
          break;
          
        default:
          res.status(400).json({ error: 'Invalid action. Use "generate-single" or "generate-batch"' });
      }
    } else if (req.method === 'GET') {
      const { action } = req.query;
      
      if (action === 'stats') {
        const stats = await getQRCodeStats();
        res.status(200).json(stats);
      } else {
        res.status(400).json({ error: 'Invalid action. Use "stats"' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}