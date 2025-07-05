import React, { useState, useEffect, useCallback } from "react";
import { Itinerary, ItineraryDay } from "../../types";
import Toast, { ToastType } from "../common/Toast";
import { supabase } from "../../utils/supabaseClient";

const ItinerariesContent: React.FC = () => {
  const [allItineraries, setAllItineraries] = useState<Itinerary[]>([]);
  const [allDestinations, setAllDestinations] = useState<Array<{id: string, name: string, slug: string}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [formData, setFormData] = useState<Partial<Itinerary>>({
    id: "",
    title: "",
    duration: "",
    description: "",
    imageUrl: "",
    destinations: [],
    days: [],
    difficulty: "easy",
    bestSeason: "",
    estimatedBudget: "",
  });

  // Temporary states for dynamic fields
  const [selectedDestination, setSelectedDestination] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    type: "success" as ToastType,
    message: "",
  });

  // Function to fetch destinations from Supabase
  const fetchDestinations = useCallback(async () => {
    try {
      const { data: destinations, error } = await supabase
        .from("destinations")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching destinations:", error.message);
        return;
      }

      setAllDestinations(destinations || []);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  }, []);

  // Function to fetch itineraries from Supabase
  const fetchItineraries = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch itineraries
      const { data: itineraries, error } = await supabase
        .from("itineraries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching itineraries:", error.message);
        showToast("error", `Failed to fetch itineraries: ${error.message}`);
        setAllItineraries([]);
        return;
      }

      if (!itineraries || itineraries.length === 0) {
        setAllItineraries([]);
        return;
      }

      // For each itinerary, fetch related data
      const itinerariesWithDetails = await Promise.all(
        itineraries.map(async (itinerary) => {
          // Fetch days
          const { data: days } = await supabase
            .from("itinerary_days")
            .select("*")
            .eq("itinerary_id", itinerary.id)
            .order("day_number", { ascending: true });

          // Fetch destinations
          const { data: destinations } = await supabase
            .from("itinerary_destinations")
            .select("destination_id, destinations(slug)")
            .eq("itinerary_id", itinerary.id)
            .order("order_index", { ascending: true });

          const mappedDays = days
            ? await Promise.all(
                days.map(async (day) => {
                  // Fetch activities for each day
                  const { data: activities } = await supabase
                    .from("itinerary_activities")
                    .select("*")
                    .eq("itinerary_day_id", day.id)
                    .order("order_index", { ascending: true });

                  return {
                    day: day.day_number,
                    title: day.title,
                    description: day.description,
                    activities: activities
                      ? activities.map((activity) => ({
                          time: activity.time_start,
                          title: activity.title,
                          description: activity.description,
                          location: activity.location || "",
                        }))
                      : [],
                    accommodation: day.accommodation || "",
                    meals: day.meals || "",
                    transportation: day.transportation || "",
                  } as ItineraryDay;
                })
              )
            : [];

          return {
            id: itinerary.id.toString(),
            title: itinerary.title,
            duration: itinerary.duration,
            description: itinerary.description,
            imageUrl: itinerary.image_url || "",
            destinations: destinations
              ? destinations.map((dest: any) => dest.destinations?.slug || "")
              : [],
            days: mappedDays,
            difficulty: itinerary.difficulty || "easy",
            bestSeason: itinerary.best_season || "",
            estimatedBudget: itinerary.estimated_budget || "",
          } as Itinerary;
        })
      );

      setAllItineraries(itinerariesWithDetails);
    } catch (err) {
      console.error("Error fetching itineraries:", err);
      showToast("error", "Failed to load itineraries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load itineraries and destinations on component mount
  useEffect(() => {
    fetchItineraries();
    fetchDestinations();
  }, [fetchItineraries, fetchDestinations]);

  // Toast helper functions
  const showToast = (type: ToastType, message: string) => {
    setToast({
      isVisible: true,
      type,
      message,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const filteredItineraries = allItineraries.filter(
    (itinerary) =>
      itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddDestination = () => {
    if (selectedDestination && !formData.destinations?.includes(selectedDestination)) {
      setFormData({
        ...formData,
        destinations: [...(formData.destinations || []), selectedDestination],
      });
      setSelectedDestination("");
    }
  };

  const handleRemoveDestination = (index: number) => {
    const updatedDestinations = [...(formData.destinations || [])];
    updatedDestinations.splice(index, 1);
    setFormData({
      ...formData,
      destinations: updatedDestinations,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validations
      if (!formData.title || !formData.duration || !formData.description) {
        showToast("error", "Please fill all required fields");
        setIsLoading(false);
        return;
      }

      if (isEditing && formData.id) {
        // Update existing itinerary
        const { error } = await supabase
          .from("itineraries")
          .update({
            title: formData.title,
            duration: formData.duration,
            description: formData.description,
            image_url: formData.imageUrl,
            difficulty: formData.difficulty,
            best_season: formData.bestSeason,
            estimated_budget: formData.estimatedBudget,
            updated_at: new Date().toISOString(),
          })
          .eq("id", formData.id);

        if (error) throw error;
        showToast("success", "Itinerary updated successfully!");
      } else {
        // Create new itinerary
        const slug = formData.title
          ?.toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");

        const { error } = await supabase.from("itineraries").insert({
          slug,
          title: formData.title,
          duration: formData.duration,
          description: formData.description,
          image_url: formData.imageUrl,
          difficulty: formData.difficulty,
          best_season: formData.bestSeason,
          estimated_budget: formData.estimatedBudget,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        showToast("success", "Itinerary created successfully!");
      }

      // Refresh the list
      await fetchItineraries();
      resetForm();
    } catch (err: any) {
      console.error("Error saving itinerary:", err);
      showToast("error", err.message || "Failed to save itinerary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (itinerary: Itinerary) => {
    setFormData(itinerary);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this itinerary?")) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.from("itineraries").delete().eq("id", id);

      if (error) throw error;

      showToast("success", "Itinerary deleted successfully!");
      await fetchItineraries();
    } catch (err: any) {
      console.error("Error deleting itinerary:", err);
      showToast("error", err.message || "Failed to delete itinerary");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      duration: "",
      description: "",
      imageUrl: "",
      destinations: [],
      days: [],
      difficulty: "easy",
      bestSeason: "",
      estimatedBudget: "",
    });
    setIsEditing(false);
    setShowForm(false);
    setSelectedDestination("");
  };

  const difficultyOptions = ["easy", "moderate", "challenging"];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Itineraries Management
            </h2>
            {isLoading && (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-teal-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="ml-2 text-sm text-gray-600">Processing...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              } else {
                resetForm();
                setIsEditing(false);
                setShowForm(true);
              }
            }}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md ${
              showForm
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-teal-500 hover:bg-teal-600"
            } text-white font-medium transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {showForm ? "Cancel" : "Add New Itinerary"}
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search itineraries by title or description..."
            className="w-full p-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-gray-50 p-6 rounded-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? "Edit Itinerary" : "Add New Itinerary"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter itinerary title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 7 days, 3 weeks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty || "easy"}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Best Season
                  </label>
                  <input
                    type="text"
                    name="bestSeason"
                    value={formData.bestSeason || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., April to October"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    name="estimatedBudget"
                    value={formData.estimatedBudget || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., $800-1200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter itinerary description"
                />
              </div>

              {/* Destinations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinations
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a destination...</option>
                    {allDestinations
                      .filter(dest => !formData.destinations?.includes(dest.slug))
                      .map((destination) => (
                        <option key={destination.id} value={destination.slug}>
                          {destination.name} ({destination.slug})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDestination}
                    disabled={!selectedDestination}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {formData.destinations && formData.destinations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.destinations.map((destinationSlug, index) => {
                      const destination = allDestinations.find(dest => dest.slug === destinationSlug);
                      return (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                          {destination ? destination.name : destinationSlug}
                          <button
                            type="button"
                            onClick={() => handleRemoveDestination(index)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Itineraries List */}
        <div className="space-y-4">
          {isLoading && !showForm ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading itineraries...</p>
            </div>
          ) : filteredItineraries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No itineraries found matching your search." : "No itineraries available."}
            </div>
          ) : (
            filteredItineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {itinerary.title}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                        {itinerary.duration}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                        {itinerary.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {itinerary.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Best Season: {itinerary.bestSeason}</span>
                      <span>Budget: {itinerary.estimatedBudget}</span>
                      <span>
                        Destinations: {itinerary.destinations.map(slug => {
                          const destination = allDestinations.find(dest => dest.slug === slug);
                          return destination ? destination.name : slug;
                        }).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(itinerary)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(itinerary.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.isVisible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
          isVisible={toast.isVisible}
        />
      )}
    </>
  );
};

export default ItinerariesContent;
