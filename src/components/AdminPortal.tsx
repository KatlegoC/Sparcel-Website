import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { supabase } from '@/lib/supabase';

interface QRCode {
  id: string;
  bag_id: string;
  url: string;
  created_at: string;
  status: 'pending' | 'in-transit' | 'delivered';
}

export const AdminPortal = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newBagId, setNewBagId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewQRImage, setPreviewQRImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  // Load QR codes from database on component mount
  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setIsLoading(true);
      
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('Supabase not configured, using localStorage');
        const localQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
        setQrCodes(localQRCodes);
        return;
      }

      // Try to load from Supabase first (using existing parcel_journeys table)
      const { data, error } = await supabase
        .from('parcel_journeys')
        .select('id, bag_id, created_at, status')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading QR codes from Supabase:', error);
        // Fallback to localStorage
        const localQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
        setQrCodes(localQRCodes);
      } else {
        console.log('✅ Loaded QR codes from Supabase:', data?.length || 0);
        // Transform parcel_journeys data to QRCode format
        const qrCodesData = (data || []).map((journey: any) => ({
          id: journey.id,
          bag_id: journey.bag_id,
          url: `${window.location.origin}/?bag=${journey.bag_id}`,
          created_at: journey.created_at,
          status: journey.status
        }));
        setQrCodes(qrCodesData);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
      // Fallback to localStorage
      const localQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
      setQrCodes(localQRCodes);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Generate a unique bag ID if none provided
      let bagId = newBagId.trim();
      if (!bagId) {
        // Generate random bag ID like BAG789012
        const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
        bagId = `BAG${randomNum}`;
      }

      // Generate QR code URL
      const qrUrl = `${window.location.origin}/?bag=${bagId}`;
      
      // Create QR code data (will be saved as parcel_journey)
      const qrData = {
        id: `qr_${Date.now()}`,
        bag_id: bagId,
        url: qrUrl,
        created_at: new Date().toISOString(),
        status: 'pending' as const
      };

      // Save to database
      try {
        // Check if Supabase is configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.log('Supabase not configured, saving to localStorage');
          const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
          existingQRCodes.unshift(qrData);
          localStorage.setItem('qrCodes', JSON.stringify(existingQRCodes));
          setQrCodes(prev => [qrData, ...prev]);
          console.log('✅ QR code saved to localStorage:', bagId);
          return;
        }

        // Try Supabase first (save to existing parcel_journeys table)
        const { data, error } = await supabase
          .from('parcel_journeys')
          .insert([{
            bag_id: bagId,
            status: 'pending'
          }])
          .select()
          .single();

        if (error) {
          console.error('Error saving to Supabase:', error);
          // Fallback to localStorage
          const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
          existingQRCodes.unshift(qrData);
          localStorage.setItem('qrCodes', JSON.stringify(existingQRCodes));
          setQrCodes(prev => [qrData, ...prev]);
          console.log('✅ QR code saved to localStorage (fallback):', bagId);
        } else {
          // Transform the saved data and update local state
          const transformedData = {
            id: data.id,
            bag_id: data.bag_id,
            url: qrUrl,
            created_at: data.created_at,
            status: data.status
          };
          setQrCodes(prev => [transformedData, ...prev]);
          console.log('✅ QR code saved to Supabase:', bagId);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Still save locally as fallback
        const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
        existingQRCodes.unshift(qrData);
        localStorage.setItem('qrCodes', JSON.stringify(existingQRCodes));
        setQrCodes(prev => [qrData, ...prev]);
        console.log('✅ QR code saved to localStorage (error fallback):', bagId);
      }

      setNewBagId('');
      
      // Show success message
      alert(`QR Code generated successfully for bag: ${bagId}`);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewQRCode = async (url: string) => {
    try {
      setPreviewUrl(url);
      
      // Generate QR code image
      const QRCode = await import('qrcode');
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setPreviewQRImage(qrDataURL);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating QR code preview:', error);
      alert('Error generating QR code preview. Please try again.');
    }
  };

  const downloadQRCode = async (bagId: string, url: string) => {
    try {
      // Create QR code using qrcode library
      const QRCode = await import('qrcode');
      
      // Generate QR code as data URL
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create canvas for final image with bag ID
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 250;
      
      if (ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 250);
        
        // Load and draw QR code
        const qrImage = new Image();
        qrImage.onload = () => {
          ctx.drawImage(qrImage, 0, 0, 200, 200);
          
          // Add bag ID text at bottom
          ctx.fillStyle = 'black';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Bag: ${bagId}`, 100, 220);
          
          // Download
          const link = document.createElement('a');
          link.download = `qr-code-${bagId}.png`;
          link.href = canvas.toDataURL();
          link.click();
        };
        qrImage.src = qrDataURL;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    }
  };

  const deleteQRCode = async (id: string) => {
    if (confirm('Are you sure you want to delete this QR code?')) {
      try {
        // Check if Supabase is configured
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          // Try to delete from database first (using existing parcel_journeys table)
          const { error } = await supabase
            .from('parcel_journeys')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting from Supabase:', error);
          } else {
            console.log('✅ QR code deleted from Supabase:', id);
          }
        }

        // Update localStorage
        const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
        const updatedQRCodes = existingQRCodes.filter((qr: QRCode) => qr.id !== id);
        localStorage.setItem('qrCodes', JSON.stringify(updatedQRCodes));
        
        // Update local state
        setQrCodes(prev => prev.filter(qr => qr.id !== id));
        
        console.log('✅ QR code deleted:', id);
      } catch (error) {
        console.error('Error deleting QR code:', error);
        alert('Error deleting QR code. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 md:py-6">
          <div className="flex flex-col space-y-2 md:space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center space-x-2 hover:bg-gray-100 text-gray-700 self-start"
            >
              ← Back to Home
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Sparcel Admin Portal</h1>
              <p className="text-gray-600 text-base md:text-lg">Manage QR codes and system settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span className="text-orange-500">📱</span>
                <span>Total QR Codes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{qrCodes.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>Active Codes</span>
              </CardTitle>
            </CardHeader>
                   <CardContent>
                     <div className="text-3xl font-bold text-gray-900">
                       {qrCodes.filter(qr => qr.status === 'pending').length}
                     </div>
                   </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <span className="text-blue-500">🔑</span>
                <span>Used Codes</span>
              </CardTitle>
            </CardHeader>
                   <CardContent>
                     <div className="text-3xl font-bold text-gray-900">
                       {qrCodes.filter(qr => qr.status !== 'pending').length}
                     </div>
                   </CardContent>
          </Card>
        </div>

        {/* Generate New QR Code */}
        <Card className="bg-white/95 backdrop-blur-sm border-orange-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-orange-500">➕</span>
              <span>Generate New QR Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Enter custom bag ID (optional - will auto-generate if empty)"
                value={newBagId}
                onChange={(e) => setNewBagId(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={generateQRCode}
                disabled={isGenerating}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes List */}
        <Card className="bg-white/95 backdrop-blur-sm border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-orange-500">💾</span>
              <span>QR Codes Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p>Loading QR codes...</p>
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📱</div>
                <p>No QR codes generated yet</p>
                <p className="text-sm">Generate your first QR code above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qrCodes.map((qr) => (
                  <div
                    key={qr.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">Bag ID: {qr.bag_id}</h3>
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                 qr.status === 'pending'
                                   ? 'bg-green-100 text-green-700 border border-green-200' 
                                   : 'bg-blue-100 text-blue-700 border border-blue-200'
                               }`}>
                                 {qr.status === 'pending' ? 'Active' : qr.status}
                               </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        URL: {qr.url}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(qr.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewQRCode(qr.url)}
                        className="flex items-center space-x-1"
                      >
                        <span>👁️</span>
                        <span>Preview</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(qr.bag_id, qr.url)}
                        className="flex items-center space-x-1"
                      >
                        <span>📥</span>
                        <span>Download</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQRCode(qr.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">QR Code Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4 border border-gray-200">
                {previewQRImage ? (
                  <img 
                    src={previewQRImage} 
                    alt="QR Code Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-6xl text-gray-400">📱</div>
                )}
              </div>
              <p className="text-sm text-gray-600 break-all">{previewUrl}</p>
              <p className="text-xs text-gray-500 mt-2">Scan this QR code with your phone to test</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
