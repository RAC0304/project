import React, { useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  indonesiaGeoData,
  majorCities,
  popularDestinations,
} from "../../data/indonesiaGeoData";

// Fix Leaflet default markers
const fixLeafletIcon = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

// Create custom colored div markers
const createColoredDivIcon = (color: string, symbol: string) => {
  return new L.DivIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">${symbol}</div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Create markers with different colors and symbols
const destinationIcon = createColoredDivIcon("#10b981", "★"); // Green star
const capitalIcon = createColoredDivIcon("#dc2626", "●"); // Red dot
const cityIcon = createColoredDivIcon("#2563eb", "○"); // Blue circle

interface IndonesiaMapLeafletProps {
  className?: string;
  showCities?: boolean;
  showDestinations?: boolean;
  height?: string;
}

const IndonesiaMapLeaflet: React.FC<IndonesiaMapLeafletProps> = ({
  className = "",
  showCities = true,
  showDestinations = true,
  height = "550px",
}) => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  // Fix Leaflet icon on component mount
  useEffect(() => {
    fixLeafletIcon();
  }, []);
  const getGeoJSONStyle = () => {
    return {
      fillColor: "transparent",
      weight: 0, // Set to 0 to remove borders completely
      opacity: 0, // Make borders fully transparent
      color: "transparent", // Set color to transparent
      fillOpacity: 0, // Completely transparent fill
    };
  }; // Handle region click event
  const handleRegionClick = (
    region: string,
    coordinates?: [number, number]
  ) => {
    // Navigate to destinations search for this region
    navigate(`/destinations?search=${region}`);

    // If coordinates are provided, pan map to that location
    if (coordinates && mapRef.current) {
      mapRef.current.flyTo([coordinates[1], coordinates[0]], 7, {
        animate: true,
        duration: 1.5,
      });
    }
  }; // Handle feature interactions for GeoJSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties && feature.properties.name) {
      const regionName = feature.properties.name;
      const regionDescription = feature.properties.description || "";

      // Add a popup with region information
      layer.bindTooltip(`<strong>${regionName}</strong>`, {
        permanent: false,
        direction: "center",
        className: "leaflet-tooltip-region",
      });

      // Add a popup with more detailed information
      layer.bindPopup(`
        <div class="leaflet-popup-content-custom">
          <h3 class="font-bold text-lg mb-1">${regionName}</h3>
          <p class="text-sm mb-2">${regionDescription}</p>
          ${
            feature.properties.destinations
              ? `<p class="text-xs text-gray-600">Key destinations: ${feature.properties.destinations.join(
                  ", "
                )}</p>`
              : ""
          }
          <button class="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-teal-700">
            Explore Destinations
          </button>
        </div>
      `);

      // Handle click events
      layer.on({
        click: (e) => {
          // Get center of polygon for region
          const bounds = (layer as L.Polygon).getBounds();
          const center = bounds.getCenter();
          handleRegionClick(regionName, [center.lng, center.lat]);

          // Stop propagation to prevent map click
          L.DomEvent.stopPropagation(e);
        },
      });
    }
  };

  // Reference to the GeoJSON layer for resetting styles
  const indonesiaGeoJsonRef = useRef<L.GeoJSON | null>(null);

  // Set map bounds to focus on Indonesia
  const indonesiaBounds: L.LatLngBoundsExpression = [
    [-11, 94], // Southwest corner
    [6, 142], // Northeast corner
  ];
  return (
    <div className={`indonesia-map-container relative z-10 ${className}`}>
      <div className="indonesia-map-leaflet w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow relative z-10">
        <MapContainer
          ref={mapRef}
          style={{
            height,
            width: "100%",
            borderRadius: "0.75rem",
            position: "relative",
            zIndex: 10,
          }}
          zoom={5}
          minZoom={4}
          maxZoom={10}
          zoomControl={false}
          center={[-2.5489, 118.0149]} // Center of Indonesia
          bounds={indonesiaBounds}
        >
          {/* Base map layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Custom zoom control position */}
          <ZoomControl position="bottomright" />
          {/* Indonesia GeoJSON data */}
          <GeoJSON
            ref={indonesiaGeoJsonRef}
            data={indonesiaGeoData}
            style={getGeoJSONStyle}
            onEachFeature={onEachFeature}
          />{" "}
          {/* Show major cities */}
          {showCities &&
            majorCities &&
            majorCities.length > 0 &&
            majorCities.map((city, index) => {
              const lat = city.coordinates[1];
              const lng = city.coordinates[0];

              // Validate coordinates
              if (
                isNaN(lat) ||
                isNaN(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
              ) {
                console.warn(
                  `Invalid coordinates for city ${city.name}:`,
                  city.coordinates
                );
                return null;
              }
              return (
                <Marker
                  key={`city-${city.name}-${index}`}
                  position={[lat, lng]}
                  icon={city.isCapital ? capitalIcon : cityIcon}
                  zIndexOffset={1000}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">{city.name}</h3>
                      <p className="text-sm">
                        {city.isCapital ? "Capital City" : "Major City"}
                      </p>
                      <p className="text-sm text-gray-600">{city.island}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}{" "}
          {/* Show popular destinations */}
          {showDestinations &&
            popularDestinations &&
            popularDestinations.length > 0 &&
            popularDestinations.map((dest, index) => {
              const lat = dest.coordinates[1];
              const lng = dest.coordinates[0];

              // Validate coordinates
              if (
                isNaN(lat) ||
                isNaN(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
              ) {
                console.warn(
                  `Invalid coordinates for destination ${dest.name}:`,
                  dest.coordinates
                );
                return null;
              }
              return (
                <Marker
                  key={`dest-${dest.name}-${index}`}
                  position={[lat, lng]}
                  icon={destinationIcon}
                  zIndexOffset={500}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">{dest.name}</h3>
                      <p className="text-sm">{dest.type}</p>
                      <p className="text-sm text-gray-600">{dest.island}</p>
                      <button
                        className="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-teal-700"
                        onClick={() =>
                          navigate(`/destinations?search=${dest.name}`)
                        }
                      >
                        View Details
                      </button>
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
        <p className="text-sm text-gray-600">
          Klik pada pulau atau marker untuk melihat informasi lebih lanjut
        </p>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(IndonesiaMapLeaflet);
