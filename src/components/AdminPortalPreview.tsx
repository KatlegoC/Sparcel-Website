import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  QrCode, 
  BarChart3, 
  Download, 
  Search, 
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

export const AdminPortalPreview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Sparcel Admin Portal Preview
          </h1>
          <p className="text-xl text-gray-600">
            This is what your admin portal will look like
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <Button className="mx-1 bg-[#FF5823] text-white">
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Codes
            </Button>
            <Button variant="ghost" className="mx-1">
              <Eye className="mr-2 h-4 w-4" />
              Manage QR Codes
            </Button>
            <Button variant="ghost" className="mx-1">
              <BarChart3 className="mr-2 h-4 w-4" />
              Statistics
            </Button>
          </div>
        </div>

        {/* Generate QR Codes Tab */}
        <div className="space-y-6">
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
                  placeholder="Leave empty for auto-generated ID"
                  className="input-professional"
                />
              </div>
              
              <Button className="button-primary w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>

              {/* Generated QR Code Example */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-4 border-2 border-gray-200 rounded-lg bg-white flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">QR Code Preview</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Bag ID: BAG123456789</p>
                  <p className="text-sm text-gray-600 mb-4 break-all">https://www.sparcel.co.za/?bag=BAG123456789</p>
                  <Button className="button-secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch QR Code Generation */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#FF5822]" />
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
                  defaultValue="10"
                  min="1"
                  max="100"
                  className="input-professional"
                />
              </div>
              
              <Button className="button-primary w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Generate 10 QR Codes
              </Button>

              {/* Batch Results Example */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Batch Generation Results
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">10</p>
                    <p className="text-sm text-green-700">Successfully Generated</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">0</p>
                    <p className="text-sm text-red-700">Errors</p>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <QrCode className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="font-mono text-sm">BAG{123456789 + i}</span>
                      </div>
                      <Button size="sm" className="button-secondary">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Tab Preview */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#FF5823]" />
                QR Code Statistics
              </CardTitle>
              <CardDescription>
                Monitor QR code usage and performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">1,247</p>
                  <p className="text-blue-700 font-medium">Total QR Codes</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">892</p>
                  <p className="text-green-700 font-medium">Active</p>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-xl">
                  <p className="text-3xl font-bold text-orange-600">355</p>
                  <p className="text-orange-700 font-medium">Used</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-600">892</p>
                  <p className="text-gray-700 font-medium">Unused</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manage QR Codes Tab Preview */}
          <Card className="card-premium">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>QR Code Management</CardTitle>
                  <CardDescription>
                    View and manage all generated QR codes
                  </CardDescription>
                </div>
                <Button className="button-secondary">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <Label htmlFor="search">Search QR Codes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by bag ID or status..."
                    className="input-professional pl-10"
                  />
                </div>
              </div>

              {/* QR Codes List */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">BAG{123456789 + i}</p>
                        <p className="text-sm text-gray-600">
                          Created: {new Date().toLocaleDateString()}
                        </p>
                        {i % 3 === 0 && (
                          <p className="text-sm text-gray-600">
                            Used: {new Date().toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        i % 3 === 0 ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {i % 3 === 0 ? 'used' : 'active'}
                      </span>
                      
                      <Button size="sm" className="button-secondary">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-premium text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Generation</h3>
              <p className="text-gray-600">Generate single or batch QR codes with just a few clicks</p>
            </CardContent>
          </Card>
          
          <Card className="card-premium text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Stats</h3>
              <p className="text-gray-600">Monitor usage, track performance, and analyze trends</p>
            </CardContent>
          </Card>
          
          <Card className="card-premium text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">User-Friendly</h3>
              <p className="text-gray-600">Intuitive interface designed for non-technical users</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
