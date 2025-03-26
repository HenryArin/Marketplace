import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapComponent.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ listings, onSelectListing }) => {
  const [mapCenter, setMapCenter] = useState([35.5951, -119.3405]); // Default to Wasco, CA
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!listings || listings.length === 0) {
      setIsLoading(false);
      return;
    }

    const geocodeLocations = async () => {
      try {
        const listingsWithCoords = await Promise.all(
          listings.map(async (listing) => {
            if (!listing.location) return { ...listing, coordinates: null };

            try {
              // Use Nominatim for geocoding
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.location)}`
              );
              const data = await response.json();

              if (data && data.length > 0) {
                return {
                  ...listing,
                  coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
                };
              } else {
                return { ...listing, coordinates: null };
              }
            } catch (error) {
              console.error('Error geocoding location:', error);
              return { ...listing, coordinates: null };
            }
          })
        );

        // Filter out listings without coordinates
        const validLocations = listingsWithCoords.filter(
          (listing) => listing.coordinates !== null
        );

        setLocations(validLocations);

        // If there are valid locations, center the map on the first one
        if (validLocations.length > 0) {
          setMapCenter(validLocations[0].coordinates);
        }
      } catch (error) {
        console.error('Error processing locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    geocodeLocations();
  }, [listings]);

  if (isLoading) {
    return <div className="loading-map">Loading map...</div>;
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={mapCenter}
        zoom={10}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((listing) => (
          <Marker
            key={listing.listingID}
            position={listing.coordinates}
            eventHandlers={{
              click: () => {
                if (onSelectListing) onSelectListing(listing);
              },
            }}
          >
            <Popup>
              <div className="map-popup">
                <h3>{listing.title}</h3>
                <p className="map-popup-price">${listing.price}</p>
                <p className="map-popup-category">{listing.category}</p>
                {listing.images && listing.images.length > 0 && (
                  <img
                    src={`http://localhost:8000/img/listings/${listing.images[0]}`}
                    alt={listing.title}
                    className="map-popup-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjMjEyNTI5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                )}
                <button
                  className="map-popup-button"
                  onClick={() => {
                    if (onSelectListing) onSelectListing(listing);
                  }}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 