import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { getDestinationById } from '../data/destinations';
import NotFoundPage from './NotFoundPage';

const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const destination = id ? getDestinationById(id) : undefined;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  
  useEffect(() => {
    // Reset active image when destination changes
    setActiveImageIndex(0);
    
    // Scroll to top when destination changes
    window.scrollTo(0, 0);
  }, [id]);
  
  if (!destination) {
    return <NotFoundPage />;
  }
  
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'activities', label: 'Activities' },
    { id: 'tips', label: 'Travel Tips' }
  ];
  
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % destination.images.length);
  };
  
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + destination.images.length) % destination.images.length);
  };
  
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <div className="relative h-[50vh]">
        <div className="absolute inset-0">
          <img 
            src={destination.images[activeImageIndex]} 
            alt={destination.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        </div>
        
        {/* Image navigation */}
        <button 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          onClick={prevImage}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          onClick={nextImage}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
          {destination.images.map((_, index) => (
            <button 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === activeImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setActiveImageIndex(index)}
            ></button>
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-2">{destination.name}</h1>
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{destination.location}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.category.map((category) => (
                <span 
                  key={category} 
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Navigation tabs */}
        <div className="bg-white rounded-t-xl shadow-md p-1 flex overflow-x-auto sticky top-16 z-20">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        <div className="bg-white rounded-b-xl shadow-md p-6">
          {/* Overview Section */}
          <div id="overview" className={activeSection === 'overview' ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {destination.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <Calendar className="w-5 h-5 text-teal-600 mr-2" />
                  Best Time to Visit
                </h3>
                <p className="text-gray-700">{destination.bestTimeToVisit}</p>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <MapPin className="w-5 h-5 text-teal-600 mr-2" />
                  Location
                </h3>
                <p className="text-gray-700">{destination.location}</p>
              </div>
            </div>
          </div>
          
          {/* Attractions Section */}
          <div id="attractions" className={activeSection === 'attractions' ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Attractions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.attractions.map((attraction) => (
                <div key={attraction.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={attraction.imageUrl} 
                      alt={attraction.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{attraction.name}</h3>
                    <p className="text-gray-600">{attraction.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Activities Section */}
          <div id="activities" className={activeSection === 'activities' ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Popular Activities</h2>
            <div className="space-y-6">
              {destination.activities.map((activity) => (
                <div key={activity.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img 
                      src={activity.imageUrl} 
                      alt={activity.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{activity.name}</h3>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 text-teal-600 mr-2" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <DollarSign className="w-4 h-4 text-teal-600 mr-2" />
                        <span>{activity.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Travel Tips Section */}
          <div id="tips" className={activeSection === 'tips' ? 'block' : 'hidden'}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Travel Tips</h2>
            <div className="bg-teal-50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <Info className="w-6 h-6 text-teal-600 mr-3 mt-0.5" />
                <p className="text-gray-700 italic">
                  Make the most of your trip to {destination.name} with these local recommendations and practical tips.
                </p>
              </div>
              <ul className="space-y-3">
                {destination.travelTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center bg-teal-600 text-white rounded-full w-6 h-6 text-xs font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related content section */}
      <div className="container mx-auto px-4 mt-12">
        <div className="bg-teal-50 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ready to Experience {destination.name}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/itineraries" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start"
            >
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Browse Itineraries</h3>
                <p className="text-gray-600">
                  Discover curated travel plans including {destination.name} and other amazing destinations.
                </p>
              </div>
            </Link>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <MapPin className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan Your Visit</h3>
                <p className="text-gray-600">
                  Get practical information on how to reach {destination.name} and where to stay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationPage;