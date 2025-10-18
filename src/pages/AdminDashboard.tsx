import React, { useState, useEffect } from 'react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { getQRCodes, getQRCodeStats, QRCodeStats } from '@/lib/qrCodeServiceMock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  QrCode, 
  BarChart3, 
  Download, 
  Search, 
  RefreshCw,
  Eye,
  Trash2,
  Loader2
} from 'lucide-react';

interface QRCodeRecord {
  id: string;
  bag_id: string;
  qr_url: string;
  public_url: string;
  status: string;
  created_at: string;
  used_at: string | null;
  parcel_journeys?: Array<{
    created_at: string;
    status: string;
    customer_name: string;
    recipient_name: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'manage' | 'stats'>('generate');
  const [qrCodes, setQrCodes] = useState<QRCodeRecord[]>([]);
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const loadQRCodes = async () => {
    setIsLoading(true);
    try {
      const data = await getQRCodes(currentPage, itemsPerPage);
      setQrCodes(data || []);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getQRCodeStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      loadQRCodes();
    } else if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab, currentPage]);

  const filteredQRCodes = qrCodes.filter(qr => 
    qr.bag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadQRCode = (imageUrl: string, bagId: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sparcel-qr-${bagId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'used': return 'text-blue-600 bg-blue-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sparcel Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage QR codes and monitor system performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            <Button
              variant={activeTab === 'generate' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('generate')}
              className="mx-1"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Codes
            </Button>
            <Button
              variant={activeTab === 'manage' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('manage')}
              className="mx-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              Manage QR Codes
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('stats')}
              className="mx-1"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Statistics
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' && (
          <QRCodeGenerator 
            onQRCodeGenerated={(result) => {
              console.log('New QR code generated:', result.bagId);
              // Optionally refresh the manage tab
            }}
          />
        )}

        {activeTab === 'manage' && (
          <Card className="card-premium">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>QR Code Management</CardTitle>
                  <CardDescription>
                    View and manage all generated QR codes
                  </CardDescription>
                </div>
                <Button onClick={loadQRCodes} disabled={isLoading} className="button-secondary">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by bag ID or status..."
                    className="input-professional pl-10"
                  />
                </div>
              </div>

              {/* QR Codes List */}
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading QR codes...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQRCodes.map((qr) => (
                    <div key={qr.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <img 
                          src={qr.public_url} 
                          alt={qr.bag_id}
                          className="w-12 h-12 rounded border"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{qr.bag_id}</p>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(qr.created_at).toLocaleDateString()}
                          </p>
                          {qr.used_at && (
                            <p className="text-sm text-gray-600">
                              Used: {new Date(qr.used_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(qr.status)}`}>
                          {qr.status}
                        </span>
                        
                        <Button
                          size="sm"
                          onClick={() => downloadQRCode(qr.public_url, qr.bag_id)}
                          className="button-secondary"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredQRCodes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No QR codes found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'stats' && (
          <Card className="card-premium">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>QR Code Statistics</CardTitle>
                  <CardDescription>
                    Monitor QR code usage and performance
                  </CardDescription>
                </div>
                <Button onClick={loadStats} disabled={isLoading} className="button-secondary">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-blue-700 font-medium">Total QR Codes</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                    <p className="text-green-700 font-medium">Active</p>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-xl">
                    <p className="text-3xl font-bold text-orange-600">{stats.used}</p>
                    <p className="text-orange-700 font-medium">Used</p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-gray-600">{stats.unused}</p>
                    <p className="text-gray-700 font-medium">Unused</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Click refresh to load statistics</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
