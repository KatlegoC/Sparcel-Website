// QR Code Service for Supabase Storage Integration
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

// Generate a single QR code
export const generateQRCode = async (bagId?: string, baseUrl: string = 'https://www.sparcel.co.za'): Promise<QRCodeResult> => {
  try {
    const response = await fetch('/api/generate-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate-single',
        bagId,
        baseUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate QR code');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate multiple QR codes in batch
export const generateBatchQRCodes = async (count: number = 10, baseUrl: string = 'https://www.sparcel.co.za'): Promise<BatchQRCodeResult> => {
  try {
    const response = await fetch('/api/generate-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate-batch',
        count,
        baseUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate batch QR codes');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating batch QR codes:', error);
    throw error;
  }
};

// Get QR code statistics
export const getQRCodeStats = async (): Promise<QRCodeStats> => {
  try {
    const response = await fetch('/api/generate-qr?action=stats');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get QR code stats');
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error getting QR code stats:', error);
    throw error;
  }
};

// Get all QR codes with pagination
export const getQRCodes = async (page: number = 1, limit: number = 50) => {
  try {
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
    const { error } = await supabase
      .from('qr_codes')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('bag_id', bagId)
      .eq('status', 'active');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error marking QR code as used:', error);
    throw error;
  }
};

// Get QR code by bag ID
export const getQRCodeByBagId = async (bagId: string) => {
  try {
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
    : 'http://localhost:5173';
  
  return generateQRCode(bagId, baseUrl);
};

// Utility function to generate a bag ID
export const generateBagId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `BAG${timestamp}${random}`.toUpperCase();
};
