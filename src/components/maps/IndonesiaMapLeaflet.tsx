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

const fixLeafletIcon = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const capitalIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for cities
const cityIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
  }, []); // Handle GeoJSON style
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
    <div className={`indonesia-map-container ${className}`}>
      <div className="indonesia-map-leaflet w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <MapContainer
          ref={mapRef}
          style={{ height, width: "100%", borderRadius: "0.75rem" }}
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
          />

          {/* Show major cities */}
          {showCities &&
            majorCities.map((city) => (
              <Marker
                key={`city-${city.name}`}
                position={[city.coordinates[1], city.coordinates[0]]}
                icon={city.isCapital ? capitalIcon : cityIcon}
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
            ))}

          {/* Show popular destinations */}
          {showDestinations &&
            popularDestinations.map((dest) => (
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
            ))}
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
<<<<<<< Updated upstream
        <p className="mb-1 font-medium">Jelajahi Indonesia dari peta</p>
        <p className="text-sm text-gray-600">
          Klik pada pulau atau marker untuk melihat informasi lebih lanjut
        </p>{" "}
=======
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(IndonesiaMapLeaflet);
