import React, { useState, useEffect } from "react";
import { TourGuide, TourGuideSpecialty, GuidedTour } from "../../types";
import { tourGuides as initialTourGuides } from "../../data/tourGuides";
import {
  PlusCircle,
  Search,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Globe,
  Eye,
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

const GuidesContent: React.FC = () => {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<TourGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<TourGuide | null>(null);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(
    null
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<
    TourGuideSpecialty[]
  >([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<TourGuide>>({
    id: "",
    name: "",
    specialties: [],
    location: "",
    description: "",
    shortBio: "",
    imageUrl: "",
    languages: [],
    experience: 0,
    rating: 0,
    reviewCount: 0,
    contactInfo: {
      email: "",
      phone: "",
    },
    availability: "",
    isVerified: false,
    tours: [],
  });

  const [currentTour, setCurrentTour] = useState<Partial<GuidedTour> | null>(
    null
  );
  const [isAddingTour, setIsAddingTour] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");

  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isVerifyChecked, setIsVerifyChecked] = useState(false);

  const specialtyOptions: TourGuideSpecialty[] = [
    "adventure",
    "cultural",
    "historical",
    "nature",
    "culinary",
    "photography",
    "diving",
  ];

  // Load guides data on component mount
  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch tour guides
        const { data: guidesData, error: guidesError } = await supabase.from(
          "tour_guides"
        ).select(`
          id,
          user_id,
          bio,
          specialties,
          location,
          short_bio,
          experience,
          rating,
          review_count,
          availability,
          is_verified,
          users:users!tour_guides_user_id_fkey(id, first_name, last_name, email, profile_picture),
          tours:tours(id, title, description, duration, price, max_group_size, location)
        `);

        if (guidesError) {
          console.error("Failed to fetch tour guides:", guidesError);
          setError(`Failed to load guides: ${guidesError.message}`);
          setGuides([]);
          setFilteredGuides([]);
          return;
        }

        // Fetch languages for all guides
        const { data: languagesData, error: languagesError } = await supabase
          .from("tour_guide_languages")
          .select("tour_guide_id, language");

        if (languagesError) {
          console.warn("Failed to fetch languages:", languagesError);
        }

        // Map guides to TourGuide type
        const guidesMapped = (guidesData || []).map((g: any) => {
          const guideLanguages = (languagesData || [])
            .filter((l: any) => l.tour_guide_id === g.id)
            .map((l: any) => l.language);

          // Parse specialties - handle JSONB, JSON string, array, or single values
          let specialties: string[] = [];
          if (g.specialties !== undefined && g.specialties !== null) {
            if (Array.isArray(g.specialties)) {
              specialties = g.specialties;
            } else if (typeof g.specialties === 'object') {
              // If it's a JSONB object, get all values (should be array or object)
              specialties = Object.values(g.specialties);
            } else if (typeof g.specialties === 'string') {
              // Try to parse as JSON array, fallback to comma split, fallback to single string
              try {
                const parsed = JSON.parse(g.specialties);
                if (Array.isArray(parsed)) {
                  specialties = parsed;
                } else if (typeof parsed === 'string') {
                  specialties = [parsed];
                } else if (typeof parsed === 'object' && parsed !== null) {
                  specialties = Object.values(parsed);
                }
              } catch {
                // If not JSON, try comma split
                if (g.specialties.includes(',')) {
                  specialties = g.specialties.split(',');
                } else {
                  specialties = [g.specialties];
                }
              }
            }
          }
          // Ensure all specialties are strings and clean them, and filter out booleans/nulls
          specialties = specialties
            .filter((s: any) => typeof s === 'string' && s.trim() !== '')
            .map((s: string) => s.trim());

          return {
            id: `guide-${g.id}`,
            name: g.users ? `${g.users.first_name} ${g.users.last_name}` : "-",
            specialties: specialties,
            location: g.location || "",
            description: g.bio || "",
            shortBio: g.short_bio || "",
            imageUrl: g.users?.profile_picture || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
            languages: guideLanguages,
            experience: g.experience || 0,
            rating: Number(g.rating) || 0,
            reviewCount: g.review_count || 0,
            contactInfo: {
              email: g.users?.email || "",
              phone: "",
            },
            availability: g.availability || "",
            isVerified: g.is_verified || false,
            tours: (g.tours || []).map((t: any) => ({
              id: `tour-${t.id}`,
              title: t.title,
              description: t.description,
              duration: t.duration,
              price: t.price?.toString() || "",
              maxGroupSize: t.max_group_size || 0,
              location: t.location || "",
            })),
            reviews: [],
          };
        });

        console.log('=== DATA FETCH SUMMARY ===');
        console.log('Total guides fetched:', guidesMapped.length);
        console.log('All unique specialties found:',
          [...new Set(guidesMapped.flatMap(g => g.specialties))].sort()
        );
        console.log('Sample guides with specialties:',
          guidesMapped.slice(0, 5).map(g => ({
            name: g.name,
            specialties: g.specialties,
            location: g.location
          }))
        );
        console.log('========================');

        setGuides(guidesMapped);
        setFilteredGuides(guidesMapped);

        // If no guides have specialties, add some test data for debugging
        if (guidesMapped.every(g => g.specialties.length === 0)) {
          console.warn('No specialties found in any guide. Adding test data...');
          const testGuides = guidesMapped.map((guide, index) => ({
            ...guide,
            specialties: (index % 3 === 0 ? ['adventure', 'nature'] :
              index % 3 === 1 ? ['cultural', 'historical'] :
                ['culinary', 'photography']) as TourGuideSpecialty[]
          }));
          setGuides(testGuides);
          setFilteredGuides(testGuides);
        }
      } catch (err) {
        console.error('Error fetching guides:', err);
        setError('Failed to load guides. Please try again.');
        setGuides([]);
        setFilteredGuides([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuides();
  }, []);

  // Filter guides when any filter criteria changes
  useEffect(() => {
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('=== FILTER DEBUG ===');
      console.log('Total guides:', guides.length);
      console.log('Selected specialties:', selectedSpecialties);

      // Log sample of guides data
      if (guides.length > 0 && selectedSpecialties.length > 0) {
        console.log('Sample guide specialties:', guides.slice(0, 3).map(g => ({
          name: g.name,
          specialties: g.specialties
        })));
      }
    }


    const filtered = guides.filter((guide) => {
      // Normalize specialties and selectedSpecialties to lowercase-trim
      const guideSpecialties = (guide.specialties || [])
        .map((s: any) => (s || "").toString().toLowerCase().trim())
        .filter((s: string) => s !== "");
      const selectedSpecs = selectedSpecialties
        .map((s) => s.toLowerCase().trim())
        .filter((s) => s !== "");

      // Search filter - only apply if there's a search query
      const matchesSearch = !searchQuery ||
        guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.shortBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.languages.some((lang) =>
          lang.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        guideSpecialties.some((specialty) =>
          specialty.includes(searchQuery.toLowerCase())
        );

      // Specialties filter - only apply if specialties are selected
      // All selected specialties must be present in guideSpecialties (AND logic)
      const matchesSpecialties =
        selectedSpecs.length === 0 ||
        selectedSpecs.every((specialty) =>
          guideSpecialties.includes(specialty)
        );

      // Location filter - only apply if location is selected
      const matchesLocation =
        !selectedLocation || guide.location === selectedLocation;

      // Verification filter - only apply if "unverified only" is checked
      const matchesVerification =
        !showUnverifiedOnly || guide.isVerified === false;

      return matchesSearch && matchesSpecialties && matchesLocation && matchesVerification;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Filtered count:', filtered.length);
      console.log('==================');
    }

    setFilteredGuides(filtered);
  }, [
    searchQuery,
    selectedSpecialties,
    selectedLocation,
    showUnverifiedOnly,
    guides,
  ]);

  // Get unique locations from tour guides
  const locations = Array.from(
    new Set(guides.map((guide) => guide.location).filter(location => location && location.trim() !== ""))
  ).sort();

  const toggleSpecialty = (specialty: TourGuideSpecialty) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties((prev) => prev.filter((s) => s !== specialty));
    } else {
      setSelectedSpecialties((prev) => [...prev, specialty]);
    }
  };

  const toggleSpecialtyInForm = (specialty: TourGuideSpecialty) => {
    setFormData((prev) => {
      const currentSpecialties = prev.specialties || [];
      if (currentSpecialties.includes(specialty)) {
        return {
          ...prev,
          specialties: currentSpecialties.filter((s) => s !== specialty),
        };
      } else {
        return {
          ...prev,
          specialties: [...currentSpecialties, specialty],
        };
      }
    });
  };

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedLocation("");
    setSearchQuery("");
    setShowUnverifiedOnly(false);
  };
  const handleAddGuide = () => {
    setCurrentGuide(null);
    setIsAddingTour(false);
    setCurrentTour(null);
    setFormData({
      id: `guide-${Math.floor(Math.random() * 10000)}`,
      name: "",
      specialties: [],
      location: "",
      description: "",
      shortBio: "",
      imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
      languages: [],
      experience: 0,
      rating: 0,
      reviewCount: 0,
      contactInfo: {
        email: "",
        phone: "",
      },
      availability: "",
      isVerified: false,
      tours: [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteGuide = (guideId: string) => {
    setShowConfirmDelete(guideId);
  };

  const confirmDeleteGuide = (guideId: string) => {
    setGuides((prev) => prev.filter((guide) => guide.id !== guideId));
    setShowConfirmDelete(null);
  };

  const cancelDeleteGuide = () => {
    setShowConfirmDelete(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested properties
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof typeof prev] || {}) as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      // Handle regular properties
      setFormData((prev) => ({
        ...prev,
        [name]: name === "experience" ? Number(value) : value,
      }));
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage && !formData.languages?.includes(newLanguage)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...(prev.languages || []), newLanguage],
      }));
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages?.filter((lang) => lang !== language) || [],
    }));
  };

  const handleSubmitGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.description) {
      alert("Please fill out all required fields");
      return;
    }

    const completeGuide = formData as TourGuide;

    if (currentGuide) {
      // Update existing guide
      setGuides((prev) =>
        prev.map((guide) =>
          guide.id === currentGuide.id ? completeGuide : guide
        )
      );
    } else {
      // Add new guide
      setGuides((prev) => [...prev, completeGuide]);
    }

    setIsModalOpen(false);
    setCurrentGuide(null);
  };

  const handleTourChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentTour((prev) => ({
      ...prev,
      [name]: name === "maxGroupSize" ? Number(value) : value,
    }));
  };

  const handleAddTour = () => {
    setIsAddingTour(true);
    setCurrentTour({
      id: `tour-${Math.floor(Math.random() * 10000)}`,
      title: "",
      description: "",
      duration: "",
      price: "",
      maxGroupSize: 10,
    });
  };

  const handleDeleteTour = (tourId: string) => {
    setFormData((prev) => ({
      ...prev,
      tours: prev.tours?.filter((tour) => tour.id !== tourId) || [],
    }));
  };

  const handleSubmitTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentTour?.title ||
      !currentTour?.description ||
      !currentTour?.duration
    ) {
      alert("Please fill out all required fields for the tour");
      return;
    }

    const tour = currentTour as GuidedTour;

    if (formData.tours?.some((t) => t.id === tour.id)) {
      // Update existing tour
      setFormData((prev) => ({
        ...prev,
        tours: prev.tours?.map((t) => (t.id === tour.id ? tour : t)) || [],
      }));
    } else {
      // Add new tour
      setFormData((prev) => ({
        ...prev,
        tours: [...(prev.tours || []), tour],
      }));
    }

    setIsAddingTour(false);
    setCurrentTour(null);
  };

  const toggleExpandGuide = (guideId: string) => {
    if (expandedGuideId === guideId) {
      setExpandedGuideId(null);
    } else {
      setExpandedGuideId(guideId);
    }
  };

  const handleReviewClick = (guide: TourGuide) => {
    setSelectedGuide(guide);
    setIsReviewModalOpen(true);
  };

  const handleVerify = async () => {
    if (selectedGuide) {
      // Update ke Supabase
      const supabaseId = selectedGuide.id.replace("guide-", "");
      const { error } = await supabase
        .from("tour_guides")
        .update({ is_verified: true })
        .eq("id", supabaseId);
      if (error) {
        alert("Gagal memverifikasi guide: " + error.message);
        return;
      }
      // Refresh data dari Supabase
      const fetchGuides = async () => {
        const { data: guidesData, error: guidesError } = await supabase.from(
          "tour_guides"
        ).select(`
            id,
            user_id,
            bio,
            specialties,
            location,
            short_bio,
            experience,
            rating,
            review_count,
            availability,
            is_verified,
            users:users!tour_guides_user_id_fkey(id, first_name, last_name, email, profile_picture),
            tours:tours(id, title, description, duration, price, max_group_size, location)
          `);
        const { data: languagesData } = await supabase
          .from("tour_guide_languages")
          .select("tour_guide_id, language");
        const guidesMapped = (guidesData || []).map((g: any) => {
          const guideLanguages = (languagesData || [])
            .filter((l: any) => l.tour_guide_id === g.id)
            .map((l: any) => l.language);

          // Use same specialties parsing logic
          let specialties = [];
          if (g.specialties) {
            if (typeof g.specialties === 'string') {
              try {
                const parsed = JSON.parse(g.specialties);
                if (Array.isArray(parsed)) {
                  specialties = parsed;
                } else {
                  specialties = [parsed];
                }
              } catch {
                specialties = [g.specialties];
              }
            } else if (Array.isArray(g.specialties)) {
              specialties = g.specialties;
            } else if (typeof g.specialties === 'object' && g.specialties !== null) {
              if (Array.isArray(g.specialties)) {
                specialties = g.specialties;
              } else {
                specialties = Object.values(g.specialties);
              }
            } else {
              specialties = [g.specialties];
            }
          }

          specialties = specialties
            .filter((s: any) => s != null && s !== '')
            .map((s: any) => String(s).trim())
            .filter((s: string) => s !== '');

          return {
            id: `guide-${g.id}`,
            name: g.users ? `${g.users.first_name} ${g.users.last_name}` : "-",
            specialties: specialties,
            location: g.location || "",
            description: g.bio || "",
            shortBio: g.short_bio || "",
            imageUrl: g.users?.profile_picture || "",
            languages: guideLanguages,
            experience: g.experience || 0,
            rating: Number(g.rating) || 0,
            reviewCount: g.review_count || 0,
            contactInfo: {
              email: g.users?.email || "",
              phone: "",
            },
            availability: g.availability || "",
            isVerified: g.is_verified || false,
            tours: (g.tours || []).map((t: any) => ({
              id: `tour-${t.id}`,
              title: t.title,
              description: t.description,
              duration: t.duration,
              price: t.price?.toString() || "",
              maxGroupSize: t.max_group_size || 0,
              location: t.location || "",
            })),
            reviews: [], // <-- tambahkan ini agar sesuai tipe
          };
        });
        setGuides(guidesMapped);
        setFilteredGuides(guidesMapped);
      };
      await fetchGuides();
      setIsReviewModalOpen(false);
      setSelectedGuide(null);
    }
  };

  const handleReject = () => {
    setIsReviewModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Tour Guide Management
          </h2>
          {/* <button
            className="bg-teal-600 text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleAddGuide}
          >
            <PlusCircle size={16} className="mr-2" />
            Add New Guide
          </button> */}
        </div>{" "}
        {/* Search and Filters */}
        <div className="mb-8 bg-gradient-to-r from-gray-50 to-teal-50 p-6 rounded-xl border border-gray-200">
          {/* Search Bar Section */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search guides by name, specialties, locations, or languages..."
                className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700 placeholder-gray-400 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />
              {searchQuery && (
                <button
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <Globe className="mr-2 text-teal-600" size={20} />
                Filter Guides
              </h3>
              {(searchQuery ||
                selectedSpecialties.length > 0 ||
                selectedLocation ||
                showUnverifiedOnly) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center text-teal-600 hover:text-teal-800 text-sm font-medium bg-white px-3 py-1.5 rounded-full border border-teal-200 hover:bg-teal-50 transition-all duration-200"
                  >
                    <X size={16} className="mr-1" />
                    Clear All Filters
                  </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {" "}
              {/* Specialty Filter */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                  Specialties ({selectedSpecialties.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${selectedSpecialties.includes(specialty)
                        ? "bg-teal-500 text-white border-teal-500 shadow-md transform scale-105"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                    >
                      {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                    </button>
                  ))}
                </div>
              </div>{" "}
              {/* Location Filter */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <MapPin className="mr-2 text-teal-600" size={16} />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-all duration-200"
                >
                  <option value="">All locations ({locations.length})</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      📍 {location}
                    </option>
                  ))}
                </select>
              </div>{" "}
              {/* Verification Filter */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Check className="mr-2 text-teal-600" size={16} />
                  Verification Status
                </label>
                <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={showUnverifiedOnly}
                    onChange={(e) => setShowUnverifiedOnly(e.target.checked)}
                    className="mr-3 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">
                    Show only unverified guides
                  </span>
                </label>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery ||
              selectedSpecialties.length > 0 ||
              selectedLocation ||
              showUnverifiedOnly) && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      Active filters:
                    </span>

                    {searchQuery && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}

                    {selectedSpecialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                      >
                        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        <button
                          onClick={() => toggleSpecialty(specialty)}
                          className="ml-2 text-teal-600 hover:text-teal-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}

                    {selectedLocation && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📍 {selectedLocation}
                        <button
                          onClick={() => setSelectedLocation("")}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}

                    {showUnverifiedOnly && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Unverified only
                        <button
                          onClick={() => setShowUnverifiedOnly(false)}
                          className="ml-2 text-yellow-600 hover:text-yellow-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

            {/* Results Summary */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredGuides.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {guides.length}
                  </span>{" "}
                  guides
                </span>
                <span className="text-gray-500">
                  {filteredGuides.filter((g) => g.isVerified).length} verified •{" "}
                  {filteredGuides.filter((g) => !g.isVerified).length}{" "}
                  unverified
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Tour Guides List */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-500">Loading tour guides...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
              >
                Retry
              </button>
            </div>
          ) : filteredGuides.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Guide
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Experience
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Specialties
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rating
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tours
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Verification Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuides.map((guide) => (
                    <React.Fragment key={guide.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={guide.imageUrl}
                                alt={guide.name}
                                className="h-10 w-10 object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {guide.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {guide.contactInfo.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin size={14} className="mr-1 text-gray-400" />
                            {guide.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {guide.experience} years
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {guide.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-900 mr-1">
                              {guide.rating}
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(guide.rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                    }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 ml-1">
                              ({guide.reviewCount})
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">
                              {guide.tours.length} tours
                            </span>{" "}
                            <button
                              onClick={() => toggleExpandGuide(guide.id)}
                              className="ml-2 text-teal-600 hover:text-teal-800"
                            >
                              {expandedGuideId === guide.id ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${guide.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {guide.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {showConfirmDelete === guide.id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => confirmDeleteGuide(guide.id)}
                                className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelDeleteGuide}
                                className="text-white bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleReviewClick(guide)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Review Guide"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGuide(guide.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedGuideId === guide.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Profile Information
                                  </h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                      <span className="font-medium">
                                        Languages:
                                      </span>{" "}
                                      {guide.languages.join(", ")}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Availability:
                                      </span>{" "}
                                      {guide.availability}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Contact:
                                      </span>{" "}
                                      {guide.contactInfo.phone ||
                                        "No phone provided"}
                                    </p>
                                  </div>
                                  <div className="mt-2">
                                    <h5 className="font-medium text-gray-800">
                                      Bio
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      {guide.description}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      Tours ({guide.tours.length})
                                    </h4>
                                  </div>
                                  {guide.tours.length > 0 ? (
                                    <div className="space-y-3">
                                      {guide.tours.map((tour) => (
                                        <div
                                          key={tour.id}
                                          className="bg-white p-3 border border-gray-200 rounded-md"
                                        >
                                          <h5 className="font-medium text-gray-800">
                                            {tour.title}
                                          </h5>
                                          <p className="text-sm text-gray-600 line-clamp-2">
                                            {tour.description}
                                          </p>
                                          <div className="flex justify-between mt-2">
                                            <div className="text-sm text-gray-500">
                                              {tour.duration} • Max:{" "}
                                              {tour.maxGroupSize} people •{" "}
                                              {tour.price}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No tours available
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                No tour guides found matching your criteria.
              </p>
              <p className="text-gray-400 text-sm">
                Try adjusting your filters or search terms
              </p>
              {(searchQuery || selectedSpecialties.length > 0 || selectedLocation || showUnverifiedOnly) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Guide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentGuide
                  ? `Edit Guide: ${currentGuide.name}`
                  : "Add New Tour Guide"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {isAddingTour ? (
              // Tour Form
              <form onSubmit={handleSubmitTour} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tour Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={currentTour?.title || ""}
                      onChange={handleTourChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={currentTour?.duration || ""}
                        onChange={handleTourChange}
                        placeholder="e.g. 3 hours"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={currentTour?.price || ""}
                        onChange={handleTourChange}
                        placeholder="e.g. IDR 500,000"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Group Size <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxGroupSize"
                        min="1"
                        max="50"
                        value={currentTour?.maxGroupSize || 10}
                        onChange={handleTourChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={currentTour?.description || ""}
                    onChange={handleTourChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTour(false);
                      setCurrentTour(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    {currentTour?.id &&
                      formData.tours?.some((t) => t.id === currentTour.id)
                      ? "Update Tour"
                      : "Add Tour"}
                  </button>
                </div>
              </form>
            ) : (
              // Guide Form
              <form onSubmit={handleSubmitGuide} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Image URL
                      </label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Years Experience
                        </label>
                        <input
                          type="number"
                          name="experience"
                          min="0"
                          max="50"
                          value={formData.experience || 0}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Availability
                        </label>
                        <input
                          type="text"
                          name="availability"
                          value={formData.availability || ""}
                          placeholder="e.g. Available year-round"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialties
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {specialtyOptions.map((specialty) => (
                          <button
                            type="button"
                            key={specialty}
                            onClick={() => toggleSpecialtyInForm(specialty)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${formData.specialties?.includes(specialty)
                              ? "bg-teal-100 text-teal-800 border-teal-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                              }`}
                          >
                            {specialty}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.languages?.map((language) => (
                          <div
                            key={language}
                            className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                          >
                            <Globe size={14} className="mr-1 text-gray-500" />
                            <span className="text-sm">{language}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(language)}
                              className="ml-1 text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Add language..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddLanguage}
                          className="px-3 py-2 bg-teal-600 text-white rounded-r-md hover:bg-teal-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="contactInfo.email"
                          value={formData.contactInfo?.email || ""}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="contactInfo.phone"
                          value={formData.contactInfo?.phone || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Short Bio
                      </label>
                      <input
                        type="text"
                        name="shortBio"
                        value={formData.shortBio || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        rows={5}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      ></textarea>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tours
                        </label>
                        <button
                          type="button"
                          onClick={handleAddTour}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                        >
                          <PlusCircle size={16} className="mr-1" />
                          Add Tour
                        </button>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {formData.tours && formData.tours.length > 0 ? (
                          formData.tours.map((tour) => (
                            <div
                              key={tour.id}
                              className="bg-gray-50 p-3 rounded-md border border-gray-200"
                            >
                              <div className="flex justify-between">
                                <h5 className="font-medium text-gray-900">
                                  {tour.title}
                                </h5>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTour(tour.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                                {tour.description}
                              </p>
                              <div className="flex justify-between mt-1 text-xs text-gray-500">
                                <span>{tour.duration}</span>
                                <span>{tour.price}</span>
                                <span>Max: {tour.maxGroupSize} people</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No tours added yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.isVerified || false}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isVerified: e.target.checked,
                            }))
                          }
                          className="mr-2 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        Verified Guide
                      </label>
                      <p className="text-xs text-gray-500 ml-6">
                        Check this box if the guide's identity and credentials
                        have been verified.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    {currentGuide ? "Update Guide" : "Add Guide"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Guide Modal */}
      {isReviewModalOpen && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative">
            {/* Tombol close */}
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                Review Guide: {selectedGuide.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.name}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.contactInfo.email}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">Phone</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.contactInfo.phone || "N/A"}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">
                    Location
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.location}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">
                    Years Experience
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.experience}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">
                    Specialties
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGuide.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
                      >
                        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">
                    Languages
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGuide.languages.map((language) => (
                      <span
                        key={language}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
                      >
                        {language.charAt(0).toUpperCase() + language.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">
                    Availability
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.availability}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-white p-4 rounded-lg border border-teal-200 shadow-md">
                  <p className="text-sm font-semibold text-teal-700">
                    Description
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedGuide.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="verifyCheck"
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  onChange={(e) => setIsVerifyChecked(e.target.checked)}
                  checked={isVerifyChecked}
                  disabled={selectedGuide?.isVerified}
                />
                <label
                  htmlFor="verifyCheck"
                  className="ml-2 text-sm text-gray-700"
                >
                  I confirm that I have reviewed all the details and approve
                  this guide for verification.
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                {selectedGuide?.isVerified ? (
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Close
                  </button>
                ) : (
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={
                    isVerifyChecked && !selectedGuide?.isVerified
                      ? handleVerify
                      : undefined
                  }
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg ${!isVerifyChecked || selectedGuide?.isVerified
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                    }`}
                  disabled={!isVerifyChecked || selectedGuide?.isVerified}
                >
                  Verify
                </button>
              </div>
              {selectedGuide?.isVerified && (
                <div className="mt-4 text-green-700 font-semibold text-sm text-center">
                  This guide has already been verified. No further changes
                  allowed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuidesContent;
