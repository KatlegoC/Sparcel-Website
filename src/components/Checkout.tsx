import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

interface DropperQuote {
  id: string;
  price: number;
  currency: string;
  estimated_delivery: string;
  service_type: string;
  provider: string;
  delivery_category: string;
}

export const Checkout = () => {
  const [journeyData, setJourneyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    // Check for payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('payment');
    if (status) {
      setPaymentStatus(status);
    }
  }, []);

  useEffect(() => {
    // Load journey data from localStorage (from the main form)
    const storedData = localStorage.getItem('pendingCheckout');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setJourneyData(parsed);
        console.log('✅ Loaded checkout data:', parsed);
      } catch (e) {
        console.error('Error parsing checkout data:', e);
        setError('Failed to load checkout data. Please start over.');
      }
    } else {
      setError('No checkout data found. Please start over from the parcel configuration form.');
    }
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5823] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show payment success message
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="card-elevated max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
              <p className="text-xl text-gray-700 mb-6">
                Thank you for your payment. Your parcel journey is being processed.
              </p>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                <p className="text-lg font-semibold text-green-800 mb-4">✅ What happens next?</p>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>✓ Your parcel booking is being created with our courier partners</li>
                  <li>✓ You'll receive a confirmation email shortly</li>
                  <li>✓ You can track your parcel using your tracking number</li>
                  <li>✓ Please drop off your parcel at the selected pickup location</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Don't worry!</strong> We're handling everything in the background. 
                  You'll be redirected automatically once processing is complete.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.href = '/'} className="button-primary">
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="card-elevated max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Checkout Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => window.location.href = '/'} className="button-primary w-full">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show payment cancelled message
  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="card-elevated max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-6">❌</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h2>
              <p className="text-xl text-gray-700 mb-6">
                Your payment was cancelled. No charges were made to your account.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  💡 Your parcel journey details have been saved. You can complete the payment when you're ready.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()} className="button-primary">
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quote = journeyData?.selectedQuote;
  const bagId = journeyData?.bagId;

  if (!quote || !bagId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="card-elevated max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Incomplete Data</h2>
              <p className="text-gray-600 mb-6">Missing quote or bag ID. Please start over.</p>
              <Button onClick={() => window.location.href = '/'} className="button-primary w-full">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4">
      <div className="container-professional max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Review your order and complete payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Parcel Details */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Parcel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bag ID:</span>
                  <span className="font-semibold">{bagId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcel Size:</span>
                  <span className="font-semibold">{journeyData?.parcelSize || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Boxes:</span>
                  <span className="font-semibold">{journeyData?.numberOfBoxes || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Location:</span>
                  <span className="font-semibold">{journeyData?.fromLocation?.name || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Location:</span>
                  <span className="font-semibold">{journeyData?.toLocation?.name || 'Not selected'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sender:</span>
                  <span className="font-semibold">{journeyData?.customerName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-semibold">{journeyData?.recipientName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{journeyData?.customerEmail || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="md:col-span-1">
            <Card className="card-elevated sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Quote */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">{quote.service_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">by {quote.provider}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Est. delivery: {quote.estimated_delivery}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">Total</p>
                      <p className="text-sm text-gray-600">Including all fees</p>
                    </div>
                    <p className="text-3xl font-bold text-[#FF5823]">R{quote.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* PayFast Form */}
                <form action="https://sandbox.payfast.co.za/eng/process" method="post" id="payfast-form">
                  <input type="hidden" name="merchant_id" value="10000100" />
                  <input type="hidden" name="merchant_key" value="46f0cd694581a" />
                  <input type="hidden" name="amount" value={quote.price.toFixed(2)} />
                  <input type="hidden" name="item_name" value={`Sparcel Delivery - ${journeyData?.parcelSize || 'Parcel'}`} />
                  <input type="hidden" name="return_url" value={`${window.location.origin}/checkout?payment=success&bag=${bagId}`} />
                  <input type="hidden" name="cancel_url" value={`${window.location.origin}/checkout?payment=cancelled`} />
                  <input type="hidden" name="notify_url" value={`${window.location.origin}/api/payfast/notify`} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-2xl">🔒</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
                        <p className="text-xs text-gray-600">Powered by PayFast</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="button-primary w-full text-lg py-4"
                    >
                      <span className="flex items-center space-x-2">
                        <span>💰</span>
                        <span>Pay R{quote.price.toFixed(2)}</span>
                      </span>
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      By proceeding, you agree to Sparcel's terms and conditions.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

