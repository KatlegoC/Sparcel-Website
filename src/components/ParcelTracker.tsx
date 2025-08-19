import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { PackageIcon, MapPinIcon, UserIcon, PhoneIcon, TruckIcon, CheckCircleIcon } from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { supabase } from '@/lib/supabase';

interface ParcelJourney {
  bag_id: string;
  customer_name: string;
  customer_phone: string;
  recipient_name: string;
  recipient_phone: string;
  from_location: any;
  to_location: any;
  parcel_size: string;
  number_of_boxes: number;
  special_instructions: string;
  status: 'pending' | 'in-transit' | 'delivered';
}

export const ParcelTracker = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [parcelSize, setParcelSize] = useState('');
  const [numberOfBoxes, setNumberOfBoxes] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [fromLocation, setFromLocation] = useState<any>(null);
  const [toLocation, setToLocation] = useState<any>(null);
  const [isFromLocationOpen, setIsFromLocationOpen] = useState(false);
  const [isToLocationOpen, setIsToLocationOpen] = useState(false);
  const [isCourierView, setIsCourierView] = useState(false);
  const [parcelJourneys, setParcelJourneys] = useState<ParcelJourney[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<ParcelJourney | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we're in courier view (URL parameter)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const parcelId = urlParams.get('parcel');
    if (parcelId) {
      setIsCourierView(true);
      // Load parcel data for courier view
      loadParcelData(parcelId);
    }
  }, []);

  // Load parcel data for courier view
  const loadParcelData = async (bagId: string) => {
    try {
      const { data, error } = await supabase
        .from('parcel_journeys')
        .select('*')
        .eq('bag_id', bagId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedParcel(data);
        setFromLocation(data.from_location);
        setToLocation(data.to_location);
      }
    } catch (error) {
      console.error('Error loading parcel data:', error);
    }
  };

  // Load all parcel journeys for courier view
  useEffect(() => {
    if (isCourierView) {
      loadAllParcelJourneys();
    }
  }, [isCourierView]);

  const loadAllParcelJourneys = async () => {
    try {
      const { data, error } = await supabase
        .from('parcel_journeys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setParcelJourneys(data);
      }
    } catch (error) {
      console.error('Error loading parcel journeys:', error);
    }
  };

  // Generate unique bag ID
  const generateBagId = () => {
    return 'SP' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation || !toLocation) {
      alert('Please select both pickup and delivery locations');
      return;
    }

    setIsSubmitting(true);
    try {
      const bagId = generateBagId();
      const journeyData = {
        bag_id: bagId,
        customer_name: customerName,
        customer_phone: customerPhone,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        from_location: fromLocation,
        to_location: toLocation,
        parcel_size: parcelSize,
        number_of_boxes: numberOfBoxes,
        special_instructions: specialInstructions,
        status: 'pending'
      };

      const { error } = await supabase
        .from('parcel_journeys')
        .upsert(journeyData, { onConflict: 'bag_id' });

      if (error) throw error;

      // Show success message with bag ID
      alert(`Parcel journey configured successfully! Your bag ID is: ${bagId}`);
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setRecipientName('');
      setRecipientPhone('');
      setParcelSize('');
      setNumberOfBoxes(1);
      setSpecialInstructions('');
      setFromLocation(null);
      setToLocation(null);

    } catch (error) {
      console.error('Error saving parcel journey:', error);
      alert('Error saving parcel journey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update parcel status (courier view)
  const updateParcelStatus = async (bagId: string, newStatus: 'pending' | 'in-transit' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('parcel_journeys')
        .update({ status: newStatus })
        .eq('bag_id', bagId);

      if (error) throw error;
      
      // Refresh the data
      loadAllParcelJourneys();
      if (selectedParcel) {
        setSelectedParcel({ ...selectedParcel, status: newStatus });
      }
      
      alert(`Parcel status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating parcel status:', error);
      alert('Error updating parcel status. Please try again.');
    }
  };

  // Customer View - Original configuration form
  if (!isCourierView) {
    return (
      <section id="parcel-tracker" className="py-8 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/image copy 2.png)' }}>
        <div className="container mx-auto px-6 text-center">
          {/* Hero Section */}
          <div className="mb-8">
            <h3 className="text-3xl font-semibold text-white mb-4 drop-shadow-2xl">
              Already have a QR code?
            </h3>
            <h2 className="text-6xl font-bold text-white mb-8 drop-shadow-2xl">
              Configure Your Parcel Journey
            </h2>
            <p className="text-xl text-white/95 mb-0 drop-shadow-lg max-w-4xl mx-auto leading-relaxed">
              Sparcel makes it easy, affordable, and reliable to send and receive parcels in South Africa's townships and rural areas. Select pickup and delivery locations from our trusted network of spaza shops.
            </p>
          </div>

          {/* Scan QR Code Section */}
          <div className="mb-12 bg-white rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-[#FF5823] rounded-full flex items-center justify-center">
                <PackageIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Scan QR code from your parcel bag
              </h3>
            </div>
            <p className="text-gray-600 text-lg mb-6">
              Already have a QR code? Scan it to configure or track your parcel journey.
            </p>
            <Button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3">
              [?]
            </Button>
          </div>

          {/* Configuration Form */}
          <Card className="mb-20 border-0 bg-white max-w-4xl mx-auto shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 py-10">
              <CardTitle className="flex items-center justify-center gap-4 text-3xl font-bold">
                <PackageIcon className="h-10 w-10 text-[#FF5823]" />
                Parcel Size & Details
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg mt-3">
                Configure your parcel journey details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-16 bg-white">
              <form onSubmit={handleSubmit} className="space-y-8 text-left">
                
                {/* Parcel Size Selection */}
                <div className="space-y-4">
                  <label className="text-gray-700 font-semibold text-lg">
                    Select Parcel Size:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setParcelSize('Envelope')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        parcelSize === 'Envelope' 
                          ? 'border-[#FF5823] bg-[#FF5823]/10' 
                          : 'border-gray-300 hover:border-[#FF5823]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📮</div>
                        <div className="font-semibold text-gray-700">ENVELOPE</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParcelSize('Small')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        parcelSize === 'Small' 
                          ? 'border-[#FF5823] bg-[#FF5823]/10' 
                          : 'border-gray-300 hover:border-[#FF5823]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="font-semibold text-gray-700">SMALL</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParcelSize('Medium')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        parcelSize === 'Medium' 
                          ? 'border-[#FF5823] bg-[#FF5823]/10' 
                          : 'border-gray-300 hover:border-[#FF5823]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="font-semibold text-gray-700">MEDIUM</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setParcelSize('Large')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        parcelSize === 'Large' 
                          ? 'border-[#FF5823] bg-[#FF5823]/10' 
                          : 'border-gray-300 hover:border-[#FF5823]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="font-semibold text-gray-700">LARGE</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Number of Boxes */}
                <div className="space-y-4">
                  <label className="text-gray-700 font-semibold text-lg">
                    Number of Boxes:
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setNumberOfBoxes(Math.max(1, numberOfBoxes - 1))}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-700 min-w-[3rem] text-center">
                      {numberOfBoxes}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumberOfBoxes(numberOfBoxes + 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="customerName" className="text-gray-700 font-semibold">
                      <UserIcon className="inline h-4 w-4 mr-2" />
                      Your Name
                    </label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="customerPhone" className="text-gray-700 font-semibold">
                      <PhoneIcon className="inline h-4 w-4 mr-2" />
                      Your Phone Number
                    </label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="recipientName" className="text-gray-700 font-semibold">
                      <UserIcon className="inline h-4 w-4 mr-2" />
                      Recipient Name
                    </label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient's full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="recipientPhone" className="text-gray-700 font-semibold">
                      <PhoneIcon className="inline h-4 w-4 mr-2" />
                      Recipient Phone Number
                    </label>
                    <Input
                      id="recipientPhone"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="Enter recipient's phone number"
                      required
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <label htmlFor="specialInstructions" className="text-gray-700 font-semibold">
                    Special Instructions:
                  </label>
                  <Input
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special handling requirements?"
                  />
                </div>

                {/* Location Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-semibold">
                      <MapPinIcon className="inline h-4 w-4 mr-2" />
                      Pickup Location (Point A)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFromLocationOpen(true)}
                      className="w-full justify-start"
                    >
                      {fromLocation ? fromLocation.name : 'Select pickup location'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-semibold">
                      <MapPinIcon className="inline h-4 w-4 mr-2" />
                      Delivery Location (Point B)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsToLocationOpen(true)}
                      className="w-full justify-start"
                    >
                      {toLocation ? toLocation.name : 'Select delivery location'}
                    </Button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 w-4 h-4 text-[#FF5823] border-gray-300 rounded focus:ring-[#FF5823]"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I confirm that my parcel does not contain any <strong>prohibited</strong> items and I agree to Sparcel's <strong>terms and conditions.</strong>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !fromLocation || !toLocation || !parcelSize}
                    className="w-full bg-[#FF5823] hover:bg-[#FF5823]/90 text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? 'Configuring Journey...' : 'Configure Parcel Journey'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* How It Works Section */}
          <div className="mb-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center drop-shadow-xl">
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/20 rounded-xl p-6 border border-white/30 text-center">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Configure Journey</h4>
                <p className="text-white/90">
                  Set pickup and delivery locations from our trusted network of spaza shops
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-6 border border-white/30 text-center">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Generate QR Code</h4>
                <p className="text-white/90">
                  Get your unique QR code for tracking and managing your parcel journey
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Selector Dialogs */}
        <LocationSelector
          isOpen={isFromLocationOpen}
          onClose={() => setIsFromLocationOpen(false)}
          onLocationSelect={(location) => {
            setFromLocation(location);
            setIsFromLocationOpen(false);
          }}
          title="Select Pickup Location"
          placeholder="Choose where to pick up your parcel"
        />

        <LocationSelector
          isOpen={isToLocationOpen}
          onClose={() => setIsToLocationOpen(false)}
          onLocationSelect={(location) => {
            setToLocation(location);
            setIsToLocationOpen(false);
          }}
          title="Select Delivery Location"
          placeholder="Choose where to deliver your parcel"
        />
      </section>
    );
  }

  // Courier View - All parcel journeys
  return (
    <section id="parcel-tracker" className="py-8 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/image copy 2.png)' }}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            <TruckIcon className="inline h-12 w-12 mr-4" />
            Courier Dashboard
          </h2>
          <p className="text-xl text-white/90 drop-shadow-lg max-w-3xl mx-auto">
            Manage all parcel journeys and update delivery statuses
          </p>
        </div>

        {/* Parcel Journeys List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {parcelJourneys.map((journey) => (
            <Card
              key={journey.bag_id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedParcel?.bag_id === journey.bag_id ? 'ring-2 ring-[#FF5823]' : ''
              }`}
              onClick={() => setSelectedParcel(journey)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-[#FF5823]">
                      Bag ID: {journey.bag_id}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {journey.customer_name} → {journey.recipient_name}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    journey.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    journey.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {journey.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <p><strong>From:</strong> {journey.from_location?.name}</p>
                  <p><strong>To:</strong> {journey.to_location?.name}</p>
                  <p><strong>Size:</strong> {journey.parcel_size}</p>
                  <p><strong>Boxes:</strong> {journey.number_of_boxes}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Parcel Details */}
        {selectedParcel && (
          <Card className="max-w-4xl mx-auto shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="text-2xl text-gray-900">
                Parcel Details: {selectedParcel.bag_id}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedParcel.customer_name}</p>
                    <p><strong>Phone:</strong> {selectedParcel.customer_phone}</p>
                    <p><strong>Recipient:</strong> {selectedParcel.recipient_name}</p>
                    <p><strong>Recipient Phone:</strong> {selectedParcel.recipient_phone}</p>
                  </div>
                </div>

                {/* Parcel Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parcel Information</h3>
                  <div className="space-y-2">
                    <p><strong>Size:</strong> {selectedParcel.parcel_size}</p>
                    <p><strong>Number of Boxes:</strong> {selectedParcel.number_of_boxes}</p>
                    <p><strong>Special Instructions:</strong> {selectedParcel.special_instructions || 'None'}</p>
                    <p><strong>Current Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        selectedParcel.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedParcel.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedParcel.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Route Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Pickup Location</h4>
                    <p className="text-gray-700">{selectedParcel.from_location?.name}</p>
                    <p className="text-sm text-gray-600">{selectedParcel.from_location?.address}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Location</h4>
                    <p className="text-gray-700">{selectedParcel.to_location?.name}</p>
                    <p className="text-sm text-gray-600">{selectedParcel.to_location?.address}</p>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => updateParcelStatus(selectedParcel.bag_id, 'pending')}
                    variant={selectedParcel.status === 'pending' ? 'default' : 'outline'}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Mark as Pending
                  </Button>
                  <Button
                    onClick={() => updateParcelStatus(selectedParcel.bag_id, 'in-transit')}
                    variant={selectedParcel.status === 'in-transit' ? 'default' : 'default'}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <TruckIcon className="h-4 w-4 mr-2" />
                    Mark as In Transit
                  </Button>
                  <Button
                    onClick={() => updateParcelStatus(selectedParcel.bag_id, 'delivered')}
                    variant={selectedParcel.status === 'delivered' ? 'default' : 'outline'}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}; 