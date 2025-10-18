// Mock QR Code Service for Development/Demo
// This allows you to see the admin portal working without full setup

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

// Mock QR code generation (for demo purposes)
export const generateQRCode = async (bagId?: string, baseUrl: string = 'https://www.sparcel.co.za'): Promise<QRCodeResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const finalBagId = bagId || generateBagId();
  const qrUrl = `${baseUrl}/?bag=${finalBagId}`;
  
  // Create a mock QR code image URL (using a QR code generator service)
  const mockImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=FF5823&bgcolor=FFFFFF`;
  
  return {
    bagId: finalBagId,
    qrUrl,
    imageUrl: mockImageUrl,
    storagePath: `qr-${finalBagId}.png`,
    success: true
  };
};

// Mock batch QR code generation
export const generateBatchQRCodes = async (count: number = 10, baseUrl: string = 'https://www.sparcel.co.za'): Promise<BatchQRCodeResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results: QRCodeResult[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const bagId = generateBagId();
      const qrUrl = `${baseUrl}/?bag=${bagId}`;
      const mockImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=FF5823&bgcolor=FFFFFF`;
      
      results.push({
        bagId,
        qrUrl,
        imageUrl: mockImageUrl,
        storagePath: `qr-${bagId}.png`,
        success: true
      });
    } catch (error) {
      errors.push({ index: i, error: 'Mock error' });
    }
  }
  
  return {
    qrCodes: results,
    errors,
    totalGenerated: results.length,
    totalErrors: errors.length
  };
};

// Mock statistics
export const getQRCodeStats = async (): Promise<QRCodeStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    total: 1247,
    active: 892,
    used: 355,
    unused: 892
  };
};

// Mock QR code management functions
export const getQRCodes = async (page: number = 1, limit: number = 50) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockQRCodes = [];
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const bagId = generateBagId();
    mockQRCodes.push({
      id: `mock-${i}`,
      bag_id: bagId,
      qr_url: `https://www.sparcel.co.za/?bag=${bagId}`,
      public_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://www.sparcel.co.za/?bag=${bagId}`)}&color=FF5823&bgcolor=FFFFFF`,
      status: i % 3 === 0 ? 'used' : 'active',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      used_at: i % 3 === 0 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : null,
      parcel_journeys: i % 3 === 0 ? [{
        created_at: new Date().toISOString(),
        status: 'completed',
        customer_name: `Customer ${i}`,
        recipient_name: `Recipient ${i}`
      }] : []
    });
  }
  
  return mockQRCodes;
};

export const markQRCodeAsUsed = async (bagId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: QR code ${bagId} marked as used`);
  return { success: true };
};

export const getQRCodeByBagId = async (bagId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: 'mock-id',
    bag_id: bagId,
    qr_url: `https://www.sparcel.co.za/?bag=${bagId}`,
    public_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://www.sparcel.co.za/?bag=${bagId}`)}&color=FF5823&bgcolor=FFFFFF`,
    status: 'active',
    created_at: new Date().toISOString(),
    used_at: null
  };
};

export const deleteQRCode = async (bagId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Mock: QR code ${bagId} deleted`);
  return { success: true };
};

// Mock test QR code generation
export const generateTestQRCode = async (bagId?: string): Promise<QRCodeResult> => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.sparcel.co.za' 
    : 'http://localhost:5174';
  
  return generateQRCode(bagId, baseUrl);
};
