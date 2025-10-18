import { useState, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Loader2, Search, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface ParcelLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
  businessHours: string;
  rating: number;
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: ParcelLocation) => void;
  title: string;
  placeholder: string;
  uniqueId: string;
}

const parcelPoints: ParcelLocation[] = [
  // City Center & Surrounds
  { 
    lat: -33.9249, 
    lng: 18.4241, 
    name: 'Long Street Hub',
    address: '123 Long Street, Cape Town City Centre',
    businessHours: '8AM - 9PM',
    rating: 4.5
  },
  { 
    lat: -33.9271, 
    lng: 18.4179, 
    name: 'Kloof Street Point',
    address: '89 Kloof Street, Gardens',
    businessHours: '8AM - 7PM',
    rating: 4.8
  },
  { 
    lat: -33.9257, 
    lng: 18.4178, 
    name: 'Gardens Center',
    address: '12 Queen Victoria Street, City Centre',
    businessHours: '9AM - 6PM',
    rating: 4.4
  },
  // Atlantic Seaboard
  { 
    lat: -33.9169, 
    lng: 18.4167, 
    name: 'Tamboerskloof Hub',
    address: '45 Tamboerskloof Road',
    businessHours: '8AM - 8PM',
    rating: 4.7
  },
  { 
    lat: -33.9351, 
    lng: 18.4097, 
    name: 'Sea Point Center',
    address: '156 Main Road, Sea Point',
    businessHours: '8AM - 9PM',
    rating: 4.9
  },
  {
    lat: -33.9308,
    lng: 18.4075,
    name: 'Three Anchor Bay Point',
    address: '34 Main Road, Three Anchor Bay',
    businessHours: '7AM - 8PM',
    rating: 4.6
  },
  // Southern Suburbs
  {
    lat: -33.9764,
    lng: 18.4661,
    name: 'Observatory Store',
    address: '185 Lower Main Road, Observatory',
    businessHours: '8AM - 8PM',
    rating: 4.7
  },
  {
    lat: -33.9806,
    lng: 18.4679,
    name: 'Salt River Hub',
    address: '73 Albert Road, Salt River',
    businessHours: '7AM - 7PM',
    rating: 4.5
  },
  // Woodstock Area
  { 
    lat: -33.9278, 
    lng: 18.4378, 
    name: 'Woodstock Point',
    address: '78 Albert Road, Woodstock',
    businessHours: '7AM - 7PM',
    rating: 4.6
  },
  {
    lat: -33.9265,
    lng: 18.4397,
    name: 'Woodstock Exchange',
    address: '66 Albert Road, Woodstock',
    businessHours: '8AM - 6PM',
    rating: 4.8
  },
  // Table View Area
  {
    lat: -33.8213,
    lng: 18.4897,
    name: 'Table View Center',
    address: '123 Marine Drive, Table View',
    businessHours: '8AM - 8PM',
    rating: 4.7
  },
  {
    lat: -33.8156,
    lng: 18.4951,
    name: 'Blouberg Point',
    address: '45 Marine Circle, Blouberg',
    businessHours: '7AM - 9PM',
    rating: 4.9
  },
  // Century City Area
  {
    lat: -33.8913,
    lng: 18.5129,
    name: 'Century City Hub',
    address: '12 Century Boulevard, Century City',
    businessHours: '9AM - 7PM',
    rating: 4.8
  },
  {
    lat: -33.8896,
    lng: 18.5153,
    name: 'Canal Walk Point',
    address: 'Canal Walk Shopping Centre',
    businessHours: '9AM - 9PM',
    rating: 4.7
  },
  // Claremont/Newlands Area
  {
    lat: -33.9847,
    lng: 18.4695,
    name: 'Claremont Center',
    address: '23 Main Road, Claremont',
    businessHours: '8AM - 8PM',
    rating: 4.6
  }
];

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

