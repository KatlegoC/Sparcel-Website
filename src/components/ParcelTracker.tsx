import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

import { MapPinIcon, UserIcon, PhoneIcon, TruckIcon, CheckCircleIcon, BoxIcon } from 'lucide-react';
import { LocationSelector } from './LocationSelector';
import { supabase } from '@/lib/supabase';
import { sendBookingConfirmationEmails } from '@/lib/emailService';
import { markQRCodeAsUsed } from '@/lib/qrCodeService';

interface ParcelJourney {
  bag_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_id_number: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  from_location: any;
  to_location: any;
  parcel_size: string;
  number_of_boxes: number;
  special_instructions: string;
  status: 'pending' | 'in-transit' | 'delivered';
  booking_confirmation?: DropperBookingResponse;
  tracking_number?: string;
  booking_status?: 'pending' | 'confirmed' | 'failed';
  courier_company?: string;
  created_at?: string;
}

interface ParcelLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
  businessHours: string;
  rating: number;
  distance?: number;
}

interface DropperQuote {
  id: string;
  price: number;
  currency: string;
  estimated_delivery: string;
  service_type: string;
  provider: string;
  delivery_category: string;
  quotes_id?: string; // This will come from the actual quote response
  serviceId?: string; // This will come from the actual quote response
}

interface DropperBookingRequest {
  serviceId: string;
  quotes_id: string;
  pickUp_address: {
    province: string;
    suburb: string;
    addressLine: string;
    postalCode: string;
    latitude: string;
    longitude: string;
    comment: string;
    contact: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
  };
  dropOff_address: {
    province: string;
    suburb: string;
    addressLine: string;
    postalCode: string;
    latitude: string;
    longitude: string;
    comment: string;
    contact: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
  };
  type: string;
  pickUpDate: string;
  parcelDimensions: Array<{
    parcel_number: string;
    parcel_length: number;
    parcel_breadth: number;
    parcel_height: number;
    parcel_mass: number;
  }>;
}

interface DropperBookingResponse {
  oid: string | null;
  businessKey: string | null;
  trackNo: string | null;
  statusCode: number;
  message: string;
  link: string | null;
}

interface DropperQuoteRequest {
  pickUp_address: {
    province: string;
    suburb: string;
    addressLine: string;
    postalCode: string;
    latitude?: string;
    longitude?: string;
  };
  dropOff_address: {
    province: string;
    suburb: string;
    addressLine: string;
    postalCode: string;
    latitude?: string;
    longitude?: string;
  };
  parcelDimensions: Array<{
    parcel_length: number;
    parcel_breadth: number;
    parcel_height: number;
    parcel_mass: number;
  }>;
}

