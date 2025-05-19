import React from 'react';
import { itineraries } from '../data/itineraries';
import ItineraryCard from '../components/itineraries/ItineraryCard';

const ItinerariesPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Curated Itineraries</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Perfectly planned journeys to help you experience the best of Indonesia
          </p>
        </div>
        
        <div className="space-y-10">
          {itineraries.map((itinerary) => (
            <ItineraryCard key={itinerary.id} itinerary={itinerary} />
          ))}
        </div>
        
        {/* Custom itinerary CTA */}
        <div className="mt-16 bg-teal-900 text-white rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/5 relative">
              <img 
                src="https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg" 
                alt="Customize your journey" 
                className="w-full h-64 md:h-full object-cover"
              />
              <div className="absolute inset-0 bg-teal-900/30"></div>
            </div>
            
            <div className="p-8 md:w-3/5">
              <h2 className="text-2xl font-bold mb-4">Need a Custom Itinerary?</h2>
              <p className="mb-6">
                Our travel experts can help you create a personalized journey based on your interests, 
                schedule, and budget. Get the perfect Indonesian adventure tailored just for you.
              </p>
              <button className="bg-white text-teal-800 hover:bg-teal-50 px-6 py-3 rounded-full font-medium transition-colors">
                Contact Our Travel Experts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItinerariesPage;