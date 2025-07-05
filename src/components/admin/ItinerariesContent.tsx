import React, { useState, useEffect, useCallback } from "react";
import { Itinerary, ItineraryDay } from "../../types";
import Toast, { ToastType } from "../common/Toast";
import { supabase } from "../../utils/supabaseClient";

const ItinerariesContent: React.FC = () => {
    const [allItineraries, setAllItineraries] = useState<Itinerary[]>([]);
    const [allDestinations, setAllDestinations] = useState<Array<{ id: string, name: string, slug: string }>>([]);
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
    const [newDay, setNewDay] = useState<Partial<ItineraryDay>>({
        day: 1,
        title: "",
        description: "",
        activities: [],
        accommodation: "",
        meals: "",
        transportation: "",
    });
    const [newActivity, setNewActivity] = useState({
        time: "",
        title: "",
        description: "",
        location: "",
    });

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

        console.log("Starting itinerary save process...");
        console.log("Form data:", formData);

        try {
            // Validations
            if (!formData.title || !formData.duration || !formData.description) {
                showToast("error", "Please fill all required fields");
                setIsLoading(false);
                return;
            }

            const slug = formData.title
                ?.toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");

            console.log("Generated slug:", slug);

            let itineraryId: string;

            if (isEditing && formData.id) {
                // Update existing itinerary
                const { error } = await supabase
                    .from("itineraries")
                    .update({
                        title: truncateText(formData.title || "", 255),
                        duration: truncateText(formData.duration || "", 255),
                        description: formData.description, // text field - no limit
                        image_url: truncateText(formData.imageUrl || "", 255),
                        difficulty: truncateText(formData.difficulty || "", 255),
                        best_season: truncateText(formData.bestSeason || "", 255),
                        estimated_budget: truncateText(formData.estimatedBudget || "", 255),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", formData.id);

                if (error) throw error;
                itineraryId = formData.id;

                // Delete existing related data with proper error handling
                try {
                    // First get all day IDs for this itinerary
                    const { data: existingDays, error: getDaysError } = await supabase
                        .from("itinerary_days")
                        .select("id")
                        .eq("itinerary_id", itineraryId);

                    if (getDaysError) {
                        console.warn("Warning getting existing days:", getDaysError.message);
                    }

                    // Delete activities first if there are existing days
                    if (existingDays && existingDays.length > 0) {
                        const dayIds = existingDays.map(day => day.id);
                        const { error: deleteActivitiesError } = await supabase
                            .from("itinerary_activities")
                            .delete()
                            .in("itinerary_day_id", dayIds);

                        if (deleteActivitiesError) {
                            console.warn("Warning deleting activities:", deleteActivitiesError.message);
                        }
                    }

                    // Delete days
                    const { error: deleteDaysError } = await supabase
                        .from("itinerary_days")
                        .delete()
                        .eq("itinerary_id", itineraryId);

                    if (deleteDaysError) {
                        console.warn("Warning deleting days:", deleteDaysError.message);
                    }

                    // Delete destination relations
                    const { error: deleteDestError } = await supabase
                        .from("itinerary_destinations")
                        .delete()
                        .eq("itinerary_id", itineraryId);

                    if (deleteDestError) {
                        console.warn("Warning deleting destinations:", deleteDestError.message);
                    }
                } catch (deleteError) {
                    console.warn("Warning during cleanup:", deleteError);
                    // Continue with the process even if cleanup fails
                }
            } else {
                // Create new itinerary
                const { data, error } = await supabase
                    .from("itineraries")
                    .insert({
                        slug: truncateText(slug, 255),
                        title: truncateText(formData.title || "", 255),
                        duration: truncateText(formData.duration || "", 255),
                        description: formData.description, // text field - no limit
                        image_url: truncateText(formData.imageUrl || "", 255),
                        difficulty: truncateText(formData.difficulty || "", 255),
                        best_season: truncateText(formData.bestSeason || "", 255),
                        estimated_budget: truncateText(formData.estimatedBudget || "", 255),
                        created_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (error) throw error;
                itineraryId = data.id;
            }

            // Handle destinations
            if (formData.destinations && formData.destinations.length > 0) {
                try {
                    const destinationInserts = formData.destinations.map((destinationSlug, index) => {
                        const destination = allDestinations.find(dest => dest.slug === destinationSlug);
                        return {
                            itinerary_id: itineraryId,
                            destination_id: destination?.id,
                            order_index: index + 1,
                        };
                    }).filter(item => item.destination_id);

                    if (destinationInserts.length > 0) {
                        const { error: destError } = await supabase
                            .from("itinerary_destinations")
                            .insert(destinationInserts);
                        if (destError) {
                            console.warn("Warning inserting destinations:", destError.message);
                        }
                    }
                } catch (destError) {
                    console.warn("Warning with destinations:", destError);
                }
            }

            // Handle days and activities
            if (formData.days && formData.days.length > 0) {
                try {
                    for (const day of formData.days) {
                        // Insert day
                        const { data: dayData, error: dayError } = await supabase
                            .from("itinerary_days")
                            .insert({
                                itinerary_id: itineraryId,
                                day_number: day.day,
                                title: truncateText(day.title, 255),
                                description: day.description, // text field - no limit
                                accommodation: truncateText(day.accommodation || "", 255),
                                meals: truncateText(day.meals || "", 255),
                                transportation: truncateText(day.transportation || "", 255),
                            })
                            .select()
                            .single();

                        if (dayError) {
                            console.warn("Warning inserting day:", dayError.message);
                            continue; // Skip this day and continue with next
                        }

                        // Insert activities for this day
                        if (day.activities && day.activities.length > 0 && dayData) {
                            try {
                                const activityInserts = day.activities.map((activity, index) => ({
                                    itinerary_day_id: dayData.id,
                                    time_start: truncateText(activity.time, 255),
                                    title: truncateText(activity.title, 255),
                                    description: activity.description, // text field - no limit
                                    location: truncateText(activity.location || "", 255),
                                    order_index: index + 1,
                                }));

                                const { error: activityError } = await supabase
                                    .from("itinerary_activities")
                                    .insert(activityInserts);
                                if (activityError) {
                                    console.warn("Warning inserting activities:", activityError.message);
                                }
                            } catch (actError) {
                                console.warn("Warning with activities for day:", day.title, actError);
                            }
                        }
                    }
                } catch (dayError) {
                    console.warn("Warning with days:", dayError);
                }
            }

            showToast("success", isEditing ? "Itinerary updated successfully!" : "Itinerary created successfully!");
            console.log("Itinerary saved successfully, refreshing data...");
            await fetchItineraries();
            resetForm();
        } catch (err: any) {
            console.error("Error saving itinerary:", err);

            // Provide more detailed error information
            let errorMessage = "Failed to save itinerary";

            if (err?.message) {
                errorMessage = err.message;
            } else if (err?.code) {
                switch (err.code) {
                    case '23505':
                        errorMessage = "An itinerary with this title already exists";
                        break;
                    case '22001':
                        errorMessage = "Some text fields are too long";
                        break;
                    case '23503':
                        errorMessage = "Referenced destination not found";
                        break;
                    default:
                        errorMessage = `Database error: ${err.code}`;
                }
            }

            showToast("error", errorMessage);
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
        if (!window.confirm("Are you sure you want to delete this itinerary? This will also delete all related days and activities.")) {
            return;
        }

        try {
            setIsLoading(true);

            // Delete related data in the correct order
            // First, delete activities
            const { data: days } = await supabase
                .from("itinerary_days")
                .select("id")
                .eq("itinerary_id", id);

            if (days && days.length > 0) {
                const dayIds = days.map(day => day.id);
                await supabase
                    .from("itinerary_activities")
                    .delete()
                    .in("itinerary_day_id", dayIds);
            }

            // Then delete days
            await supabase
                .from("itinerary_days")
                .delete()
                .eq("itinerary_id", id);

            // Delete destination relations
            await supabase
                .from("itinerary_destinations")
                .delete()
                .eq("itinerary_id", id);

            // Finally, delete the itinerary
            const { error } = await supabase
                .from("itineraries")
                .delete()
                .eq("id", id);

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
        setNewDay({
            day: 1,
            title: "",
            description: "",
            activities: [],
            accommodation: "",
            meals: "",
            transportation: "",
        });
        setNewActivity({
            time: "",
            title: "",
            description: "",
            location: "",
        });
        setIsEditing(false);
        setShowForm(false);
        setSelectedDestination("");
    };

    // Handlers for days and activities
    const handleAddDay = () => {
        if (newDay.title && newDay.description) {
            const day: ItineraryDay = {
                day: (formData.days?.length || 0) + 1,
                title: newDay.title,
                description: newDay.description,
                activities: newDay.activities || [],
                accommodation: newDay.accommodation || "",
                meals: newDay.meals || "",
                transportation: newDay.transportation || "",
            };

            setFormData({
                ...formData,
                days: [...(formData.days || []), day],
            });

            setNewDay({
                day: 1,
                title: "",
                description: "",
                activities: [],
                accommodation: "",
                meals: "",
                transportation: "",
            });
        }
    };

    const handleRemoveDay = (index: number) => {
        const updatedDays = [...(formData.days || [])];
        updatedDays.splice(index, 1);
        // Re-number the remaining days
        updatedDays.forEach((day, i) => {
            day.day = i + 1;
        });
        setFormData({
            ...formData,
            days: updatedDays,
        });
    };

    const handleAddActivity = (dayIndex: number) => {
        if (newActivity.title && newActivity.time) {
            const updatedDays = [...(formData.days || [])];
            if (updatedDays[dayIndex]) {
                updatedDays[dayIndex].activities.push({
                    time: newActivity.time,
                    title: newActivity.title,
                    description: newActivity.description,
                    location: newActivity.location,
                });
                setFormData({
                    ...formData,
                    days: updatedDays,
                });
                setNewActivity({
                    time: "",
                    title: "",
                    description: "",
                    location: "",
                });
            }
        }
    };

    const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
        const updatedDays = [...(formData.days || [])];
        if (updatedDays[dayIndex]) {
            updatedDays[dayIndex].activities.splice(activityIndex, 1);
            setFormData({
                ...formData,
                days: updatedDays,
            });
        }
    };

    const handleDayInputChange = (
        field: keyof ItineraryDay,
        value: string
    ) => {
        setNewDay({
            ...newDay,
            [field]: value,
        });
    };

    const handleActivityInputChange = (
        field: keyof typeof newActivity,
        value: string
    ) => {
        setNewActivity({
            ...newActivity,
            [field]: value,
        });
    };

    const difficultyOptions = ["easy", "moderate", "challenging"];

    // Utility function to truncate text to fit database constraints
    const truncateText = (text: string, maxLength: number): string => {
        if (!text) return text;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    };

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
                        className={`px-4 py-2 rounded-md ${showForm
                            ? "bg-gray-500 hover:bg-gray-600"
                            : "bg-teal-500 hover:bg-teal-600"
                            } text-white font-medium transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""
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
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({(formData.title || "").length}/255 characters)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title || ""}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={255}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter itinerary title"
                                    />
                                    {(formData.title || "").length > 252 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Text will be truncated to 255 characters when saved
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration <span className="text-red-500">*</span>
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({(formData.duration || "").length}/255 characters)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration || ""}
                                        onChange={handleInputChange}
                                        required
                                        maxLength={255}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., 7 days, 3 weeks"
                                    />
                                    {(formData.duration || "").length > 252 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Text will be truncated to 255 characters when saved
                                        </p>
                                    )}
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
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({(formData.bestSeason || "").length}/255 characters)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bestSeason"
                                        value={formData.bestSeason || ""}
                                        onChange={handleInputChange}
                                        maxLength={255}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., April to October"
                                    />
                                    {(formData.bestSeason || "").length > 252 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Text will be truncated to 255 characters when saved
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estimated Budget
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({(formData.estimatedBudget || "").length}/255 characters)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="estimatedBudget"
                                        value={formData.estimatedBudget || ""}
                                        onChange={handleInputChange}
                                        maxLength={255}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., $800-1200"
                                    />
                                    {(formData.estimatedBudget || "").length > 252 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Text will be truncated to 255 characters when saved
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Image URL
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({(formData.imageUrl || "").length}/255 characters)
                                        </span>
                                    </label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl || ""}
                                        onChange={handleInputChange}
                                        maxLength={255}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {(formData.imageUrl || "").length > 252 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Text will be truncated to 255 characters when saved
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-500 ml-1">
                                        ({(formData.description || "").length} characters)
                                    </span>
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Note: Description field has no character limit
                                </p>
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

                            {/* Itinerary Days */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Itinerary Days
                                </label>

                                {/* Add New Day Form */}
                                <div className="bg-gray-100 p-4 rounded-md mb-4">
                                    <h4 className="font-medium text-gray-900 mb-3">Add New Day</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Day Title <span className="text-red-500">*</span>
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({(newDay.title || "").length}/255 characters)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newDay.title || ""}
                                                onChange={(e) => handleDayInputChange("title", e.target.value)}
                                                maxLength={255}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Arrival in Bali"
                                            />
                                            {(newDay.title || "").length > 252 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    ⚠️ Text will be truncated to 255 characters when saved
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Accommodation
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({(newDay.accommodation || "").length}/255 characters)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newDay.accommodation || ""}
                                                onChange={(e) => handleDayInputChange("accommodation", e.target.value)}
                                                maxLength={255}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Beach Resort Hotel"
                                            />
                                            {(newDay.accommodation || "").length > 252 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    ⚠️ Text will be truncated to 255 characters when saved
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Meals
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({(newDay.meals || "").length}/255 characters)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newDay.meals || ""}
                                                onChange={(e) => handleDayInputChange("meals", e.target.value)}
                                                maxLength={255}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Breakfast, Lunch, Dinner"
                                            />
                                            {(newDay.meals || "").length > 252 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    ⚠️ Text will be truncated to 255 characters when saved
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Transportation
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({(newDay.transportation || "").length}/255 characters)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newDay.transportation || ""}
                                                onChange={(e) => handleDayInputChange("transportation", e.target.value)}
                                                maxLength={255}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                placeholder="e.g., Private car, Bus"
                                            />
                                            {(newDay.transportation || "").length > 252 && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    ⚠️ Text will be truncated to 255 characters when saved
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Day Description <span className="text-red-500">*</span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({(newDay.description || "").length} characters)
                                            </span>
                                        </label>
                                        <textarea
                                            value={newDay.description || ""}
                                            onChange={(e) => handleDayInputChange("description", e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Describe the day's activities and highlights"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Note: Description field has no character limit
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddDay}
                                        disabled={!newDay.title || !newDay.description}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Day
                                    </button>
                                </div>

                                {/* Existing Days */}
                                {formData.days && formData.days.length > 0 && (
                                    <div className="space-y-4">
                                        {formData.days.map((day, dayIndex) => (
                                            <div key={dayIndex} className="border border-gray-200 rounded-md p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h5 className="font-medium text-gray-900">
                                                        Day {day.day}: {day.title}
                                                    </h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDay(dayIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove Day
                                                    </button>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3">{day.description}</p>

                                                {(day.accommodation || day.meals || day.transportation) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm">
                                                        {day.accommodation && (
                                                            <div><strong>Accommodation:</strong> {day.accommodation}</div>
                                                        )}
                                                        {day.meals && (
                                                            <div><strong>Meals:</strong> {day.meals}</div>
                                                        )}
                                                        {day.transportation && (
                                                            <div><strong>Transportation:</strong> {day.transportation}</div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Activities for this day */}
                                                <div className="mt-4">
                                                    <h6 className="font-medium text-gray-800 mb-2">Activities</h6>

                                                    {/* Add Activity Form */}
                                                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <input
                                                                    type="time"
                                                                    value={newActivity.time}
                                                                    onChange={(e) => handleActivityInputChange("time", e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                                    placeholder="Time"
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={newActivity.title}
                                                                    onChange={(e) => handleActivityInputChange("title", e.target.value)}
                                                                    maxLength={255}
                                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                                    placeholder="Activity title"
                                                                />
                                                                {newActivity.title.length > 252 && (
                                                                    <p className="text-xs text-amber-600 mt-1">
                                                                        ⚠️ Text will be truncated to 255 characters when saved
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={newActivity.location}
                                                                    onChange={(e) => handleActivityInputChange("location", e.target.value)}
                                                                    maxLength={255}
                                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                                    placeholder="Location"
                                                                />
                                                                {newActivity.location.length > 252 && (
                                                                    <p className="text-xs text-amber-600 mt-1">
                                                                        ⚠️ Text will be truncated to 255 characters when saved
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={newActivity.description}
                                                                    onChange={(e) => handleActivityInputChange("description", e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-md"
                                                                    placeholder="Activity description"
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Note: Description field has no character limit
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddActivity(dayIndex)}
                                                            disabled={!newActivity.title || !newActivity.time}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                        >
                                                            Add Activity
                                                        </button>
                                                    </div>

                                                    {/* Existing Activities */}
                                                    {day.activities && day.activities.length > 0 && (
                                                        <div className="space-y-2">
                                                            {day.activities.map((activity, activityIndex) => (
                                                                <div key={activityIndex} className="flex justify-between items-center bg-white p-2 rounded-md border">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="font-medium text-blue-600">{activity.time}</span>
                                                                            <span className="font-medium">{activity.title}</span>
                                                                            {activity.location && (
                                                                                <span className="text-gray-500">at {activity.location}</span>
                                                                            )}
                                                                        </div>
                                                                        {activity.description && (
                                                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveActivity(dayIndex, activityIndex)}
                                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
                                            <span>Days: {itinerary.days?.length || 0}</span>
                                            <span>
                                                Destinations: {itinerary.destinations.map(slug => {
                                                    const destination = allDestinations.find(dest => dest.slug === slug);
                                                    return destination ? destination.name : slug;
                                                }).join(", ")}
                                            </span>
                                        </div>

                                        {/* Days Preview */}
                                        {itinerary.days && itinerary.days.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Itinerary Preview:</h4>
                                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                                    {itinerary.days.slice(0, 3).map((day, index) => (
                                                        <div key={index} className="text-xs text-gray-600">
                                                            <span className="font-medium">Day {day.day}:</span> {day.title}
                                                            {day.activities && day.activities.length > 0 && (
                                                                <span className="ml-2 text-blue-600">
                                                                    ({day.activities.length} activities)
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {itinerary.days.length > 3 && (
                                                        <div className="text-xs text-gray-500 italic">
                                                            ... and {itinerary.days.length - 3} more days
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
