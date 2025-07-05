import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, MapPin } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-teal-600 mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full">
              <MapPin className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Destination Not Found</h1>
          <p className="text-gray-600 mb-8">
            It seems you've ventured off the beaten path. The destination you're looking for doesn't exist or has moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <Link 
              to="/destinations" 
              className="bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="w-5 h-5" />
              Explore Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