export const ParcelTracker = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerIdNumber, setCustomerIdNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [parcelSize, setParcelSize] = useState('');
  const [numberOfBoxes, setNumberOfBoxes] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [fromLocation, setFromLocation] = useState<any>(null);
  const [toLocation, setToLocation] = useState<any>(null);
  const [isFromLocationOpen, setIsFromLocationOpen] = useState(false);
  const [isToLocationOpen, setIsToLocationOpen] = useState(false);
  const [isCourierView, setIsCourierView] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<ParcelJourney | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<string>('');
  const [quotes, setQuotes] = useState<DropperQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [autoLoadQuotes, setAutoLoadQuotes] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<DropperQuote | null>(null);
  const [localQuoteSelection, setLocalQuoteSelection] = useState<DropperQuote | null>(null);

  // Check if we're in courier view (URL parameter or QR code scan)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bagId = urlParams.get('bag');
    
    if (bagId) {
      setCurrentQRCode(bagId);
      // Check if journey exists for this QR code
      getJourneyByQRCode(bagId).then((existingJourney) => {
        if (existingJourney) {
          // Journey exists - show courier view ONLY (no more configuration allowed)
          setIsCourierView(true);
          setSelectedParcel(existingJourney);
          setFromLocation(existingJourney.from_location);
          setToLocation(existingJourney.to_location);
          setShowQRPopup(false);
          console.log('Existing journey found for QR code:', bagId, existingJourney);
          console.log('From location in existing journey:', existingJourney.from_location);
          console.log('To location in existing journey:', existingJourney.to_location);
          console.log('This QR code has already been configured - showing courier view only');
        } else {
          // No journey exists - show QR popup first
          setIsCourierView(false);
          setShowQRPopup(true);
          console.log('No existing journey found for QR code:', bagId, '- showing QR popup');
        }
      }).catch((error) => {
        console.error('Error checking for existing journey:', error);
        setIsCourierView(false);
        setShowQRPopup(true);
      });
    }
  }, []);

  // Create booking with Dropper Group
  const createBookingWithDropper = async (journey: ParcelJourney, selectedQuote: DropperQuote): Promise<DropperBookingResponse | null> => {
    console.log('🔍 Selected Quote for Booking:', JSON.stringify(selectedQuote, null, 2));
    
    if (!selectedQuote.quotes_id || !selectedQuote.serviceId) {
      console.error('❌ Missing quotes_id or serviceId for booking:', {
        quotes_id: selectedQuote.quotes_id,
        serviceId: selectedQuote.serviceId
      });
      return null;
    }

    try {
      // Parse names for contact details
      const customerNameParts = journey.customer_name.trim().split(' ');
      const customerFirstName = customerNameParts[0] || '';
      const customerLastName = customerNameParts.slice(1).join(' ') || '';

      const recipientNameParts = journey.recipient_name.trim().split(' ');
      const recipientFirstName = recipientNameParts[0] || '';
      const recipientLastName = recipientNameParts.slice(1).join(' ') || '';

      // Get parcel dimensions based on parcel size
      const getParcelDimensions = (size: string) => {
        switch (size.toLowerCase()) {
          case 'envelope':
            return { length: 30, breadth: 20, height: 2, mass: 0.5 };
          case 'small':
            return { length: 40, breadth: 30, height: 10, mass: 1.0 };
          case 'medium':
            return { length: 50, breadth: 40, height: 20, mass: 2.0 };
          case 'large':
            return { length: 60, breadth: 50, height: 30, mass: 3.0 };
          default:
            return { length: 40, breadth: 30, height: 10, mass: 1.0 };
        }
      };

      const baseDimensions = getParcelDimensions(journey.parcel_size);
      const parcelDimensions = Array.from({ length: journey.number_of_boxes }, (_, i) => ({
        parcel_number: (i + 1).toString(),
        parcel_length: parseInt(baseDimensions.length.toString()),
        parcel_breadth: parseInt(baseDimensions.breadth.toString()),
        parcel_height: parseInt(baseDimensions.height.toString()),
        parcel_mass: parseInt(baseDimensions.mass.toString())
      }));

      // Parse province for API format
      const parseProvince = (province: string) => {
        const provinceMap: { [key: string]: string } = {
          'western cape': 'WESTERN_CAPE',
          'gauteng': 'GAUTENG',
          'kwazulu natal': 'KWAZULU_NATAL',
          'free state': 'FREE_STATE',
          'limpopo': 'LIMPOPO',
          'mpumalanga': 'MPUMALANGA',
          'north west': 'NORTH_WEST',
          'northern cape': 'NORTHERN_CAPE',
          'eastern cape': 'EASTERN_CAPE'
        };
        return provinceMap[province.toLowerCase()] || 'WESTERN_CAPE';
      };

      const bookingData: DropperBookingRequest = {
        serviceId: selectedQuote.serviceId,
        quotes_id: selectedQuote.quotes_id,
        pickUp_address: {
          province: parseProvince(journey.from_location.province || 'Western Cape'),
          suburb: journey.from_location.suburb || 'Cape Town',
          addressLine: journey.from_location.address || journey.from_location.name || '',
          postalCode: journey.from_location.postalCode || '8001',
          latitude: journey.from_location.lat.toString(),
          longitude: journey.from_location.lng.toString(),
          comment: `Pick up from Sparcel point: ${journey.from_location.name}`,
          contact: {
            firstName: customerFirstName,
            lastName: customerLastName,
            phone: journey.customer_phone,
            email: journey.customer_email
          }
        },
        dropOff_address: {
          province: parseProvince(journey.to_location.province || 'Western Cape'),
          suburb: journey.to_location.suburb || 'Cape Town',
          addressLine: journey.to_location.address || journey.to_location.name || '',
          postalCode: journey.to_location.postalCode || '8001',
          latitude: journey.to_location.lat.toString(),
          longitude: journey.to_location.lng.toString(),
          comment: `Drop off at Sparcel point: ${journey.to_location.name}`,
          contact: {
            firstName: recipientFirstName,
            lastName: recipientLastName,
            phone: journey.recipient_phone,
            email: journey.recipient_email
          }
        },
        type: 'EXPRESS_COURIER',
        pickUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '), // Tomorrow at current time
        parcelDimensions: parcelDimensions
      };

      console.log('🚀 Creating booking with Dropper Group:', JSON.stringify(bookingData, null, 2));

      const response = await fetch('https://api.droppergroup.co.za/droppa/services/v1/create/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 073260f4-1130-4837-9fca-446cf184280c:6092a7062874346f830da07d',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('📡 Booking API Response Status:', response.status, response.statusText);
      console.log('📡 Booking API Response Headers:', Object.fromEntries(response.headers.entries()));

      let bookingResponse: DropperBookingResponse;
      try {
        bookingResponse = await response.json();
        console.log('📡 Booking API Response Body:', JSON.stringify(bookingResponse, null, 2));
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.log('📡 Raw Response Text:', textResponse);
        throw new Error(`Invalid JSON response: ${textResponse}`);
      }
      
      // Check for success - API might return 200 status but different success indicators
      if (response.ok) {
        console.log('✅ HTTP Response OK, checking booking details...');
        
        // Check if we have a tracking number or business key (indicating success)
        if (bookingResponse.trackNo || bookingResponse.businessKey || bookingResponse.oid) {
          console.log('✅ Booking created successfully with Dropper Group');
          console.log('📦 Tracking Number:', bookingResponse.trackNo || 'N/A');
          console.log('🔑 Business Key:', bookingResponse.businessKey || 'N/A');
          console.log('🆔 OID:', bookingResponse.oid || 'N/A');
          console.log('📊 Full Success Response:', bookingResponse);
          return bookingResponse;
        } else if (bookingResponse.statusCode === 200) {
          console.log('✅ Booking created successfully (statusCode 200)');
          return bookingResponse;
        } else {
          console.error('❌ Booking response indicates failure:', bookingResponse);
          return bookingResponse;
        }
      } else {
        console.error('❌ HTTP Request failed:', {
          status: response.status,
          statusText: response.statusText,
          response: bookingResponse
        });
        return bookingResponse;
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      return null;
    }
  };

  // Auto-load quotes when parcel size, pickup, and delivery locations are selected
  useEffect(() => {
    const shouldLoadQuotes = parcelSize && fromLocation && toLocation && autoLoadQuotes;
    
    if (shouldLoadQuotes) {
      console.log('Auto-loading quotes for:', { parcelSize, fromLocation, toLocation });
      
      // Add 1-second delay with loader
      setIsLoadingQuotes(true);
      setSelectedQuote(null); // Clear previous selection
      setLocalQuoteSelection(null);
      
      setTimeout(() => {
        getQuotes();
      }, 1000);
    }
  }, [parcelSize, fromLocation, toLocation, autoLoadQuotes]);

  // Get journey by QR code from Supabase (with localStorage fallback)
  const getJourneyByQRCode = async (qrCode: string): Promise<ParcelJourney | null> => {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('parcel_journeys')
        .select('*')
        .eq('bag_id', qrCode)
        .single();

      if (error) {
        console.log('Supabase query failed, falling back to localStorage:', error.message);
        // Fallback to localStorage
        const journeys = JSON.parse(localStorage.getItem('parcelJourneys') || '[]');
        return journeys.find((journey: ParcelJourney) => journey.bag_id === qrCode) || null;
      }

      if (data) {
        // Convert Supabase data to local format
        return {
          bag_id: data.bag_id,
          customer_name: data.customer_name || '',
          customer_phone: data.customer_phone || '',
          customer_email: data.customer_email || '',
          customer_id_number: data.customer_id_number || '',
          recipient_name: data.recipient_name || '',
          recipient_phone: data.recipient_phone || '',
          recipient_email: data.recipient_email || '',
          from_location: data.from_location,
          to_location: data.to_location,
          parcel_size: data.parcel_size || '',
          number_of_boxes: data.number_of_boxes || 1,
          special_instructions: data.special_instructions || '',
          status: data.status
        };
      }

      // Fallback to localStorage if no data found
      const journeys = JSON.parse(localStorage.getItem('parcelJourneys') || '[]');
      return journeys.find((journey: ParcelJourney) => journey.bag_id === qrCode) || null;
    } catch (error) {
      console.error('Error reading journey data:', error);
      // Fallback to localStorage
      try {
        const journeys = JSON.parse(localStorage.getItem('parcelJourneys') || '[]');
        return journeys.find((journey: ParcelJourney) => journey.bag_id === qrCode) || null;
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
        return null;
      }
    }
  }

  // Save journey to Supabase (with localStorage fallback)
  const saveJourneyToStorage = async (journey: ParcelJourney) => {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('parcel_journeys')
        .upsert({
          bag_id: journey.bag_id,
          customer_name: journey.customer_name,
          customer_phone: journey.customer_phone,
          customer_email: journey.customer_email,
          customer_id_number: journey.customer_id_number,
          recipient_name: journey.recipient_name,
          recipient_phone: journey.recipient_phone,
          recipient_email: journey.recipient_email,
          from_location: journey.from_location,
          to_location: journey.to_location,
          parcel_size: journey.parcel_size,
          number_of_boxes: journey.number_of_boxes,
          special_instructions: journey.special_instructions,
          status: journey.status,
          booking_confirmation: journey.booking_confirmation,
          tracking_number: journey.tracking_number,
          booking_status: journey.booking_status,
          courier_company: journey.courier_company,
          oid: journey.booking_confirmation?.oid,
          business_key: journey.booking_confirmation?.businessKey,
          track_no: journey.booking_confirmation?.trackNo,
          tracking_link: journey.booking_confirmation?.link,
          booking_message: journey.booking_confirmation?.message,
          booking_status_code: journey.booking_confirmation?.statusCode
        }, {
          onConflict: 'bag_id'
        });

      if (error) {
        console.error('Supabase save failed, falling back to localStorage:', error);
        // Fallback to localStorage
        const existingJourneys = JSON.parse(localStorage.getItem('parcelJourneys') || '[]');
        const existingIndex = existingJourneys.findIndex((j: ParcelJourney) => j.bag_id === journey.bag_id);
        
        if (existingIndex >= 0) {
          existingJourneys[existingIndex] = journey;
          console.log('Updated existing journey in localStorage for bag ID:', journey.bag_id);
        } else {
          existingJourneys.push(journey);
          console.log('Added new journey to localStorage for bag ID:', journey.bag_id);
        }
        
        localStorage.setItem('parcelJourneys', JSON.stringify(existingJourneys));
        console.log('Successfully saved journey to localStorage for bag ID:', journey.bag_id);
      } else {
        console.log('Successfully saved journey to Supabase for bag ID:', journey.bag_id);
      }
    } catch (error) {
      console.error('Error saving journey:', error);
      // Fallback to localStorage
      try {
        const existingJourneys = JSON.parse(localStorage.getItem('parcelJourneys') || '[]');
        const existingIndex = existingJourneys.findIndex((j: ParcelJourney) => j.bag_id === journey.bag_id);
        
        if (existingIndex >= 0) {
          existingJourneys[existingIndex] = journey;
        } else {
          existingJourneys.push(journey);
        }
        
        localStorage.setItem('parcelJourneys', JSON.stringify(existingJourneys));
        console.log('Saved to localStorage as fallback');
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
      }
    }
  }

  // Fetch quotes from Dropper Group API
  const fetchDropperQuotes = async (request: DropperQuoteRequest): Promise<DropperQuote[]> => {
    try {
      setIsLoadingQuotes(true);
      
      console.log('📤 Sending quotes request to Dropper API:', JSON.stringify(request, null, 2));
      
      const response = await fetch('https://api.droppergroup.co.za/droppa/services/v1/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 073260f4-1130-4837-9fca-446cf184280c:6092a7062874346f830da07d',
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Quotes API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Quotes API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 Raw Dropper API Response:', JSON.stringify(data, null, 2));
      
      // Transform the response to match our DropperQuote interface
      const quotes: DropperQuote[] = [];
      
      // Get the top-level quotes_id that applies to all quotes in this response
      const responseQuotesId = data.quotes_id;
      console.log('🔑 Using quotes_id from response:', responseQuotesId);
      
      if (data.quotes && Array.isArray(data.quotes)) {
        data.quotes.forEach((company: any) => {
          if (company.rates && Array.isArray(company.rates)) {
            company.rates.forEach((rate: any) => {
              // Categorize delivery speed based on service type and description
              let deliveryCategory = 'Standard';
              const serviceName = (rate.service_name || rate.type || '').toLowerCase();
              const description = (rate.description || '').toLowerCase();
              
              if (serviceName.includes('same day') || serviceName.includes('flash') || description.includes('same day')) {
                deliveryCategory = 'Same Day';
              } else if (serviceName.includes('express') || serviceName.includes('overnight') || description.includes('next day')) {
                deliveryCategory = '1-2 Days';
              } else if (serviceName.includes('budget') || description.includes('3-5') || description.includes('2-5')) {
                deliveryCategory = '3-5 Days';
              } else if (description.includes('7') || description.includes('8') || description.includes('9')) {
                deliveryCategory = '7-9 Days';
              }
              
              quotes.push({
                id: `${company.companyName}-${rate.type}-${Math.random().toString(36).substr(2, 9)}`,
                price: rate.amount || 0,
                currency: 'ZAR',
                estimated_delivery: rate.deliveryDate || '1-2 days',
                service_type: rate.service_name || rate.type || 'Standard',
                provider: company.companyName || 'Unknown',
                delivery_category: deliveryCategory,
                quotes_id: responseQuotesId, // Use the top-level quotes_id
                serviceId: '6092a7062874346f830da07d' // Our test service ID
              });
            });
          }
        });
      }

      console.log('✅ Real Dropper API quotes loaded:', quotes.length, 'quotes');
      setQuotes(quotes);
      return quotes;
    } catch (error) {
      console.error('❌ Error fetching Dropper quotes:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      // Show error to user instead of falling back to mock data
      alert(`❌ DELIVERY QUOTES UNAVAILABLE\n\nWe couldn't fetch delivery quotes from our courier service.\n\nThis might be due to:\n• Network connectivity issues\n• Courier service temporarily unavailable\n• Invalid pickup/delivery locations\n\n⚠️ Please check your internet connection and try again.\n\nIf the problem persists, please contact support.`);
      
      setQuotes([]);
      return [];
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  // Helper function to get parcel dimensions based on size
  const getParcelDimensions = (size: string) => {
    const dimensions = {
      envelope: { length: 25, breadth: 15, height: 2, mass: 0.5 },
      small: { length: 30, breadth: 20, height: 10, mass: 5 },
      medium: { length: 35, breadth: 25, height: 15, mass: 9 },
      large: { length: 45, breadth: 35, height: 25, mass: 15 },
    };
    return dimensions[size as keyof typeof dimensions] || dimensions.medium;
  };

  // Helper function to parse address components
  const parseAddress = (address: string) => {
    // Simple parsing - in production, you'd want more sophisticated address parsing
    const parts = address.split(',');
    const provinceText = parts[2]?.trim() || 'Western Cape';
    
    // Map province names to API enum format
    const provinceMap: { [key: string]: string } = {
      'Western Cape': 'WESTERN_CAPE',
      'Gauteng': 'GAUTENG',
      'KwaZulu-Natal': 'KWAZULU_NATAL',
      'North West': 'NORTH_WEST',
      'Mpumalanga': 'MPUMALANGA',
      'Limpopo': 'LIMPOPO',
      'Northern Cape': 'NORTHERN_CAPE',
      'Eastern Cape': 'EASTERN_CAPE',
      'Free State': 'FREE_STATE'
    };
    
    return {
      addressLine: parts[0]?.trim() || address,
      suburb: parts[1]?.trim() || 'Unknown',
      province: provinceMap[provinceText] || 'WESTERN_CAPE',
      postalCode: '8000', // Default postal code - should be parsed from address
    };
  };

  // Function to get quotes when locations are selected
  const getQuotes = async () => {
    if (!fromLocation || !toLocation || !parcelSize) {
      alert('Please select pickup location, delivery location, and parcel size first.');
      return;
    }

    const pickupAddress = parseAddress(fromLocation.address);
    const deliveryAddress = parseAddress(toLocation.address);
    const dimensions = getParcelDimensions(parcelSize);

    const request: DropperQuoteRequest = {
      pickUp_address: {
        province: pickupAddress.province,
        suburb: pickupAddress.suburb,
        addressLine: pickupAddress.addressLine,
        postalCode: pickupAddress.postalCode,
        latitude: fromLocation.lat?.toString(),
        longitude: fromLocation.lng?.toString(),
      },
      dropOff_address: {
        province: deliveryAddress.province,
        suburb: deliveryAddress.suburb,
        addressLine: deliveryAddress.addressLine,
        postalCode: deliveryAddress.postalCode,
        latitude: toLocation.lat?.toString(),
        longitude: toLocation.lng?.toString(),
      },
      parcelDimensions: Array(numberOfBoxes).fill(null).map(() => ({
        parcel_length: dimensions.length,
        parcel_breadth: dimensions.breadth,
        parcel_height: dimensions.height,
        parcel_mass: dimensions.mass,
      })),
    };

    await fetchDropperQuotes(request);
  };

  // Clear form data
  const clearForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerIdNumber('');
    setRecipientName('');
    setRecipientPhone('');
    setRecipientEmail('');
    setParcelSize('');
    setNumberOfBoxes(1);
    setSpecialInstructions('');
    setFromLocation(null);
    setToLocation(null);
    setAutoLoadQuotes(false);
    setQuotes([]);
    setSelectedQuote(null);
    setLocalQuoteSelection(null);
  }

  // No need to load all journeys - courier view only shows the specific scanned bag

  // Generate unique bag ID (use QR code if available)
  const generateBagId = () => {
    if (currentQRCode) {
      console.log('Using QR code ID as bag ID:', currentQRCode);
      return currentQRCode;
    }
    const randomId = 'SP' + Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log('Generated random bag ID:', randomId);
    return randomId;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bagId = generateBagId();
      
      // IMPORTANT: Only proceed if a quote is selected (delivery booking is required)
      if (!localQuoteSelection) {
        alert('❌ Please select a delivery option before submitting.');
        setIsSubmitting(false);
        return;
      }

      const journeyData: ParcelJourney = {
        bag_id: bagId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_id_number: customerIdNumber,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        from_location: fromLocation,
        to_location: toLocation,
        parcel_size: parcelSize,
        number_of_boxes: numberOfBoxes,
        special_instructions: specialInstructions,
        status: 'pending' as 'pending' | 'in-transit' | 'delivered',
        created_at: new Date().toISOString()
      };

      // Create booking with Dropper Group FIRST (before saving anything)
      console.log('🚀 Creating booking with Dropper Group for selected quote:', localQuoteSelection);
      const bookingResponse = await createBookingWithDropper(journeyData, localQuoteSelection);
      
      // Check for success indicators: tracking number, business key, or statusCode 200
      const isBookingSuccessful = bookingResponse !== null && (
        bookingResponse.trackNo !== null || 
        bookingResponse.businessKey !== null || 
        bookingResponse.oid !== null || 
        bookingResponse.statusCode === 200
      );
      
      if (!isBookingSuccessful || !bookingResponse) {
        // BOOKING FAILED - Don't save anything, ask user to retry
        console.error('❌ Booking failed with Dropper Group');
        console.error('📊 Failed Booking Response:', bookingResponse);
        
        alert(`❌ DELIVERY BOOKING FAILED\n\nWe could not complete your delivery booking with ${localQuoteSelection?.provider || 'the courier'}.\n\n${bookingResponse?.message || 'The courier service is temporarily unavailable.'}\n\n⚠️ Please try again in a few moments.`);
        setIsSubmitting(false);
        return;
      }

      // BOOKING SUCCESSFUL - Now save everything
      const bookingRef = bookingResponse.trackNo || bookingResponse.businessKey || bookingResponse.oid || 'N/A';
      console.log('✅ Booking created successfully with Dropper Group');
      console.log('📋 Booking Reference:', bookingRef);
      console.log('📦 Tracking Number:', bookingResponse.trackNo || 'N/A');
      console.log('🔗 Tracking Link:', bookingResponse.link || 'N/A');
      console.log('📊 Full Booking Response:', bookingResponse);
      
      // Store booking confirmation in the journey data
      journeyData.booking_confirmation = bookingResponse;
      journeyData.tracking_number = bookingResponse.trackNo || bookingResponse.businessKey || bookingResponse.oid || 'N/A';
      journeyData.booking_status = 'confirmed';
      journeyData.courier_company = localQuoteSelection?.provider || 'Dropper Group';
      
      // Save to database (with localStorage fallback)
      await saveJourneyToStorage(journeyData);
      
      // Mark QR code as used if it exists
      if (currentQRCode) {
        try {
          await markQRCodeAsUsed(currentQRCode);
          console.log('✅ QR code marked as used:', currentQRCode);
        } catch (error) {
          console.warn('⚠️ Failed to mark QR code as used:', error);
          // Don't fail the entire process if QR code marking fails
        }
      }
      
      console.log('💾 Journey and booking details saved to database:', {
        bag_id: journeyData.bag_id,
        tracking_number: journeyData.tracking_number,
        booking_status: journeyData.booking_status,
        courier_company: journeyData.courier_company,
        oid: bookingResponse.oid,
        business_key: bookingResponse.businessKey,
        track_no: bookingResponse.trackNo
      });

      // Send confirmation emails to customer and recipient
      console.log('📧 Sending confirmation emails...');
      try {
        await sendBookingConfirmationEmails({
          bag_id: bagId,
          tracking_number: journeyData.tracking_number,
          courier_company: journeyData.courier_company,
          tracking_link: bookingResponse.link || undefined,
          pickup_location: {
            name: fromLocation?.name || 'Pickup Location',
            address: fromLocation?.address || fromLocation?.formatted_address || 'Address not available',
          },
          delivery_location: {
            name: toLocation?.name || 'Delivery Location',
            address: toLocation?.address || toLocation?.formatted_address || 'Address not available',
          },
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          recipient: {
            name: recipientName,
            email: recipientEmail,
            phone: recipientPhone,
          },
          parcel_size: parcelSize,
          number_of_boxes: numberOfBoxes,
        });
        console.log('✅ Confirmation emails sent successfully');
      } catch (emailError) {
        console.error('⚠️ Failed to send confirmation emails:', emailError);
        // Don't fail the booking if email fails
      }

      // Show success message with pickup instructions
      const pickupLocationName = fromLocation?.name || 'your selected pickup location';
      const deliveryLocationName = toLocation?.name || 'your delivery location';
      
      if (currentQRCode) {
        alert(`🎉 PARCEL JOURNEY BOOKED SUCCESSFULLY!\n\n📦 Bag ID: ${bagId}\n🏢 Courier: ${journeyData.courier_company}\n📋 Tracking Number: ${bookingRef}\n\n📍 NEXT STEP - DROP OFF YOUR PARCEL:\nPlease take your parcel to:\n${pickupLocationName}\n\n✅ Your parcel is booked for collection at this pickup point and will be delivered to:\n${deliveryLocationName}\n\n📱 Scan this QR code again to view the courier dashboard and track your parcel.`);
        console.log('Journey configured for QR code:', currentQRCode);
      } else {
        alert(`🎉 PARCEL JOURNEY BOOKED SUCCESSFULLY!\n\n📦 Bag ID: ${bagId}\n🏢 Courier: ${journeyData.courier_company}\n📋 Tracking Number: ${bookingRef}\n\n📍 NEXT STEP - DROP OFF YOUR PARCEL:\nPlease take your parcel to:\n${pickupLocationName}\n\n✅ Your parcel is booked for collection at this pickup point and will be delivered to:\n${deliveryLocationName}`);
      }
      
      // Reset form after successful submission
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerIdNumber('');
      setRecipientName('');
      setRecipientPhone('');
      setRecipientEmail('');
      setParcelSize('');
      setNumberOfBoxes(1);
      setSpecialInstructions('');
      setFromLocation(null);
      setToLocation(null);
      setAutoLoadQuotes(false);
      setQuotes([]);
      setSelectedQuote(null);
      setLocalQuoteSelection(null);
    } catch (error) {
      console.error('Error creating parcel journey:', error);
      alert('Error creating parcel journey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCourierView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container-professional">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Courier Dashboard</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track and manage all parcel journeys in real-time
            </p>
            {currentQRCode && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">
                  📱 QR Code Scanned: <span className="font-bold">{currentQRCode}</span>
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  ✅ This QR code has already been configured with a journey
                </p>
              </div>
            )}
          </div>

          {selectedParcel && (
            <Card className="card-elevated mb-8 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-[#FF5823] to-[#FF6B35] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Active Parcel: {selectedParcel.bag_id}</CardTitle>
                    <CardDescription className="text-white/90">
                      Status: <span className="font-semibold">{selectedParcel.status}</span>
                    </CardDescription>
                  </div>
                  <div className="text-white/90 text-sm">
                    Journey already configured
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Details</h4>
                    <p className="text-gray-600 mb-2">Name: {selectedParcel.customer_name}</p>
                    <p className="text-gray-600 mb-2">Phone: {selectedParcel.customer_phone}</p>
                    <p className="text-gray-600 mb-2">Email: {selectedParcel.customer_email}</p>
                    <p className="text-gray-600 mb-2">ID Number: {selectedParcel.customer_id_number}</p>
                    <p className="text-gray-600">Parcel Size: {selectedParcel.parcel_size}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recipient Details</h4>
                    <p className="text-gray-600 mb-2">Name: {selectedParcel.recipient_name}</p>
                    <p className="text-gray-600 mb-2">Phone: {selectedParcel.recipient_phone}</p>
                    <p className="text-gray-600 mb-2">Email: {selectedParcel.recipient_email}</p>
                    <p className="text-gray-600">Boxes: {selectedParcel.number_of_boxes}</p>
                  </div>
                </div>
                
                {/* Location Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">📍 Location Details</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Pickup Location</h5>
                      <p className="text-gray-600">
                        {selectedParcel.from_location?.formatted_address || 
                         selectedParcel.from_location?.address || 
                         'Address not specified'}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Delivery Location</h5>
                      <p className="text-gray-600">
                        {selectedParcel.to_location?.formatted_address || 
                         selectedParcel.to_location?.address || 
                         'Address not specified'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Special Instructions */}
                {selectedParcel.special_instructions && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">📝 Special Instructions</h4>
                    <p className="text-gray-600">{selectedParcel.special_instructions}</p>
                  </div>
                )}

                {/* Booking Information */}
                {selectedParcel.booking_status && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">🚚 Delivery Booking</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          selectedParcel.booking_status === 'confirmed' ? 'text-green-600' : 
                          selectedParcel.booking_status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {selectedParcel.booking_status === 'confirmed' ? '✅ Confirmed' :
                           selectedParcel.booking_status === 'failed' ? '❌ Failed' : '⏳ Pending'}
                        </span>
                      </div>
                      
                      {selectedParcel.courier_company && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Courier:</span>
                          <span className="font-medium text-gray-900">{selectedParcel.courier_company}</span>
                        </div>
                      )}
                      
                      {selectedParcel.tracking_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tracking Number:</span>
                          <span className="font-medium text-blue-600 font-mono">{selectedParcel.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Only show the specific bag that was scanned, not all bags */}
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">
              📦 This QR code is linked to bag: <span className="font-bold text-gray-900">{currentQRCode}</span>
            </p>
            <p className="text-gray-500 mt-2">
              Scan this QR code again to view the journey details
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen orange-bg py-12">
      <div className="container-professional">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl leading-tight sm:leading-tight font-bold text-white mb-4 sm:mb-6 px-4">
            Already have a QR code? <span className="text-gradient">Configure your Parcel Journey</span>
          </h1>
          <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed sm:leading-relaxed px-4">
            Sparcel makes it easy, affordable and reliable to send and receive parcels in townships and rural areas. 
            Select pickup and delivery locations from our trusted network of spaza shops.
          </p>
        </div>

        {/* QR Code Configuration Popup */}
        {showQRPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg border border-gray-200">
                  <img 
                    src="/QR code.png" 
                    alt="QR Code" 
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                  Configure Your Parcel Journey
                </h2>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Bag ID:</p>
                  <p className="text-lg sm:text-xl font-bold text-black">{currentQRCode}</p>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2">
                  This QR code can only be configured <strong>once</strong>. 
                  Set up your pickup and delivery locations to start tracking your parcel.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <Button 
                    onClick={() => {
                      setShowQRPopup(false);
                      // Scroll to the configuration section
                      setTimeout(() => {
                        const configSection = document.getElementById('configure-section');
                        if (configSection) {
                          configSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="w-full bg-gradient-to-r from-[#FF5823] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-xl"
                  >
                    Configure Now
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowQRPopup(false);
                      // Clear the URL parameter to go back to main site
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                    variant="outline"
                    className="w-full py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-xl border-black text-black hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mb-12 sm:mb-16 animate-slide-up px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">Get Your QR Code</h3>
                <p className="text-sm sm:text-base text-black/80 leading-relaxed">
                  Collect your Sparcel QR code and choose pick-up and delivery points from our trusted spaza shop network.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">Drop Off Your Parcel</h3>
                <p className="text-sm sm:text-base text-black/80 leading-relaxed">
                  Take your parcel to your selected registered spaza shop pick-up point.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
                  3
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">Parcel Collection & Delivery</h3>
                <p className="text-sm sm:text-base text-black/80 leading-relaxed">
                  Our delivery partners collect your parcel and ensure it reaches the chosen delivery point safely.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
                  4
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">Track & Confirm</h3>
                <p className="text-sm sm:text-base text-black/80 leading-relaxed">
                  Receive notifications and track your parcel until it's successfully delivered.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scan QR Code Section */}
        <div className="mb-10 sm:mb-16 animate-slide-up">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg border border-gray-200">
                <img src="/QR code.png" alt="QR Code" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black">Scan QR Code</h3>
              <p className="text-base sm:text-lg text-black/80 leading-relaxed px-4">
                Ready to send or receive? Set up your pickup locations.
              </p>
            </div>
          </div>
        </div>

        {/* Configure New Parcel Journey */}
        <div id="configure-section" className="animate-scale-in">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="text-center pb-8 bg-gradient-to-r from-[#FF5823] to-orange-600 text-white rounded-t-lg">
              <CardTitle className="text-4xl font-bold mb-4 text-white">
                Configure Your Parcel Journey
              </CardTitle>
              <CardDescription className="text-xl text-orange-100">
                Delivering through our trusted spaza shop network
              </CardDescription>
              {currentQRCode && (
                <div className="mt-6 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg border border-gray-200">
                      <img 
                        src="/QR code.png" 
                        alt="QR Code" 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">
                      Configuring Journey for QR Code
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Bag ID:</p>
                      <p className="text-lg sm:text-xl font-bold text-black">{currentQRCode}</p>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      ⚠️ This QR code can only be configured <strong>once</strong>. After configuration, it will show the courier dashboard.
                    </p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 md:p-10 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                {/* Parcel Size & Details Section */}
                <div className="space-y-6 md:space-y-8 bg-gray-50 p-4 md:p-8 rounded-xl md:rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF5823] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg md:text-xl">📦</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      Parcel Size & Details
                    </h3>
                  </div>
                  
                  <div>
                    <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4 md:mb-6">
                      Select Parcel Size:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                      <button
                        type="button"
                        onClick={() => {
                          setParcelSize('envelope');
                          setAutoLoadQuotes(true);
                        }}
                        className={`p-3 md:p-6 border-2 rounded-lg md:rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                          parcelSize === 'envelope'
                            ? 'border-[#FF5823] bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg ring-2 ring-orange-200'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">ENVELOPE</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setParcelSize('small');
                          setAutoLoadQuotes(true);
                        }}
                        className={`p-3 md:p-6 border-2 rounded-lg md:rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                          parcelSize === 'small'
                            ? 'border-[#FF5823] bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg ring-2 ring-orange-200'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <BoxIcon className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">SMALL</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setParcelSize('medium');
                          setAutoLoadQuotes(true);
                        }}
                        className={`p-3 md:p-6 border-2 rounded-lg md:rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                          parcelSize === 'medium'
                            ? 'border-[#FF5823] bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg ring-2 ring-orange-200'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <BoxIcon className="w-8 h-8 text-black" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">MEDIUM</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setParcelSize('large');
                          setAutoLoadQuotes(true);
                        }}
                        className={`p-3 md:p-6 border-2 rounded-lg md:rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                          parcelSize === 'large'
                            ? 'border-[#FF5823] bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg ring-2 ring-orange-200'
                            : 'border-gray-300 hover:border-gray-400 hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          <BoxIcon className="w-10 h-10 text-black" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">LARGE</span>
                      </button>
                    </div>
                    
                    {/* Parcel Size Details */}
                    {parcelSize && (
                      <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg md:rounded-xl border border-gray-300 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3 md:mb-4">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-black rounded-md md:rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs md:text-sm">📏</span>
                          </div>
                          <h4 className="text-base md:text-lg font-bold text-gray-800">
                            {parcelSize === 'envelope' && 'Envelope Specifications'}
                            {parcelSize === 'small' && 'Small Box Specifications'}
                            {parcelSize === 'medium' && 'Medium Box Specifications'}
                            {parcelSize === 'large' && 'Large Box Specifications'}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div className="bg-white p-3 md:p-4 rounded-md md:rounded-lg border border-gray-200">
                            <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Dimensions:</p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {parcelSize === 'envelope' && '25cm (L) × 15cm (W) × 2cm (H)'}
                              {parcelSize === 'small' && '30cm (L) × 20cm (W) × 10cm (H)'}
                              {parcelSize === 'medium' && '35cm (L) × 25cm (W) × 15cm (H)'}
                              {parcelSize === 'large' && '45cm (L) × 35cm (W) × 25cm (H)'}
                            </p>
                          </div>
                          <div className="bg-white p-3 md:p-4 rounded-md md:rounded-lg border border-gray-200">
                            <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Weight Limit:</p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {parcelSize === 'envelope' && '0.5kg'}
                              {parcelSize === 'small' && '5kg'}
                              {parcelSize === 'medium' && '9kg'}
                              {parcelSize === 'large' && '15kg'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                      Number of Boxes:
                    </label>
                    <div className="flex items-center space-x-4 md:space-x-6">
                      <button
                        type="button"
                        onClick={() => setNumberOfBoxes(Math.max(1, numberOfBoxes - 1))}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#FF5823] hover:bg-orange-50 transition-all duration-200 shadow-sm"
                      >
                        <span className="text-gray-600 font-bold text-base md:text-lg">-</span>
                      </button>
                      <div className="w-16 h-10 md:w-20 md:h-12 border-2 border-[#FF5823] rounded-lg md:rounded-xl flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100 shadow-md">
                        <span className="text-gray-900 font-bold text-lg md:text-xl">{numberOfBoxes}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNumberOfBoxes(Math.min(10, numberOfBoxes + 1))}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#FF5823] hover:bg-orange-50 transition-all duration-200 shadow-sm"
                      >
                        <span className="text-gray-600 font-bold text-base md:text-lg">+</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location Selection Section */}
                <div className="space-y-6 md:space-y-8 bg-gray-50 p-4 md:p-8 rounded-xl md:rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF5823] rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg md:text-xl">📍</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      Location Selection
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3 md:space-y-4">
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
                        Pickup Location
                      </label>
                      <LocationSelector
                        isOpen={isFromLocationOpen}
                        onClose={() => setIsFromLocationOpen(false)}
                        onLocationSelect={(location: ParcelLocation) => {
                          setFromLocation(location);
                          setIsFromLocationOpen(false);
                          setAutoLoadQuotes(true);
                        }}
                        title="Select Pickup Location - Search or Choose Sparcel Point"
                        placeholder="Search for any address"
                        uniqueId="pickup"
                      />
                      <Button
                        type="button"
                        onClick={() => setIsFromLocationOpen(!isFromLocationOpen)}
                        className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#FF5823] hover:bg-orange-50 py-3 md:py-4 text-sm md:text-base font-semibold rounded-lg md:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {fromLocation ? 'Change Pickup Location' : 'Select Pickup Location'}
                      </Button>
                      {fromLocation && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✅ Selected: {fromLocation.name}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            📍 {fromLocation.address}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
                        Delivery Location
                      </label>
                      <LocationSelector
                        isOpen={isToLocationOpen}
                        onClose={() => setIsToLocationOpen(false)}
                        onLocationSelect={(location: ParcelLocation) => {
                          setToLocation(location);
                          setIsToLocationOpen(false);
                          setAutoLoadQuotes(true);
                        }}
                        title="Select Delivery Location - Search or Choose Sparcel Point"
                        placeholder="Search for any address"
                        uniqueId="delivery"
                      />
                      <Button
                        type="button"
                        onClick={() => setIsToLocationOpen(!isToLocationOpen)}
                        className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#FF5823] hover:bg-orange-50 py-3 md:py-4 text-sm md:text-base font-semibold rounded-lg md:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {toLocation ? 'Change Delivery Location' : 'Select Delivery Location'}
                      </Button>
                      {toLocation && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✅ Selected: {toLocation.name}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            📍 {toLocation.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Get Quotes Section - Only show when all fields are selected */}
                {(parcelSize && fromLocation && toLocation) && (
                  <div className="space-y-6 md:space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 rounded-xl md:rounded-2xl border border-gray-300">

                  {/* Loading State */}
                  {isLoadingQuotes && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                          <p className="text-gray-600 font-medium">Loading delivery quotes...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quotes Display */}
                  {quotes.length > 0 && !isLoadingQuotes && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-medium text-gray-800">Select Your Delivery Option:</h4>
                      
                      {/* Group quotes by delivery category and show only cheapest option */}
                      {(() => {
                        const groupedQuotes = quotes.reduce((groups: { [key: string]: DropperQuote[] }, quote) => {
                          const category = quote.delivery_category || 'Standard';
                          if (!groups[category]) {
                            groups[category] = [];
                          }
                          groups[category].push(quote);
                          return groups;
                        }, {});

                        // Find cheapest option in each category
                        const cheapestByCategory: { [key: string]: DropperQuote } = {};
                        Object.keys(groupedQuotes).forEach(category => {
                          if (groupedQuotes[category].length > 0) {
                            cheapestByCategory[category] = groupedQuotes[category].reduce((cheapest, current) => 
                              current.price < cheapest.price ? current : cheapest
                            );
                          }
                        });

                        // Define category order and colors
                        const categoryOrder = ['Same Day', '1-2 Days', '3-5 Days', '7-9 Days', 'Standard'];
                        const categoryColors = {
                          'Same Day': 'bg-[#FF5823] border-[#FF5823]',
                          '1-2 Days': 'bg-[#FF5823] border-[#FF5823]',
                          '3-5 Days': 'bg-[#FF5823] border-[#FF5823]',
                          '7-9 Days': 'bg-[#FF5823] border-[#FF5823]',
                          'Standard': 'bg-[#FF5823] border-[#FF5823]'
                        };

                        return categoryOrder.map(category => {
                          if (!cheapestByCategory[category]) return null;
                          
                          const quote = cheapestByCategory[category];
                          
                          return (
                            <div key={category} className="space-y-3">
                              <div className={`p-3 rounded-lg ${categoryColors[category as keyof typeof categoryColors]} border`}>
                                <h5 className="font-semibold text-black">{category}</h5>
                              </div>
                              <div className="grid gap-3 md:gap-4 ml-4">
                                <Card 
                                  key={quote.id} 
                                  className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                    selectedQuote?.id === quote.id 
                                      ? 'border-[#FF5823] bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg ring-2 ring-orange-200' 
                                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                  }`}
                                  onClick={() => {
                                    console.log('🎯 User selected quote locally:', JSON.stringify(quote, null, 2));
                                    setLocalQuoteSelection(quote);
                                    setSelectedQuote(quote);
                                  }}
                                >
                                  <CardContent className="p-3 md:p-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                                      <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2">
                                          <div className="flex items-center space-x-2">
                                            <TruckIcon className="w-4 h-4 md:w-5 md:h-5 text-[#FF5823]" />
                                            <span className="font-semibold text-gray-900 text-sm md:text-base">{quote.service_type}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-xs md:text-sm text-gray-500">by {quote.provider}</span>
                                            {selectedQuote?.id === quote.id && (
                                              <span className="text-xs bg-[#FF5823] text-white px-2 py-1 rounded-full">SELECTED</span>
                                            )}
                                          </div>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-600 mb-1">
                                          Estimated delivery: {quote.estimated_delivery}
                                        </p>
                                      </div>
                                      <div className="text-left md:text-right">
                                        <div className="text-xl md:text-2xl font-bold text-[#FF5823]">
                                          R{quote.price.toFixed(2)}
                                        </div>
                                        <div className="text-xs md:text-sm text-gray-500">{quote.currency}</div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      
                      {selectedQuote && (
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircleIcon className="w-5 h-5 text-black" />
                            <span className="font-semibold text-black">Selected Option:</span>
                          </div>
                          <p className="text-gray-700">
                            {selectedQuote.service_type} by {selectedQuote.provider} - 
                            <span className="font-bold"> R{selectedQuote.price.toFixed(2)}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Estimated delivery: {selectedQuote.estimated_delivery}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                )}

                {/* Customer & Recipient Details Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    👤 Customer & Recipient Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3">👤 Customer Details (Sender)</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name
                        </label>
                        <Input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="input-professional"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="input-professional"
                          placeholder="Enter your phone"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="input-professional"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Number
                        </label>
                        <Input
                          type="text"
                          value={customerIdNumber}
                          onChange={(e) => setCustomerIdNumber(e.target.value)}
                          className="input-professional"
                          placeholder="Enter your ID number"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3">📧 Recipient Details (Receiver)</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Name
                        </label>
                        <Input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="input-professional"
                          placeholder="Enter recipient name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Phone
                        </label>
                        <Input
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="input-professional"
                          placeholder="Enter recipient phone"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Email
                        </label>
                        <Input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="input-professional"
                          placeholder="Enter recipient email"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="input-professional min-h-[100px] resize-none"
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                </div>


                {/* Terms and Submit */}
                <div className="space-y-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 h-4 w-4 text-[#FF5823] focus:ring-[#FF5823] border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I confirm that my parcel does not contain any <strong>prohibited items</strong> and I agree to Sparcel's <strong>terms and conditions</strong>.
                    </label>
                  </div>

                  <div className="relative">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="button-primary w-full text-lg py-4"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Creating Parcel Journey...</span>
                        </div>
                      ) : (
                        'Create Parcel Journey'
                      )}
                    </Button>
                    
                    {/* Floating Action Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute -top-16 right-0 w-14 h-14 bg-[#FF5823] hover:bg-[#FF6B35] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 