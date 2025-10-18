import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { generateQRCode, generateBatchQRCodes, getQRCodeStats, QRCodeResult, BatchQRCodeResult, QRCodeStats } from '@/lib/qrCodeServiceMock';
import { Download, QrCode, BarChart3, Loader2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  onQRCodeGenerated?: (result: QRCodeResult) => void;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  onQRCodeGenerated, 
  className = '' 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [customBagId, setCustomBagId] = useState('');
  const [batchCount, setBatchCount] = useState(10);
  const [generatedQR, setGeneratedQR] = useState<QRCodeResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchQRCodeResult | null>(null);
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSingle = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateQRCode(customBagId || undefined);
      setGeneratedQR(result);
      onQRCodeGenerated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBatch = async () => {
    setIsGeneratingBatch(true);
    setError(null);
    
    try {
      const result = await generateBatchQRCodes(batchCount);
      setBatchResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate batch QR codes');
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleLoadStats = async () => {
    setIsLoadingStats(true);
    setError(null);
    
    try {
      const statsData = await getQRCodeStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const downloadQRCode = (imageUrl: string, bagId: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sparcel-qr-${bagId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Single QR Code Generation */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#FF5823]" />
            Generate Single QR Code
          </CardTitle>
          <CardDescription>
            Generate a single QR code for a specific bag ID or let us create one for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customBagId">Custom Bag ID (optional)</Label>
            <Input
              id="customBagId"
              value={customBagId}
              onChange={(e) => setCustomBagId(e.target.value)}
              placeholder="Leave empty for auto-generated ID"
              className="input-professional"
            />
          </div>
          
          <Button 
            onClick={handleGenerateSingle}
            disabled={isGenerating}
            className="button-primary w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </>
            )}
          </Button>

          {generatedQR && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <img 
                  src={generatedQR.imageUrl} 
                  alt={`QR Code for ${generatedQR.bagId}`}
                  className="w-48 h-48 mx-auto mb-4 border-2 border-gray-200 rounded-lg"
                />
                <p className="font-semibold text-gray-900 mb-2">Bag ID: {generatedQR.bagId}</p>
                <p className="text-sm text-gray-600 mb-4 break-all">{generatedQR.qrUrl}</p>
                <Button 
                  onClick={() => downloadQRCode(generatedQR.imageUrl, generatedQR.bagId)}
                  className="button-secondary"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch QR Code Generation */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#FF5823]" />
            Generate Batch QR Codes
          </CardTitle>
          <CardDescription>
            Generate multiple QR codes at once for mass production.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="batchCount">Number of QR Codes</Label>
            <Input
              id="batchCount"
              type="number"
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 10)}
              min="1"
              max="100"
              className="input-professional"
            />
          </div>
          
          <Button 
            onClick={handleGenerateBatch}
            disabled={isGeneratingBatch}
            className="button-primary w-full"
          >
            {isGeneratingBatch ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {batchCount} QR Codes...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Generate {batchCount} QR Codes
              </>
            )}
          </Button>

          {batchResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-4">
                Batch Generation Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{batchResults.totalGenerated}</p>
                  <p className="text-sm text-green-700">Successfully Generated</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{batchResults.totalErrors}</p>
                  <p className="text-sm text-red-700">Errors</p>
                </div>
              </div>
              
              {batchResults.qrCodes.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {batchResults.qrCodes.map((qr, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <img src={qr.imageUrl} alt={qr.bagId} className="w-8 h-8" />
                        <span className="font-mono text-sm">{qr.bagId}</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => downloadQRCode(qr.imageUrl, qr.bagId)}
                        className="button-secondary"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#FF5823]" />
            QR Code Statistics
          </CardTitle>
          <CardDescription>
            View usage statistics for your QR codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLoadStats}
            disabled={isLoadingStats}
            className="button-secondary w-full mb-4"
          >
            {isLoadingStats ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Stats...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Load Statistics
              </>
            )}
          </Button>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-blue-700">Total QR Codes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-green-700">Active</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.used}</p>
                <p className="text-sm text-orange-700">Used</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{stats.unused}</p>
                <p className="text-sm text-gray-700">Unused</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
