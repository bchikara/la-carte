// Restaurant Map Component with Google Maps
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '../../types/restaurant.types';
import './RestaurantMap.scss';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 23.5937, // Center of India
  lng: 78.9629
};

const RestaurantMap: React.FC<RestaurantMapProps> = ({
  restaurants,
  center = defaultCenter,
  zoom = 5
}) => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  // Use hook instead of component to prevent multiple loads
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    const infoWindowInstance = new google.maps.InfoWindow({
      disableAutoPan: false,
      maxWidth: 350,
      pixelOffset: new google.maps.Size(0, 0)
    });
    setInfoWindow(infoWindowInstance);
  }, []);

  const onUnmount = useCallback(() => {
    // Clear all markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    setMap(null);
    setInfoWindow(null);
  }, [markers]);

  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleOrderFood = (restaurantId: string) => {
    navigate(`/menu/${restaurantId}`);
  };

  const handleGetDirections = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  // Create markers using native Google Maps API
  useEffect(() => {
    if (!map || !restaurants || restaurants.length === 0) return;

    console.log('Creating markers for', restaurants.length, 'restaurants');

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = restaurants
      .filter(restaurant => restaurant.coordinates)
      .map(restaurant => {
        const marker = new google.maps.Marker({
          position: {
            lat: restaurant.coordinates!.lat,
            lng: restaurant.coordinates!.lng
          },
          map: map,
          title: restaurant.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#e08f00',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedRestaurant(restaurant);

          if (infoWindow) {
            const contentString = `
              <div style="position: relative; width: 320px; max-width: 90vw; font-family: 'Google Sans', 'Roboto', sans-serif; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">

                <!-- Close Button -->
                <button
                  id="custom-info-close-btn"
                  class="custom-info-close"
                  style="position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; border-radius: 50%; background: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.25); transition: all 0.2s;"
                  onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.35)'"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 3px 10px rgba(0,0,0,0.25)'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <!-- Restaurant Image -->
                ${restaurant.imageUrl ? `
                  <div style="width: 100%; height: 180px; overflow: hidden;">
                    <img src="${restaurant.imageUrl}" alt="${restaurant.name}" style="width: 100%; height: 100%; object-fit: cover;"/>
                  </div>
                ` : ''}

                <!-- Restaurant Details -->
                <div style="padding: 1.5rem; background: white;">
                  <h3 style="color: #e08f00; font-size: 1.4rem; margin: 0 0 1rem 0; font-weight: 600; line-height: 1.3;">${restaurant.name}</h3>

                  <!-- Location -->
                  <div style="display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.6rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e08f00" style="flex-shrink: 0; margin-top: 2px;">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <div style="flex: 1;">
                      <p style="margin: 0; font-size: 0.95rem; color: #333; font-weight: 600;">${restaurant.location}</p>
                      ${restaurant.address ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #666; line-height: 1.5;">${restaurant.address}</p>` : ''}
                    </div>
                  </div>

                  <!-- Cuisine -->
                  ${restaurant.cuisineType && restaurant.cuisineType.length > 0 ? `
                    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#888" style="flex-shrink: 0;">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                      </svg>
                      <span style="font-size: 0.9rem; color: #666; font-weight: 500;">${restaurant.cuisineType.join(', ')}</span>
                    </div>
                  ` : ''}

                  <!-- Action Buttons -->
                  <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
                    <button
                      onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${restaurant.coordinates!.lat},${restaurant.coordinates!.lng}', '_blank')"
                      style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1.25rem; background: #ffffff; color: #e08f00; border: 2.5px solid #e08f00; border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; font-family: inherit;"
                      onmouseover="this.style.background='#fff8f0'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(224, 143, 0, 0.2)'"
                      onmouseout="this.style.background='#ffffff'; this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                        <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"></path>
                      </svg>
                      Directions
                    </button>

                    <button
                      onclick="window.location.href='/menu/${restaurant.id || restaurant.key}'"
                      style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1.25rem; background: linear-gradient(135deg, #ffbc36 0%, #e08f00 100%); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 12px rgba(224, 143, 0, 0.35); transition: all 0.2s; font-family: inherit;"
                      onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(224, 143, 0, 0.45)'"
                      onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(224, 143, 0, 0.35)'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                        <path d="M7 2v20"></path>
                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                      </svg>
                      Order Food
                    </button>
                  </div>
                </div>
              </div>
            `;

            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);

            // Add click listener to close button and inject styles after info window is opened
            google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
              // Inject styles directly into the Google Maps iframe
              const iwOuter = document.querySelector('.gm-style-iw');
              if (iwOuter) {
                // Find and style all the problematic elements
                const iwContainer = iwOuter.closest('.gm-style-iw-c');
                const iwContentWrapper = document.querySelector('.gm-style-iw-d');
                const iwScrollbar = document.querySelector('.gm-style-iw-chr');

                // Style the outer container
                (iwOuter as HTMLElement).style.overflow = 'visible';
                (iwOuter as HTMLElement).style.maxHeight = 'none';
                (iwOuter as HTMLElement).style.height = 'auto';

                if (iwContainer) {
                  (iwContainer as HTMLElement).style.paddingLeft = '0';
                  (iwContainer as HTMLElement).style.padding = '0';
                  (iwContainer as HTMLElement).style.background = 'transparent';
                  (iwContainer as HTMLElement).style.boxShadow = 'none';
                  (iwContainer as HTMLElement).style.border = 'none';
                  (iwContainer as HTMLElement).style.overflow = 'visible';
                  (iwContainer as HTMLElement).style.maxHeight = 'none';
                  (iwContainer as HTMLElement).style.height = 'auto';
                }

                if (iwContentWrapper) {
                  (iwContentWrapper as HTMLElement).style.overflow = 'visible !important';
                  (iwContentWrapper as HTMLElement).style.overflowY = 'visible';
                  (iwContentWrapper as HTMLElement).style.overflowX = 'visible';
                  (iwContentWrapper as HTMLElement).style.maxHeight = 'none';
                  (iwContentWrapper as HTMLElement).style.height = 'auto';
                  (iwContentWrapper as HTMLElement).style.padding = '0';
                }

                if (iwScrollbar) {
                  (iwScrollbar as HTMLElement).style.display = 'none';
                }

                // Hide only Google Maps default close buttons (not our content buttons)
                // Google's default close button is a direct child/sibling, not inside our content
                const gmDefaultCloseButtons = document.querySelectorAll('.gm-ui-hover-effect, .gm-style-iw + button, .gm-style-iw-c > button:not(.custom-info-close), button[aria-label="Close"]');
                gmDefaultCloseButtons.forEach(btn => {
                  if (btn && !btn.classList.contains('custom-info-close')) {
                    (btn as HTMLElement).style.display = 'none';
                    (btn as HTMLElement).style.visibility = 'hidden';
                    (btn as HTMLElement).style.opacity = '0';
                    (btn as HTMLElement).style.pointerEvents = 'none';
                  }
                });
              }

              // Add click listener to our custom close button
              const closeButton = document.getElementById('custom-info-close-btn');
              if (closeButton) {
                closeButton.addEventListener('click', () => {
                  infoWindow.close();
                });
              }
            });
          }
        });

        console.log('Created marker for:', restaurant.name);
        return marker;
      });

    setMarkers(newMarkers);
    console.log('Total markers created:', newMarkers.length);

  }, [map, restaurants, infoWindow]);

  // Debug: Log restaurants data
  useEffect(() => {
    console.log('Restaurants in map:', restaurants?.length || 0);
    console.log('Restaurants with coordinates:', restaurants?.filter(r => r.coordinates).length || 0);
  }, [restaurants]);

  // Check for API key
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="map-error">
        <h3>⚠️ Google Maps API Key Required</h3>
        <p>Please add your Google Maps API key to the .env file:</p>
        <code>REACT_APP_GOOGLE_MAPS_API_KEY="your_api_key_here"</code>
        <p>Get your API key from: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></p>
      </div>
    );
  }

  // Check for load error
  if (loadError) {
    return (
      <div className="map-error">
        <h3>⚠️ Error Loading Map</h3>
        <p>Failed to load Google Maps. Please check your API key and internet connection.</p>
        <p>Error: {loadError.message}</p>
      </div>
    );
  }

  // Check if script is loading
  if (!isLoaded) {
    return (
      <div className="map-error">
        <h3>🗺️ Loading Map...</h3>
        <p>Please wait while we load Google Maps.</p>
      </div>
    );
  }

  // Check for restaurants - only show loading message
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="map-error">
        <p>Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Markers are created programmatically in useEffect */}
      </GoogleMap>
    </div>
  );
};

export default RestaurantMap;
