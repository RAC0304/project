import React, { useState, useRef, useEffect, memo } from "react";
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

import { indonesiaGeoData } from "../../data/indonesiaGeoData";
import { Destination } from "../../types";

// Fix for Leaflet marker icons not displaying properly in production builds
// This needs to be done once before using any markers
const fixLeafletIcon = () => {
  // TypeScript doesn't know about _getIconUrl but it exists in Leaflet
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
    ._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

// Custom icon for destinations
const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for highlighted (filtered) destinations
const highlightedDestinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [30, 45], // Slightly larger to stand out
  iconAnchor: [15, 45],
  popupAnchor: [1, -40],
  shadowSize: [41, 41],
});

// Component props interface
interface IndonesiaMapLeafletProps {
  className?: string;
  height?: string;
  destinations?: Destination[];
  filteredIds?: string[];
}

// Function to get approximate coordinates based on location name
// In a real app, you would use a geocoding service
const getDestinationCoordinates = (location: string): [number, number] => {
  // This is a very basic mapping for demo purposes
  // In production, you should use a geocoding service
  const locationMap: Record<string, [number, number]> = {
    "Bali, Indonesia": [-8.3405, 115.092],
    "Jakarta, Indonesia": [-6.2088, 106.8456],
    "Lombok, Indonesia": [-8.65, 116.3252],
    "Yogyakarta, Indonesia": [-7.7956, 110.3695],
    Yogyakarta: [-7.7956, 110.3695],
    "Central Java, Indonesia": [-7.7956, 110.3695],
    "Bandung, Indonesia": [-6.9175, 107.6191],
    "Raja Ampat, Indonesia": [-0.5, 130.5],
    "Komodo, Indonesia": [-8.55, 119.4547],
    "East Nusa Tenggara, Indonesia": [-8.5831, 119.4861], // Komodo National Park main island
    "Tana Toraja, Indonesia": [-3.0026, 119.8526],
    "Borobudur, Indonesia": [-7.6079, 110.2038],
    "Bromo, Indonesia": [-7.9425, 112.953],
    "Sumatra, Indonesia": [0.0, 101.0],
    "Sulawesi, Indonesia": [0.0, 121.0],
    "Papua, Indonesia": [-4.0, 138.0],
    "Kalimantan, Indonesia": [0.0, 115.0],
    "Flores, Indonesia": [-8.6573, 121.0794],
  };

  // Try to find exact match first
  if (locationMap[location]) {
    return locationMap[location];
  }

  // Try to match by beginning of string
  for (const [key, value] of Object.entries(locationMap)) {
    if (location.includes(key.split(",")[0])) {
      return value;
    }
  }

  // Default to center of Indonesia if no match found
  return [-2.5489, 118.0149];
};

// Main component
const IndonesiaMapLeaflet: React.FC<IndonesiaMapLeafletProps> = ({
  className = "",
  height = "550px",
  destinations = [],
  filteredIds = [],
}) => {
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  // Tracks currently selected region for UI highlighting and navigation
  const [activeIsland, setActiveIsland] = useState<string | null>(null);

  // Fix Leaflet icon on component mount
  useEffect(() => {
    // Initialize Leaflet icon
    fixLeafletIcon();

    // Return cleanup function (no need to access ref in cleanup)
    return () => {
      // Cleanup code if needed in the future
    };
  }, []);

  // Handle GeoJSON style
  const getGeoJSONStyle = (feature?: GeoJSON.Feature) => {
    if (!feature || !feature.properties || !feature.properties.name) {
      return {
        fillColor: "transparent",
        weight: 0,
        opacity: 0,
        color: "transparent",
        fillOpacity: 0,
      };
    }

    const isActive = feature.properties.name === activeIsland;

    return {
      fillColor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
      weight: isActive ? 1 : 0,
      opacity: isActive ? 0.8 : 0,
      color: isActive ? "#0ea5e9" : "transparent",
      fillOpacity: isActive ? 0.2 : 0,
    };
  };

  // Check if destination is highlighted (filtered)
  const isDestinationHighlighted = (destId: string): boolean => {
    return filteredIds.includes(destId);
  };

  // Handle region click event
  const handleRegionClick = (
    region: string,
    coordinates?: [number, number]
  ) => {
    // Set active island
    setActiveIsland(region);

    // Navigate to destinations search for this region
    navigate(`/destinations?search=${region}`);

    // If coordinates are provided, pan map to that location
    if (coordinates && mapRef.current) {
      mapRef.current.flyTo([coordinates[1], coordinates[0]], 7, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  // Handle feature interactions for GeoJSON
  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    if (feature.properties) {
      const regionName = feature.properties.name as string;
      const regionDescription =
        (feature.properties.description as string) || "";

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
            Jelajahi Destinasi
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

          {/* Show all destinations with appropriate highlighting */}
          {destinations.map((dest) => (
            <Marker
              key={`dest-${dest.id}`}
              position={getDestinationCoordinates(dest.location)}
              icon={
                isDestinationHighlighted(dest.id)
                  ? highlightedDestinationIcon
                  : destinationIcon
              }
              // If we have filter active and this isn't in filter, reduce opacity
              opacity={
                filteredIds.length === 0 || isDestinationHighlighted(dest.id)
                  ? 1
                  : 0.5
              }
              zIndexOffset={isDestinationHighlighted(dest.id) ? 1000 : 0} // Bring highlighted markers to front
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{dest.name}</h3>
                  <p className="text-sm">{dest.shortDescription}</p>
                  <p className="text-sm text-gray-600">{dest.location}</p>
                  <button
                    className="mt-2 bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-teal-700"
                    onClick={() =>
                      navigate(`/destinations?search=${dest.name}`)
                    }
                  >
                    Lihat Detail
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-2 mb-3">
          {filteredIds.length > 0 ? (
            <>
              <span className="text-xs flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Semua Destinasi
              </span>
              <span className="text-xs flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                Destinasi Terfilter ({filteredIds.length})
              </span>
            </>
          ) : (
            <span className="text-xs flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              Destinasi Wisata ({destinations.length})
            </span>
          )}
        </div>
        <p className="mb-1 font-medium">Jelajahi Indonesia dari peta</p>
        <p className="text-sm text-gray-600">
          Klik pada marker untuk melihat detail destinasi
        </p>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(IndonesiaMapLeaflet);
