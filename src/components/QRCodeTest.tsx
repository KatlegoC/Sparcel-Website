import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { generateTestQRCode } from '@/lib/qrCodeServiceMock';
import { QrCode, Loader2, CheckCircle, XCircle } from 'lucide-react';

export const QRCodeTest: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const qrResult = await generateTestQRCode();
      setResult(qrResult);
      console.log('✅ QR Code generated successfully:', qrResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ QR Code generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="card-premium max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[#FF5823]" />
          QR Code System Test
        </CardTitle>
        <CardDescription>
          Test the QR code generation system to ensure everything is working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={handleTest}
          disabled={isGenerating}
          className="button-primary w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing QR Code Generation...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Test QR Code Generation
            </>
          )}
        </Button>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">✅ Test Successful!</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Bag ID:</p>
                <p className="font-mono text-lg font-bold text-gray-900">{result.bagId}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">QR Code URL:</p>
                <p className="text-sm text-gray-600 break-all">{result.qrUrl}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Image URL:</p>
                <p className="text-sm text-gray-600 break-all">{result.imageUrl}</p>
              </div>
              
              <div className="text-center">
                <img 
                  src={result.imageUrl} 
                  alt={`QR Code for ${result.bagId}`}
                  className="w-32 h-32 mx-auto border-2 border-gray-200 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">Generated QR Code</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">❌ Test Failed</h3>
            </div>
            <p className="text-red-700">{error}</p>
            <div className="mt-4 text-sm text-red-600">
              <p><strong>Possible issues:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Supabase environment variables not set correctly</li>
                <li>Database migration not run</li>
                <li>Storage bucket not created</li>
                <li>API endpoint not deployed</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Generates a unique bag ID</li>
            <li>Creates a QR code with your domain URL</li>
            <li>Uploads the QR code to Supabase Storage</li>
            <li>Saves metadata to the database</li>
            <li>Returns the public URL for the QR code image</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
