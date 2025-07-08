import React, { useState, useEffect, Suspense } from "react";
// Lazy load ImageCarousel for modal
const ImageCarousel = React.lazy(() => import("./ImageCarousel"));
import { searchTourGuides } from "../../services/tourGuideSearchService";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { getDestinations, getDestinationsForDropdown, getDestinationById, getDestinationImagesAndNameById } from "../../services/destinationService";
import { getAllTourGuideLanguages } from "../../services/tourGuideLanguageService";
import { getSpecialtiesByDestination } from "../../services/tourGuideSearchService";
import "./SearchForm.css";

// Interest options will be loaded from the database
const INTEREST_OPTIONS: string[] = [];

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(""); // name
  const [destinationId, setDestinationId] = useState("");
  const [destinationOptions, setDestinationOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch destinations for select options (id & name)
    const fetchDestinations = async () => {
      try {
        const result = await getDestinationsForDropdown();
        setDestinationOptions(result.map((d) => ({ id: String(d.id), name: d.name })));
      } catch {
        setDestinationOptions([]);
      }
    };
    fetchDestinations();
  }, []);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestOptions, setInterestOptions] = useState<string[]>([]);
  const [language, setLanguage] = useState("");
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [interestDropdownOpen, setInterestDropdownOpen] = useState(false);
  useEffect(() => {
    // Fetch unique languages from tour_guide_languages
    const fetchLanguages = async () => {
      const langs = await getAllTourGuideLanguages();
      setLanguageOptions(langs);
    };
    fetchLanguages();
  }, []);

  // Fetch specialties for selected destination
  useEffect(() => {
    const fetchSpecialties = async () => {
      const specialties = await getSpecialtiesByDestination(destination);
      setInterestOptions(specialties);
    };
    fetchSpecialties();
  }, [destination]);

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!interestDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.getElementById('interest-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setInterestDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [interestDropdownOpen]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Auto-slide timer
  useEffect(() => {
    if (!modalOpen || !modalData?.destinationImages?.length) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) =>
        (prev + 1) % modalData.destinationImages.length
      );
    }, 1500); // Change image every 1.5 seconds
    return () => clearInterval(interval);
  }, [modalOpen, modalData?.destinationImages]);

  // Reset active image index when modalData changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [modalData?.destinationImages]);

  const prevImage = () => {
    if (!modalData?.destinationImages?.length) return;
    setActiveImageIndex((prev) =>
      (prev - 1 + modalData.destinationImages.length) % modalData.destinationImages.length
    );
  };
  const nextImage = () => {
    if (!modalData?.destinationImages?.length) return;
    setActiveImageIndex((prev) =>
      (prev + 1) % modalData.destinationImages.length
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Search tour guides with selected filters
    const guides = await searchTourGuides({
      destination,
      interests,
      language,
    });

    // Fetch destination images (carousel) by id using JOIN query
    let destinationImages: string[] = [];
    let destinationName = destination;
    try {
      if (destinationId) {
        // Use a new service function to fetch images and name with JOIN
        const { images, name } = await getDestinationImagesAndNameById(destinationId);
        destinationImages = images || [];
        destinationName = name || destination;
        // Fallback: if no images found, try getDestinationById for single image
        if (destinationImages.length === 0) {
          const dest = await getDestinationById(destinationId);
          if (dest && dest.images && dest.images.length > 0) {
            destinationImages = dest.images;
            destinationName = dest.name;
          }
        }
      }
    } catch { }
    setModalData({
      destination: destinationName,
      interests,
      language,
      guides,
      destinationImages,
    });
    setModalOpen(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 shadow-xl rounded-2xl px-3 py-3 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-4 w-full max-w-6xl mx-auto"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        {/* Destination Select Option */}
        <div className="flex-1 min-w-[220px] flex flex-col justify-between">
          <label htmlFor="destination" className="block text-base font-semibold text-gray-800 mb-2">
            Destination
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="destination"
              value={destinationId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setDestinationId(selectedId);
                const selected = destinationOptions.find((d) => d.id === selectedId);
                setDestination(selected ? selected.name : "");
              }}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-white transition-all"
            >
              <option value="">Select destination</option>
              {destinationOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interest/Activity Multi-select Dropdown with checkboxes */}
        <div className="flex-1 min-w-[220px] flex flex-col justify-between relative" id="interest-dropdown">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Interest / Activity (TourGuide)
          </label>
          <button
            type="button"
            className="block w-full text-left bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-all flex items-center justify-between gap-2"
            onClick={() => setInterestDropdownOpen((open) => !open)}
          >
            <span className={interests.length === 0 ? 'text-gray-400' : ''}>
              {interests.length === 0 ? 'Select interests' : interests.join(', ')}
            </span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${interestDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {interestDropdownOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-2 px-2 flex flex-col gap-1 animate-fade-in" style={{ maxHeight: 220, overflowY: 'auto' }}>
              {interestOptions.map((interest) => (
                <label
                  key={interest}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className="accent-teal-600 w-4 h-4 rounded focus:ring-2 focus:ring-teal-400"
                  />
                  <span className="text-base text-gray-800 select-none">{interest}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Language Dropdown (optional) */}
        <div className="flex-1 min-w-[220px] flex flex-col justify-between">
          <label htmlFor="language" className="block text-base font-semibold text-gray-800 mb-2">
            Language <span className="text-gray-400 text-sm font-normal">(optional)</span>
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="block w-full py-3 px-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base bg-white transition-all"
          >
            <option value="">Any language</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <div className="flex items-end min-w-[120px]">
          <button
            type="submit"
            className="w-full lg:w-auto bg-teal-600 hover:bg-teal-700 text-white py-3 px-7 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
            style={{ minWidth: 120 }}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Modal Result */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-teal-200/40 max-w-2xl w-full p-0 relative overflow-hidden animate-fade-in mt-24 mb-8">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
              <h2 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Search className="w-6 h-6 text-teal-500" /> Tour Guides for Destination: {modalData?.destination || 'Unknown Destination'}
              </h2>
              <button
                className="text-gray-400 hover:text-teal-600 text-3xl font-bold transition-all"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Destination Images Carousel with navigation */}
            {modalData?.destinationImages && modalData.destinationImages.length > 0 && (
              <div className="w-full flex justify-center bg-gray-100 border-b border-gray-100 relative">
                <div className="w-full" style={{ maxWidth: 600, minHeight: 220, position: "relative" }}>
                  <div
                    key={activeImageIndex}
                    className="transition-all duration-500 ease-in-out"
                    style={{ position: "relative" }}
                  >
                    <img
                      src={modalData.destinationImages[activeImageIndex]}
                      alt={modalData.destination}
                      className="w-full h-[220px] object-cover rounded-xl transition-all duration-500 ease-in-out opacity-100 animate-fade-carousel"
                    />
                  </div>
                  {/* Prev Button */}
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    onClick={prevImage}
                    type="button"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  {/* Next Button */}
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    onClick={nextImage}
                    type="button"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                    {modalData.destinationImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === activeImageIndex ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setActiveImageIndex(index)}
                        type="button"
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Destination</div>
                  <div className="font-bold text-lg text-teal-700">{modalData?.destination || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Language</div>
                  <div className="font-semibold text-base">{modalData?.language || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500 mb-1">Interest / Activity</div>
                  <div className="font-semibold text-base">{modalData?.interests?.length ? modalData.interests.join(', ') : '-'}</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-xs text-gray-500 mb-2 font-semibold tracking-wide uppercase">Tour Guides</div>
                {modalData?.guides?.length ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modalData.guides.map((g: any) => (
                      <li key={g.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-3 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        {/* Tour guide profile picture */}
                        {g.profile_picture || g.users?.profile_picture ? (
                          <img
                            src={g.profile_picture || g.users?.profile_picture}
                            alt={g.users?.first_name || 'Tour Guide'}
                            className="w-14 h-14 rounded-full object-cover border-2 border-teal-100 shadow"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                            <span>{g.users?.first_name?.[0] || '?'}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base truncate text-teal-800">{g.users?.first_name} {g.users?.last_name}</div>
                          {g.location ? <div className="text-gray-500 text-sm truncate">{g.location}</div> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400 italic text-center py-6">No tour guides found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchForm;
