// Real QR Code Service for Supabase Integration
// This will work with your actual Supabase setup

import { supabase } from './supabase';

export interface QRCodeResult {
  bagId: string;
  qrUrl: string;
  imageUrl: string;
  storagePath: string;
  success: boolean;
}

export interface BatchQRCodeResult {
  qrCodes: QRCodeResult[];
  errors: Array<{ index: number; error: string }>;
  totalGenerated: number;
  totalErrors: number;
}

export interface QRCodeStats {
  total: number;
  active: number;
  used: number;
  unused: number;
}

// Generate a unique bag ID
export const generateBagId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BAG${timestamp}${random}`.toUpperCase();
};

// Generate QR code and upload to Supabase Storage
export const generateQRCode = async (bagId?: string, baseUrl: string = 'https://www.sparcel.co.za'): Promise<QRCodeResult> => {
  try {
    const finalBagId = bagId || generateBagId();
    const qrUrl = `${baseUrl}/?bag=${finalBagId}`;
    
    // Create QR code using a public service (for now)
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=FF5823&bgcolor=FFFFFF`;
    
    // Fetch the QR code image
    const response = await fetch(qrCodeImageUrl);
    const qrCodeBuffer = await response.arrayBuffer();
    
    // Upload to Supabase Storage
    if (!supabase) throw new Error('Supabase not available');
    const fileName = `qr-${finalBagId}.png`;
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
        bag_id: finalBagId,
        qr_url: qrUrl,
        storage_path: data.path,
        public_url: publicUrl,
        status: 'active'
      });
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error(`Failed to save QR code to database: ${dbError.message}`);
    }
    
    console.log('✅ QR code generated and saved successfully:', {
      bagId: finalBagId,
      qrUrl,
      publicUrl,
      storagePath: data.path
    });
    
    return {
      bagId: finalBagId,
      qrUrl,
      imageUrl: publicUrl,
      storagePath: data.path,
      success: true
    };
    
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
};

// Generate multiple QR codes in batch
export const generateBatchQRCodes = async (count: number = 10, baseUrl: string = 'https://www.sparcel.co.za'): Promise<BatchQRCodeResult> => {
  const results: QRCodeResult[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const result = await generateQRCode(undefined, baseUrl);
      results.push(result);
    } catch (error) {
      errors.push({ 
        index: i, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return {
    qrCodes: results,
    errors,
    totalGenerated: results.length,
    totalErrors: errors.length
  };
};

// Get QR code usage statistics
export const getQRCodeStats = async (): Promise<QRCodeStats> => {
  try {
    if (!supabase) throw new Error('Supabase not available');
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
};

// Get all QR codes with pagination
export const getQRCodes = async (page: number = 1, limit: number = 50) => {
  try {
    if (!supabase) throw new Error('Supabase not available');
    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        parcel_journeys!left(created_at, status, customer_name, recipient_name)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    throw error;
  }
};

// Mark QR code as used (when a parcel journey is created)
export const markQRCodeAsUsed = async (bagId: string) => {
  try {
    if (!supabase) throw new Error('Supabase not available');
    const { error } = await supabase
      .from('qr_codes')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('bag_id', bagId)
      .eq('status', 'active');

    if (error) throw error;

    console.log('✅ QR code marked as used:', bagId);
    return { success: true };
  } catch (error) {
    console.error('Error marking QR code as used:', error);
    throw error;
  }
};

// Get QR code by bag ID
export const getQRCodeByBagId = async (bagId: string) => {
  try {
    if (!supabase) throw new Error('Supabase not available');
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('bag_id', bagId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching QR code by bag ID:', error);
    throw error;
  }
};

// Delete QR code (admin function)
export const deleteQRCode = async (bagId: string) => {
  try {
    // First get the QR code to get the storage path
    const qrCode = await getQRCodeByBagId(bagId);
    
    if (!qrCode) {
      throw new Error('QR code not found');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('qr-codes')
      .remove([qrCode.storage_path]);

    if (storageError) {
      console.warn('Failed to delete from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('bag_id', bagId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};

// Generate QR code for testing (uses localhost for development)
export const generateTestQRCode = async (bagId?: string): Promise<QRCodeResult> => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.sparcel.co.za' 
    : 'http://localhost:5174';
  
  return generateQRCode(bagId, baseUrl);
};
