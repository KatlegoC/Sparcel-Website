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

export function LocationSelector({ isOpen, onClose, onLocationSelect, title, placeholder }: LocationSelectorProps) {
  const [selectedPoint, setSelectedPoint] = useState<ParcelLocation | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchMarker, setSearchMarker] = useState<google.maps.LatLng | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAH06_iGuk1OYj73XEq7wj8f_Iw7S5iuZ0",
    libraries: ["places"],
  });

  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, []);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Create markers
    const markers = parcelPoints.map((point) => {
      const marker = new google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FF5823',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: point.name,
      });

      marker.addListener('click', () => {
        setSelectedPoint(point);
      });

      return marker;
    });

    markersRef.current = markers;

    // Initialize MarkerClusterer
    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: {
        render: ({ count, position }) => {
          return new google.maps.Marker({
            position,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#FF5823',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            label: {
              text: String(count),
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
            },
          });
        },
      },
    });

    clustererRef.current = clusterer;
  };

  // Initialize Google Places Autocomplete when component mounts
  useEffect(() => {
    if (isLoaded && searchBoxRef.current === null) {
      const input = document.getElementById('search-box') as HTMLInputElement;
      if (input) {
        const autocomplete = new google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: 'za' },
          fields: ['geometry', 'formatted_address'],
          types: ['address', 'establishment', 'geocode']
        });
        
        searchBoxRef.current = autocomplete;
        
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const location = place.geometry.location;
            setSearchMarker(location);
            if (mapRef.current) {
              mapRef.current.panTo(location);
              mapRef.current.setZoom(15);
            }
            setSearchValue(place.formatted_address || '');
          }
        });
      }
    }
  }, [isLoaded]);

  // Initialize autocomplete when dialog opens
  useEffect(() => {
    if (isOpen && isLoaded) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        const input = document.getElementById('search-box') as HTMLInputElement;
        if (input && !searchBoxRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(input, {
            componentRestrictions: { country: 'za' },
            fields: ['geometry', 'formatted_address'],
            types: ['address', 'establishment', 'geocode']
          });
          
          searchBoxRef.current = autocomplete;
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
              const location = place.geometry.location;
              setSearchMarker(location);
              if (mapRef.current) {
                mapRef.current.panTo(location);
                mapRef.current.setZoom(15);
              }
              setSearchValue(place.formatted_address || '');
            }
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoaded]);

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
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl p-0 gap-0 bg-[#FF5823]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 pb-6">
            <div className="flex items-center justify-center h-[500px] bg-white/10 rounded-lg">
              <div className="text-center space-y-4">
                <p className="text-white">Failed to load the map. Please try again later.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-white hover:bg-white/90 text-[#FF5823]"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl p-0 gap-0 bg-[#FF5823]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 pb-6">
            <div className="flex items-center justify-center h-[500px] bg-white/10 rounded-lg">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
                <p className="text-white">Loading map...</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl p-0 gap-0 bg-[#FF5823]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2 pb-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                key={`search-${isOpen}`}
                id="search-box"
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-24 bg-white/10 text-white placeholder:text-white/70 border-white/20 focus:bg-white/20 focus:border-white/40"
                autoComplete="off"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    // Trigger search manually if needed
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
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
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
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 h-7"
              >
                Search
              </Button>
            </div>
            
            <GoogleMap
              mapContainerClassName="h-[500px] w-full rounded-lg"
              center={{ lat: -33.9249, lng: 18.4241 }}
              zoom={11}
              options={mapOptions}
              onLoad={onMapLoad}
            >
              {searchMarker && (
                <Marker
                  position={searchMarker}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4A90E2',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                  animation={google.maps.Animation.DROP}
                />
              )}

              {selectedPoint && (
                <InfoWindow
                  position={{ lat: selectedPoint.lat, lng: selectedPoint.lng }}
                  onCloseClick={() => setSelectedPoint(null)}
                >
                  <div className="min-w-[200px] p-3">
                    <h3 className="text-base font-bold text-[#FF5823] mb-2">
                      {selectedPoint.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📍 {selectedPoint.address}</p>
                      <p>🕒 {selectedPoint.businessHours}</p>
                      <p>⭐ {selectedPoint.rating}</p>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>

            {selectedPoint && (
              <div className="flex justify-between items-center bg-white/10 rounded-lg p-4">
                <div className="text-white">
                  <p className="font-semibold">Selected: {selectedPoint.name}</p>
                  <p className="text-sm opacity-90">{selectedPoint.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLocationSelect}
                    className="bg-white hover:bg-white/90 text-[#FF5823]"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Select This Location
                  </Button>
                  <Button
                    onClick={() => setSelectedPoint(null)}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 