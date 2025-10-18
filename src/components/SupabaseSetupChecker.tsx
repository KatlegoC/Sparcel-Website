import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader2, Database, Key } from 'lucide-react';

interface CheckResult {
  name: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  details?: string;
}

export const SupabaseSetupChecker: React.FC = () => {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runChecks = async () => {
    setIsRunning(true);
    setChecks([]);

    const newChecks: CheckResult[] = [
      {
        name: 'Environment Variables',
        status: 'checking',
        message: 'Checking Supabase environment variables...'
      },
      {
        name: 'Database Connection',
        status: 'checking',
        message: 'Testing database connection...'
      },
      {
        name: 'QR Codes Table',
        status: 'checking',
        message: 'Checking if qr_codes table exists...'
      },
      {
        name: 'Storage Bucket',
        status: 'checking',
        message: 'Checking if qr-codes storage bucket exists...'
      },
      {
        name: 'Test QR Code Generation',
        status: 'checking',
        message: 'Testing QR code generation and database insert...'
      }
    ];

    setChecks([...newChecks]);

    // Check 1: Environment Variables
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        newChecks[0] = {
          name: 'Environment Variables',
          status: 'error',
          message: 'Supabase URL not configured',
          details: 'Please update VITE_SUPABASE_URL in your .env.local file'
        };
      } else if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
        newChecks[0] = {
          name: 'Environment Variables',
          status: 'error',
          message: 'Supabase API key not configured',
          details: 'Please update VITE_SUPABASE_ANON_KEY in your .env.local file'
        };
      } else {
        newChecks[0] = {
          name: 'Environment Variables',
          status: 'success',
          message: 'Environment variables configured correctly',
          details: `URL: ${supabaseUrl.substring(0, 30)}...`
        };
      }
    } catch (error) {
      newChecks[0] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Error checking environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setChecks([...newChecks]);

    // Check 2: Database Connection
    try {
      const { data, error } = await supabase.from('parcel_journeys').select('count').limit(1);
      if (error) throw error;
      
      newChecks[1] = {
        name: 'Database Connection',
        status: 'success',
        message: 'Database connection successful',
        details: 'Successfully connected to Supabase database'
      };
    } catch (error) {
      newChecks[1] = {
        name: 'Database Connection',
        status: 'error',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setChecks([...newChecks]);

    // Check 3: QR Codes Table
    try {
      const { data, error } = await supabase.from('qr_codes').select('count').limit(1);
      if (error) throw error;
      
      newChecks[2] = {
        name: 'QR Codes Table',
        status: 'success',
        message: 'QR codes table exists',
        details: 'Table is accessible and ready to use'
      };
    } catch (error) {
      newChecks[2] = {
        name: 'QR Codes Table',
        status: 'error',
        message: 'QR codes table not found',
        details: 'Please run the database migration in Supabase SQL Editor'
      };
    }
    setChecks([...newChecks]);

    // Check 4: Storage Bucket
    try {
      const { data, error } = await supabase.storage.from('qr-codes').list('', { limit: 1 });
      if (error) throw error;
      
      newChecks[3] = {
        name: 'Storage Bucket',
        status: 'success',
        message: 'QR codes storage bucket exists',
        details: 'Storage bucket is accessible and ready to use'
      };
    } catch (error) {
      newChecks[3] = {
        name: 'Storage Bucket',
        status: 'error',
        message: 'QR codes storage bucket not found',
        details: 'Please run the database migration to create the storage bucket'
      };
    }
    setChecks([...newChecks]);

    // Check 5: Test QR Code Generation
    try {
      const { generateQRCode } = await import('@/lib/qrCodeServiceReal');
      const result = await generateQRCode();
      
      newChecks[4] = {
        name: 'Test QR Code Generation',
        status: 'success',
        message: 'QR code generated and saved successfully',
        details: `Bag ID: ${result.bagId}, Image URL: ${result.imageUrl.substring(0, 50)}...`
      };
    } catch (error) {
      newChecks[4] = {
        name: 'Test QR Code Generation',
        status: 'error',
        message: 'QR code generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setChecks([...newChecks]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const allPassed = checks.length > 0 && checks.every(check => check.status === 'success');
  const hasErrors = checks.some(check => check.status === 'error');

  return (
    <Card className="card-premium max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-[#FF5823]" />
          Supabase Setup Checker
        </CardTitle>
        <CardDescription>
          Verify that your Supabase integration is properly configured for QR code generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runChecks}
          disabled={isRunning}
          className="button-primary w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Checks...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Run Setup Checks
            </>
          )}
        </Button>

        {checks.length > 0 && (
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index} className={`p-4 rounded-xl border ${getStatusColor(check.status)}`}>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(check.status)}
                  <h3 className="font-semibold text-gray-900">{check.name}</h3>
                </div>
                <p className="text-gray-700 mb-1">{check.message}</p>
                {check.details && (
                  <p className="text-sm text-gray-600">{check.details}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {allPassed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">✅ All Checks Passed!</h3>
            </div>
            <p className="text-green-700">
              Your Supabase integration is properly configured. You can now use the real QR code generation system.
            </p>
          </div>
        )}

        {hasErrors && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">❌ Setup Issues Found</h3>
            </div>
            <p className="text-red-700 mb-4">
              Please fix the issues above before using the real QR code generation system.
            </p>
            <div className="text-sm text-red-600">
              <p><strong>Next steps:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Update your .env.local file with real Supabase credentials</li>
                <li>Run the database migration in Supabase SQL Editor</li>
                <li>Ensure the qr-codes storage bucket is created</li>
                <li>Check your Supabase project settings</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p><strong>What this checker does:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verifies environment variables are configured</li>
            <li>Tests database connection</li>
            <li>Checks if qr_codes table exists</li>
            <li>Verifies storage bucket is accessible</li>
            <li>Tests actual QR code generation and database insert</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