export function LocationSelector({ isOpen, onClose, onLocationSelect, title, placeholder, uniqueId }: LocationSelectorProps) {
  const [selectedPoint, setSelectedPoint] = useState<ParcelLocation | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchMarker, setSearchMarker] = useState<google.maps.LatLng | null>(null);
  const [nearbyPoints, setNearbyPoints] = useState<ParcelLocation[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputId = useRef(`search-box-${uniqueId}`);
  
  // Default center for Cape Town
  const defaultCenter = { lat: -33.9249, lng: 18.4241 };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAH06_iGuk1OYj73XEq7wj8f_Iw7S5iuZ0",
    libraries: ["places"],
  });

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter nearby points based on search location
  const getNearbyPoints = (searchLat: number, searchLng: number, maxDistance: number = 50): ParcelLocation[] => {
    return parcelPoints
      .map(point => ({
        ...point,
        distance: calculateDistance(searchLat, searchLng, point.lat, point.lng)
      }))
      .filter(point => point.distance <= maxDistance)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  if (loadError) {
    console.error('Google Maps load error:', loadError);
  }

  if (!isLoaded) {
    console.log('Google Maps still loading...');
  }

  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, []);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Initially show all points (Cape Town area)
    const initialNearbyPoints = getNearbyPoints(defaultCenter.lat, defaultCenter.lng, 100);
    setNearbyPoints(initialNearbyPoints);
    
    // Create markers with custom Marker.png image
    const markers = parcelPoints.map((point) => {
      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        icon: {
          url: '/Marker.png',
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 35), // Anchor slightly above bottom for better upright positioning
        },
        title: point.name,
      });

      marker.addListener('click', () => {
        setSelectedPoint(point);
      });

      return marker;
    });

    markersRef.current = markers;

    // Initialize MarkerClusterer with custom cluster icon
    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }) => {
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 28,
              fillColor: '#FF5823',
              fillOpacity: 0.95,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            label: {
              text: String(count),
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          });
        },
      },
    });

    clustererRef.current = clusterer;

    // Initialize the autocomplete - EXACTLY like ParcelMap
    if (isLoaded) {
      const input = document.getElementById(inputId.current) as HTMLInputElement;
      if (input) {
        console.log('Initializing Google Places Autocomplete for:', inputId.current);
        const autocomplete = new google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: 'za' },
          fields: ['geometry', 'formatted_address'],
        });
        
        searchBoxRef.current = autocomplete;
        
        autocomplete.addListener('place_changed', () => {
          console.log('Place changed event triggered');
          const place = autocomplete.getPlace();
          console.log('Selected place:', place);
          if (place.geometry?.location) {
            const location = place.geometry.location;
            const searchLat = location.lat();
            const searchLng = location.lng();
            
            setSearchMarker(location);
            
            // Ensure map centers on the searched location
            if (mapRef.current) {
              mapRef.current.panTo(location);
              mapRef.current.setZoom(15);
              
              // Force a map update
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.panTo(location);
                }
              }, 100);
            }
            
            setSearchValue(place.formatted_address || '');
            
            // Get nearby points for the searched location
            const nearbyPointsForLocation = getNearbyPoints(searchLat, searchLng, 50);
            setNearbyPoints(nearbyPointsForLocation);
            
            // Create a custom location object
            const customLocation = {
              lat: searchLat,
              lng: searchLng,
              name: 'Custom Location',
              address: place.formatted_address || 'Custom Address',
              businessHours: 'Custom Hours',
              rating: 0
            };
            
            setSelectedPoint(customLocation);
          }
        });
        
        console.log('Google Places Autocomplete initialized successfully');
      } else {
        console.error('Input element not found:', inputId.current);
      }
    }
  };



  // Clean up autocomplete when component unmounts
  useEffect(() => {
    return () => {
      if (searchBoxRef.current) {
        google.maps.event.clearInstanceListeners(searchBoxRef.current);
        searchBoxRef.current = null;
      }
    };
  }, []);

  // Reset search value when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchValue('');
      setSearchMarker(null);
      setSelectedPoint(null);
    }
  }, [isOpen]);

  const handleLocationSelect = () => {
    if (selectedPoint) {
      onLocationSelect(selectedPoint);
      onClose();
      setSelectedPoint(null);
      setSearchValue('');
      setSearchMarker(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedPoint(null);
    setSearchValue('');
    setSearchMarker(null);
  };

  if (loadError) {
    return (
      <>
        {isOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-200"
              >
                ✕
              </Button>
            </div>
            <div className="flex items-center justify-center h-[400px] bg-white rounded-lg border border-gray-200">
              <div className="text-center space-y-4">
                <p className="text-gray-700">Failed to load the map. Please try again later.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[#FF5823] hover:bg-[#FF5823]/90 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!isLoaded) {
    return (
      <>
        {isOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-200"
              >
                ✕
              </Button>
            </div>
            <div className="flex items-center justify-center h-[400px] bg-white rounded-lg border border-gray-200">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF5823] mx-auto" />
                <p className="text-gray-700">Loading map...</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Google Places Autocomplete Styles */}
      <style>{`
        .pac-container {
          z-index: 9999 !important;
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        .pac-item {
          padding: 12px 16px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
        }
        .pac-item:hover {
          background-color: #f9fafb !important;
        }
        .pac-item-selected {
          background-color: #f3f4f6 !important;
        }
        .pac-matched {
          font-weight: 600 !important;
          color: #1f2937 !important;
        }
        .pac-item-query {
          font-weight: 600 !important;
          color: #1f2937 !important;
        }
        .pac-item-query:first-letter {
          text-transform: uppercase !important;
        }
      `}</style>
      
      {isOpen && (
        <div className="mt-4 p-6 bg-white rounded-xl shadow-xl border border-gray-200 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Search Box */}
            <div className="relative">
              <input
                id={inputId.current}
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5823] focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              
              <Button
                onClick={() => {
                  if (searchValue.trim()) {
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ address: searchValue }, (results, status) => {
                      if (status === 'OK' && results && results[0]) {
                        const location = results[0].geometry.location;
                        setSearchMarker(location);
                        if (mapRef.current) {
                          mapRef.current.panTo(location);
                          mapRef.current.setZoom(15);
                        }
                      }
                    });
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#FF5823] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF7A47] text-white text-xs px-3 py-2 h-8 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Search
              </Button>
              
              {/* Google Places Autocomplete Suggestions */}
              {/* The Google Places Autocomplete widget handles suggestions automatically */}
              {/* We just need to style the input to show the suggestions properly */}
            </div>
            
            {/* Map Container */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 text-[#FF5823]" />
                  <span className="font-medium">Interactive Map</span>
                </div>
                <p className="text-xs text-gray-500">
                  Search for an address above or click on the map to select a location
                </p>
              </div>
              
              {!isLoaded ? (
                <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                </div>
              ) : loadError ? (
                <div className="h-[400px] bg-red-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading map</p>
                    <p className="text-red-500 text-sm">Failed to load Google Maps</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <GoogleMap
                    mapContainerClassName="w-full h-[400px] rounded-lg shadow-lg"
                    center={defaultCenter}
                    zoom={12}
                    options={mapOptions}
                    onLoad={onMapLoad}
                  >
                    {/* Search Marker */}
                    {searchMarker && (
                      <Marker
                        position={searchMarker}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 12,
                          fillColor: '#FF5823',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 3,
                        }}
                        title="Selected Location"
                      />
                    )}
                  </GoogleMap>
                  
                  {/* Map Controls Overlay */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
                    <div className="text-xs text-gray-600 text-center">
                      <div className="w-3 h-3 bg-[#FF5823] rounded-full mx-auto mb-1"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sparcel Points Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                🏪 Nearby Sparcel Points
              </h4>
              <div className="grid gap-3 max-h-48 overflow-y-auto">
                {nearbyPoints.length > 0 ? (
                  nearbyPoints.map((point) => (
                  <div
                    key={`${point.lat}-${point.lng}`}
                    onClick={() => onLocationSelect(point)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 border border-gray-200 hover:border-[#FF5823] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">{point.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{point.address}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>🕒 {point.businessHours}</span>
                          <span className="flex items-center gap-1">
                            ⭐ {point.rating}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#FF5823] hover:bg-[#FF6B35] text-white text-xs px-3 py-1 h-7"
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h5 className="text-gray-600 font-medium mb-1">No Sparcel Points Nearby</h5>
                    <p className="text-sm text-gray-500">
                      No Sparcel points found within 50km of this location. You can still use this as a custom pickup/delivery point.
                    </p>
                  </div>
                )}
               </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (searchMarker) {
                    // Create a location object from the search marker
                    const location: ParcelLocation = {
                      lat: searchMarker.lat(),
                      lng: searchMarker.lng(),
                      name: 'Custom Location',
                      address: searchValue || 'Selected Location',
                      businessHours: '24/7',
                      rating: 5.0
                    };
                    onLocationSelect(location);
                  }
                }}
                disabled={!searchMarker}
                className="flex-1 bg-gradient-to-r from-[#FF5823] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF7A47] text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Use Selected Location
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 