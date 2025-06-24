import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import "./SearchForm.css";

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState(""); // Handle date input click to show picker
  const handleDateInputClick = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLInputElement;
    // Only call showPicker if it's available and this is a direct user interaction
    try {
      if (target.showPicker && typeof target.showPicker === "function") {
        target.showPicker();
      }
    } catch {
      // Fallback: just focus the input which will show the picker on most browsers
      target.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter results based on the search criteria
    navigate(`/destinations?search=${destination}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <label
          htmlFor="destination"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Destination
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where do you want to go?"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>{" "}
      <div className="flex-1">
        <label
          htmlFor="dates"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Dates
        </label>{" "}
        <div className="relative date-input-container">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            id="dates"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            onClick={handleDateInputClick}
            placeholder="dd/mm/yyyy"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 date-input cursor-pointer"
          />
        </div>
      </div>
      <div className="flex-1">
        <label
          htmlFor="travelers"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Travelers
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="travelers"
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 appearance-none"
          >
            <option value="">Number of travelers</option>
            <option value="1">1 Traveler</option>
            <option value="2">2 Travelers</option>
            <option value="3-5">3-5 Travelers</option>
            <option value="6+">6+ Travelers</option>
          </select>
        </div>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full lg:w-auto bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
