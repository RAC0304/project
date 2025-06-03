import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Destination } from "../../types";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  return (
    <Link
      to={`/destinations/${destination.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white">{destination.name}</h3>
          <div className="flex items-center text-white/90 text-sm mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{destination.location}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm line-clamp-2">
          {destination.shortDescription}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {destination.category.slice(0, 3).map((category) => (
            <span
              key={category}
              className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          ))}
        </div>{" "}
        <a
          href={destination.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 inline-block px-4 py-2 bg-teal-600 text-white text-center rounded-full text-sm font-semibold shadow-md hover:bg-teal-700 transition-all"
        >
          View Detail
        </a>
      </div>
    </Link>
  );
};

export default DestinationCard;
