import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, MapPin, Clock, Star, Search, Loader2 } from 'lucide-react';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: -33.9249,
  lng: 18.4241,
};

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

interface ParcelLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
  businessHours: string;
  rating: number;
}

// Original parcel points data from ParcelMap
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

export const SparcelPoints = () => {
  const [selectedPoint, setSelectedPoint] = useState<ParcelLocation | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchMarker, setSearchMarker] = useState<google.maps.LatLng | null>(null);
  const [filteredPoints, setFilteredPoints] = useState(parcelPoints);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const searchBoxRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyAH06_iGuk1OYj73XEq7wj8f_Iw7S5iuZ0",
    libraries,
  });

  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
    };
  }, []);

  useEffect(() => {
    let filtered = parcelPoints;

    if (searchValue) {
      filtered = filtered.filter(point =>
        point.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        point.address.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredPoints(filtered);
  }, [searchValue]);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
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
    
    // Initialize the autocomplete
    if (isLoaded) {
      const input = document.getElementById('search-box') as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'za' },
        fields: ['geometry', 'formatted_address'],
      });
      
      searchBoxRef.current = autocomplete;
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const location = place.geometry.location;
          setSearchMarker(location);
          map.panTo(location);
          map.setZoom(15);
          setSearchValue(place.formatted_address || '');
        }
      });
    }
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Failed to load the map. Please try again later.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#FF5823] hover:bg-[#FF5823]/90 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF5823] mx-auto" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 md:py-6">
            <div className="flex flex-col space-y-2 md:space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center space-x-2 hover:bg-gray-100 text-gray-700 self-start"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Find Your Nearest Sparcel Point</h1>
                <p className="text-gray-600 text-base md:text-lg">Discover parcel drop-off and pickup locations across Cape Town</p>
              </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-96 bg-white/95 backdrop-blur-sm shadow-lg overflow-y-auto border-r border-orange-200">
          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative">
              <Input
                id="search-box"
                type="text"
                placeholder="Search for a location in Cape Town"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-12 bg-white border-gray-300 focus:ring-2 focus:ring-[#FF5823] focus:border-[#FF5823] rounded-xl h-12 text-gray-700 placeholder:text-gray-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                {filteredPoints.length} parcel point{filteredPoints.length !== 1 ? 's' : ''} found
              </div>
              <Badge variant="outline" className="border-gray-200 text-gray-700">
                Cape Town
              </Badge>
            </div>

            {/* Points List */}
            <div className="space-y-4">
              {filteredPoints.map((point, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border ${
                    selectedPoint?.name === point.name 
                      ? 'ring-2 ring-[#FF5823] border-[#FF5823] bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedPoint(point)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-2">{point.name}</CardTitle>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-yellow-600 fill-current" />
                            <span className="text-sm font-medium text-yellow-700">{point.rating}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            Open
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 leading-relaxed">{point.address}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{point.businessHours}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-700">
                          Parcel Drop-off
                        </Badge>
                        <Badge variant="outline" className="text-xs border-gray-200 text-gray-700">
                          Parcel Pickup
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Only visible on mobile */}
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-orange-200 p-4">
          <div className="relative">
            <Input
              id="search-box-mobile"
              type="text"
              placeholder="Search for a location in Cape Town"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-12 bg-white border-gray-300 focus:ring-2 focus:ring-[#FF5823] focus:border-[#FF5823] rounded-xl h-12 text-gray-700 placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm font-medium text-gray-700">
              {filteredPoints.length} parcel point{filteredPoints.length !== 1 ? 's' : ''} found
            </div>
            <Badge variant="outline" className="border-gray-200 text-gray-700">
              Cape Town
            </Badge>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative h-[60vh] lg:h-auto">
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '100%',
            }}
            center={center}
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
                <div className="min-w-[200px] md:min-w-[250px] p-3 md:p-4">
                  <h3 className="text-base md:text-lg font-bold text-[#FF5823] mb-2 md:mb-3">
                    {selectedPoint.name}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>{selectedPoint.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span>{selectedPoint.businessHours}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                      <span className="font-medium">{selectedPoint.rating} rating</span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          
          {/* Map Overlay Info - Hidden on mobile */}
          <div className="hidden md:block absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-900 mb-1">Map Legend</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#FF5823] rounded-full"></div>
                  <span>Sparcel Points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Search Result</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Points List - Only visible on mobile, below map */}
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-orange-200 max-h-[40vh] overflow-y-auto">
          <div className="p-4">
            <div className="space-y-3">
              {filteredPoints.map((point, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg border ${
                    selectedPoint?.name === point.name 
                      ? 'ring-2 ring-[#FF5823] border-[#FF5823] bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedPoint(point)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-bold text-gray-900 mb-1">{point.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 text-yellow-600 fill-current" />
                            <span className="text-xs font-medium text-yellow-700">{point.rating}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Open
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600 leading-relaxed">{point.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">{point.businessHours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
