import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import IndonesiaMapLeaflet from "../components/maps/IndonesiaMapLeaflet";

const MapDemoPage: React.FC = () => {
  const [showCities, setShowCities] = useState(true);
  const [showDestinations, setShowDestinations] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Indonesia Interactive Map
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore the Indonesian archipelago in detail with our interactive map.
          Discover islands, cities, and popular destinations.
        </p>
      </section>

      {/* Map controls */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${showCities ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            onClick={() => setShowCities(!showCities)}
          >
            {showCities ? "Hide Cities" : "Show Cities"}
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${showDestinations ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            onClick={() => setShowDestinations(!showDestinations)}
          >
            {showDestinations ? "Hide Destinations" : "Show Destinations"}
          </button>
        </div>

        <button
          className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-medium"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info size={16} />
          {showInfo ? "Hide Information" : "How to Use This Map"}
          {showInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Information panel */}
      {showInfo && (
        <div className="max-w-6xl mx-auto mb-6 bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-800">
          <h3 className="font-bold mb-2">Using the Interactive Map</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Click on any island to explore destinations in that region</li>
            <li>Use the zoom controls (bottom right) to zoom in and out</li>
            <li>Click and drag to move around the map</li>
            <li>Click on markers to see information about cities and destinations</li>
            <li>Use the buttons above to show or hide cities and destinations</li>
          </ul>
        </div>
      )}

      {/* The interactive map */}
      <div className="max-w-6xl mx-auto">
        <IndonesiaMapLeaflet
          showCities={showCities}
          showDestinations={showDestinations}
          className="mb-8"
          height="600px"
        />
      </div>

      {/* Additional information about Indonesia */}
      <div className="max-w-4xl mx-auto mt-12 text-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">About Indonesia</h2>
        <p className="mb-4">
          Indonesia is the world's largest archipelagic country, consisting of more than 17,000 islands.
          The main islands include Sumatra, Java, Kalimantan (Borneo), Sulawesi, and Papua, with many
          smaller island groups like Bali, Lombok, Flores, and the Maluku Islands.
        </p>
        <p className="mb-4">
          With over 270 million people, Indonesia is the world's fourth most populous country and
          the most populous Muslim-majority nation. It is rich in cultural diversity, with hundreds of
          ethnic groups, languages, and traditions.
        </p>
        <p>
          The country offers incredible tourism experiences, from beautiful beaches and volcanic
          landscapes to ancient temples and vibrant cities. Use the interactive map above to explore
          Indonesia's diverse regions and plan your next adventure!
        </p>
      </div>
    </div>
  );
};

export default MapDemoPage;
