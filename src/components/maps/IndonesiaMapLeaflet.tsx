import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { indonesiaGeoData, majorCities, popularDestinations } from '../../data/indonesiaGeoData';

const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const capitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const cityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface IndonesiaMapLeafletProps {
  className?: string;
  showCities?: boolean;
  showDestinations?: boolean;
  height?: string;
}

const IndonesiaMapLeaflet: React.FC<IndonesiaMapLeafletProps> = ({
  className = '',
  showCities = true,
  showDestinations = true,
  height = '550px',
}) => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const [activeIsland, setActiveIsland] = useState<string | null>(null);

  useEffect(() => {
    fixLeafletIcon();
  }, []);

  const getGeoJSONStyle = (feature: any) => ({
    fillColor: 'transparent', weight: 0, opacity: 0, color: 'transparent', fillOpacity: 0,
  });

  const handleRegionClick = (region: string, coordinates?: [number, number]) => {
    setActiveIsland(region);
    navigate(`/destinations?search=${region}`);

    if (coordinates && mapRef.current) {
      mapRef.current.flyTo([coordinates[1], coordinates[0]], 7, { animate: true, duration: 1.5 });
    }
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties && feature.properties.name) {
      const regionName = feature.properties.name;
      const regionDescription = feature.properties.description || '';

      layer.bindTooltip(
        `<strong>${regionName}</strong>`,
        { permanent: false, direction: 'center', className: 'leaflet-tooltip-region' }
      );

      layer.bindPopup(`
        <div class="leaflet-popup-content-custom">
          <h3 class="font-bold text-lg mb-1">${regionName}</h3>
          <p class="text-sm mb-2">${regionDescription}</p>
          ${feature.properties.destinations ? `<p class="text-xs text-gray-600">Key destinations: ${feature.properties.destinations.join(', ')}</p>` : ''}
          <button class="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-teal-700">
            Explore Destinations
          </button>
        </div>
      `);

      layer.on({
        click: (e) => {
          const bounds = (layer as L.Polygon).getBounds();
          const center = bounds.getCenter();
          handleRegionClick(regionName, [center.lng, center.lat]);
          L.DomEvent.stopPropagation(e);
        },
      });
    }
  };

  const indonesiaBounds: L.LatLngBoundsExpression = [
    [-11, 94],
    [6, 142],
  ];

  // Styling tombol popup: bg putih, teks teal, hover shadow & border
  const popupButtonClass = `
    mt-2 inline-block
    bg-white
    text-teal-700
    px-3 py-1
    rounded
    text-xs
    font-semibold
    shadow-md
    border
    border-transparent
    hover:shadow-lg
    hover:border-teal-500
    transition
    duration-200
    ease-in-out
  `;

  return (
    <div className={`indonesia-map-container ${className}`}>
      <div className="indonesia-map-leaflet w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <MapContainer
          ref={mapRef}
          style={{ height, width: '100%', borderRadius: '0.75rem' }}
          zoom={5}
          minZoom={4}
          maxZoom={10}
          zoomControl={false}
          center={[-2.5489, 118.0149]}
          bounds={indonesiaBounds}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <GeoJSON data={indonesiaGeoData} style={getGeoJSONStyle} onEachFeature={onEachFeature} />

          {showCities && majorCities.map(city => {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.name)}`;
            return (
              <Marker
                key={`city-${city.name}`}
                position={[city.coordinates[1], city.coordinates[0]]}
                icon={city.isCapital ? capitalIcon : cityIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{city.name}</h3>
                    <p className="text-sm">{city.isCapital ? 'Capital City' : 'Major City'}</p>
                    <p className="text-sm text-gray-600">{city.island}</p>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className={popupButtonClass}>
                      View On Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {showDestinations && popularDestinations.map(dest => {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name)}`;
            return (
              <Marker
                key={`dest-${dest.name}`}
                position={[dest.coordinates[1], dest.coordinates[0]]}
                icon={destinationIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{dest.name}</h3>
                    <p className="text-sm">{dest.type}</p>
                    <p className="text-sm text-gray-600">{dest.island}</p>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className={popupButtonClass}>
                      View On Google Maps
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-2 mb-3">
          <span className="text-xs flex items-center">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            Capital City
          </span>
          <span className="text-xs flex items-center">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            Major City
          </span>
          <span className="text-xs flex items-center">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Popular Destination
          </span>
        </div>
        <p className="mb-1 font-medium">Jelajahi Indonesia dari peta</p>
        <p className="text-sm text-gray-600">Klik pada pulau atau marker untuk melihat informasi lebih lanjut</p>
      </div>
    </div>
  );
};

export default IndonesiaMapLeaflet;
