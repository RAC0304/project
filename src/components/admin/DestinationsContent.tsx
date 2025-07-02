import React, { useState, useEffect, useCallback } from "react";
import { Destination, Attraction, Activity } from "../../types";
import type { DestinationCategory } from "../../types";
import Toast, { ToastType } from "../common/Toast";
import { supabase } from "../../config/supabaseClient";

const DestinationsContent: React.FC = () => {
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentDestination, setCurrentDestination] =
    useState<Destination | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [formData, setFormData] = useState<Partial<Destination>>({
    id: "", // Keep empty for new destinations
    name: "",
    location: "",
    description: "",
    shortDescription: "",
    imageUrl: "",
    images: [],
    attractions: [],
    activities: [],
    bestTimeToVisit: "",
    travelTips: [],
    category: [],
    googleMapsUrl: "",
  });

  // Temporary states for dynamic fields
  const [newImage, setNewImage] = useState("");
  const [newTravelTip, setNewTravelTip] = useState("");
  const [newAttraction, setNewAttraction] = useState<Partial<Attraction>>({
    id: "",
    name: "",
    description: "",
    imageUrl: "",
  });
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    id: "",
    name: "",
    description: "",
    duration: "",
    price: "",
    imageUrl: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<
    DestinationCategory[]
  >([]);

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    type: "success" as ToastType,
    message: "",
  });
  // Function to fetch destinations from Supabase
  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch destinations
      const { data: destinations, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching destinations:", error.message);
        showToast("error", `Failed to fetch destinations: ${error.message}`);
        setAllDestinations([]);
        return;
      }

      if (!destinations || destinations.length === 0) {
        setAllDestinations([]);
        return;
      }

      // For each destination, fetch related data
      const destinationsWithDetails = await Promise.all(
        destinations.map(async (dest) => {
          // Fetch images
          const { data: images } = await supabase
            .from("destination_images")
            .select("image_url")
            .eq("destination_id", dest.id);

          // Fetch attractions
          const { data: attractionsData } = await supabase
            .from("attractions")
            .select("id, name, description, image_url")
            .eq("destination_id", dest.id);

          // Map attractions to match our frontend model
          const mappedAttractions = attractionsData
            ? attractionsData.map((attr) => ({
                id: attr.id.toString(),
                name: attr.name,
                description: attr.description,
                imageUrl: attr.image_url || "",
              }))
            : [];

          // Fetch activities
          const { data: activitiesData } = await supabase
            .from("activities")
            .select("id, name, description, duration, price, image_url")
            .eq("destination_id", dest.id);

          // Map activities to match our frontend model
          const mappedActivities = activitiesData
            ? activitiesData.map((act) => ({
                id: act.id.toString(),
                name: act.name,
                description: act.description,
                duration: act.duration || "",
                price: act.price || "",
                imageUrl: act.image_url || "",
              }))
            : [];

          // Fetch travel tips
          const { data: travelTips } = await supabase
            .from("travel_tips")
            .select("tip")
            .eq("destination_id", dest.id);

          // Fetch categories
          const { data: categories } = await supabase
            .from("destination_categories")
            .select("category")
            .eq("destination_id", dest.id);

          // Map to our frontend model
          return {
            id: dest.id.toString(),
            name: dest.name,
            location: dest.location,
            description: dest.description,
            shortDescription: dest.short_description || "",
            imageUrl: dest.image_url || "",
            images: images ? images.map((img) => img.image_url) : [],
            attractions: mappedAttractions,
            activities: mappedActivities,
            bestTimeToVisit: dest.best_time_to_visit || "",
            travelTips: travelTips ? travelTips.map((tip) => tip.tip) : [],
            category: categories
              ? categories.map((cat) => cat.category as DestinationCategory)
              : [],
            googleMapsUrl: dest.google_maps_url || "",
            reviews: [],
          } as Destination;
        })
      );

      setAllDestinations(destinationsWithDetails);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      showToast("error", "Failed to load destinations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Load destinations on component mount
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);
  useEffect(() => {
    if (currentDestination) {
      setFormData({
        id: currentDestination.id || "",
        name: currentDestination.name || "",
        location: currentDestination.location || "",
        description: currentDestination.description || "",
        shortDescription: currentDestination.shortDescription || "",
        imageUrl: currentDestination.imageUrl || "",
        images: [...(currentDestination.images || [])],
        attractions: [...(currentDestination.attractions || [])],
        activities: [...(currentDestination.activities || [])],
        bestTimeToVisit: currentDestination.bestTimeToVisit || "",
        travelTips: [...(currentDestination.travelTips || [])],
        category: [...(currentDestination.category || [])],
        googleMapsUrl: currentDestination.googleMapsUrl || "",
      });
      setSelectedCategories([...(currentDestination.category || [])]);
    }
  }, [currentDestination]);

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

  const filteredDestinations = allDestinations.filter(
    (destination) =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Helper function to check field length and show warnings
  const getFieldWarning = (
    fieldName: string,
    value: string | undefined,
    maxLength: number
  ) => {
    if (!value) return null;

    const length = value.length;
    if (length > maxLength) {
      return `Peringatan: ${fieldName} melebihi batas ${maxLength} karakter (saat ini: ${length} karakter). Data akan dipotong saat disimpan.`;
    } else if (length > maxLength * 0.9) {
      return `Peringatan: ${fieldName} mendekati batas ${maxLength} karakter (saat ini: ${length} karakter).`;
    }
    return null;
  };

  // Helper function to get character count display
  const getCharacterCount = (
    value: string | undefined,
    maxLength: number
  ): { count: string; className: string } => {
    if (!value) return { count: `0/${maxLength}`, className: "text-gray-500" };
    const length = value.length;
    const className =
      length > maxLength
        ? "text-red-600 font-medium"
        : length > maxLength * 0.9
        ? "text-amber-600"
        : "text-gray-500";
    return { count: `${length}/${maxLength}`, className };
  };

  const handleAddImage = () => {
    if (newImage && !formData.images?.includes(newImage)) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), newImage],
      });
      setNewImage("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...(formData.images || [])];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleAddTravelTip = () => {
    if (newTravelTip && !formData.travelTips?.includes(newTravelTip)) {
      setFormData({
        ...formData,
        travelTips: [...(formData.travelTips || []), newTravelTip],
      });
      setNewTravelTip("");
    }
  };

  const handleRemoveTravelTip = (index: number) => {
    const updatedTips = [...(formData.travelTips || [])];
    updatedTips.splice(index, 1);
    setFormData({
      ...formData,
      travelTips: updatedTips,
    });
  };

  const handleAttractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAttraction({
      ...newAttraction,
      [name]: value,
    });
  };

  const handleAddAttraction = () => {
    if (newAttraction.name && newAttraction.description) {
      // Use timestamp for temporary ID since this will be replaced when saved to database
      const attractionId = `temp-attraction-${Date.now()}`;
      const attractionToAdd = {
        ...newAttraction,
        id: attractionId,
      } as Attraction;

      setFormData({
        ...formData,
        attractions: [...(formData.attractions || []), attractionToAdd],
      });

      setNewAttraction({ id: "", name: "", description: "", imageUrl: "" });
    }
  };

  const handleRemoveAttraction = (index: number) => {
    const updatedAttractions = [...(formData.attractions || [])];
    updatedAttractions.splice(index, 1);
    setFormData({
      ...formData,
      attractions: updatedAttractions,
    });
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewActivity({
      ...newActivity,
      [name]: value,
    });
  };

  const handleAddActivity = () => {
    if (newActivity.name && newActivity.description && newActivity.duration) {
      // Use timestamp for temporary ID since this will be replaced when saved to database
      const activityId = `temp-activity-${Date.now()}`;
      const activityToAdd = {
        ...newActivity,
        id: activityId,
      } as Activity;

      setFormData({
        ...formData,
        activities: [...(formData.activities || []), activityToAdd],
      });

      setNewActivity({
        id: "",
        name: "",
        description: "",
        duration: "",
        price: "",
        imageUrl: "",
      });
    }
  };

  const handleRemoveActivity = (index: number) => {
    const updatedActivities = [...(formData.activities || [])];
    updatedActivities.splice(index, 1);
    setFormData({
      ...formData,
      activities: updatedActivities,
    });
  };

  const handleCategoryToggle = (category: DestinationCategory) => {
    let updatedCategories;

    if (selectedCategories.includes(category)) {
      updatedCategories = selectedCategories.filter((c) => c !== category);
    } else {
      updatedCategories = [...selectedCategories, category];
    }

    setSelectedCategories(updatedCategories);
    setFormData({
      ...formData,
      category: updatedCategories,
    });
  };

  // Helper function to truncate string to max length
  const truncateString = (
    str: string | undefined,
    maxLength: number
  ): string => {
    if (!str) return "";
    const trimmed = str.trim();
    return trimmed.length > maxLength
      ? trimmed.substring(0, maxLength).trim()
      : trimmed;
  };

  // Helper functions for handling related entities in Supabase
  const handleUpdateRelatedEntities = async (destinationId: number) => {
    try {
      console.log(
        "Updating related entities for destination ID:",
        destinationId
      );

      // Handle attractions - first delete existing
      const { error: deleteAttractionsError } = await supabase
        .from("attractions")
        .delete()
        .eq("destination_id", destinationId);

      if (deleteAttractionsError) {
        console.error(
          "Error deleting existing attractions:",
          deleteAttractionsError
        );
        throw deleteAttractionsError;
      }

      // Add new attractions
      if (formData.attractions && formData.attractions.length > 0) {
        const attractionsToInsert = formData.attractions
          .filter((attraction) => attraction.name && attraction.description) // Filter out invalid attractions
          .map((attraction) => ({
            destination_id: destinationId,
            name: truncateString(attraction.name, 255),
            description: truncateString(attraction.description, 255),
            image_url: attraction.imageUrl
              ? truncateString(attraction.imageUrl, 255)
              : null,
          }));

        if (attractionsToInsert.length > 0) {
          console.log("Inserting attractions:", attractionsToInsert);
          const { error: insertAttractionsError } = await supabase
            .from("attractions")
            .insert(attractionsToInsert);

          if (insertAttractionsError) {
            console.error(
              "Error inserting attractions:",
              insertAttractionsError
            );
            throw insertAttractionsError;
          }
        }
      }

      // Handle activities - first delete existing
      const { error: deleteActivitiesError } = await supabase
        .from("activities")
        .delete()
        .eq("destination_id", destinationId);

      if (deleteActivitiesError) {
        console.error(
          "Error deleting existing activities:",
          deleteActivitiesError
        );
        throw deleteActivitiesError;
      }

      // Add new activities
      if (formData.activities && formData.activities.length > 0) {
        const activitiesToInsert = formData.activities
          .filter(
            (activity) =>
              activity.name && activity.description && activity.duration
          ) // Filter out invalid activities
          .map((activity) => ({
            destination_id: destinationId,
            name: truncateString(activity.name, 255),
            description: truncateString(activity.description, 255),
            duration: truncateString(activity.duration, 255),
            price: activity.price ? truncateString(activity.price, 255) : null,
            image_url: activity.imageUrl
              ? truncateString(activity.imageUrl, 255)
              : null,
          }));

        if (activitiesToInsert.length > 0) {
          console.log("Inserting activities:", activitiesToInsert);
          const { error: insertActivitiesError } = await supabase
            .from("activities")
            .insert(activitiesToInsert);

          if (insertActivitiesError) {
            console.error("Error inserting activities:", insertActivitiesError);
            throw insertActivitiesError;
          }
        }
      }

      // Handle categories - first delete existing
      const { error: deleteCategoriesError } = await supabase
        .from("destination_categories")
        .delete()
        .eq("destination_id", destinationId);

      if (deleteCategoriesError) {
        console.error(
          "Error deleting existing categories:",
          deleteCategoriesError
        );
        throw deleteCategoriesError;
      }

      // Add new categories
      if (selectedCategories && selectedCategories.length > 0) {
        const categoriesToInsert = selectedCategories
          .filter((category) => category && category.trim().length > 0) // Filter out invalid categories
          .map((category) => ({
            destination_id: destinationId,
            category: truncateString(category, 255),
          }));

        if (categoriesToInsert.length > 0) {
          console.log("Inserting categories:", categoriesToInsert);
          const { error: insertCategoriesError } = await supabase
            .from("destination_categories")
            .insert(categoriesToInsert);

          if (insertCategoriesError) {
            console.error("Error inserting categories:", insertCategoriesError);
            throw insertCategoriesError;
          }
        }
      }

      console.log("Successfully updated all related entities");
    } catch (error) {
      console.error("Error updating related entities:", error);
      throw error;
    }
  };

  const handleCreateRelatedEntities = async (destinationId: number) => {
    try {
      console.log(
        "Creating related entities for destination ID:",
        destinationId
      );

      // Add attractions
      if (formData.attractions && formData.attractions.length > 0) {
        const attractionsToInsert = formData.attractions
          .filter((attraction) => attraction.name && attraction.description) // Filter out invalid attractions
          .map((attraction) => ({
            destination_id: destinationId,
            name: truncateString(attraction.name, 255),
            description: truncateString(attraction.description, 255),
            image_url: attraction.imageUrl
              ? truncateString(attraction.imageUrl, 255)
              : null,
          }));

        if (attractionsToInsert.length > 0) {
          console.log("Creating attractions:", attractionsToInsert);
          const { error: insertAttractionsError } = await supabase
            .from("attractions")
            .insert(attractionsToInsert);

          if (insertAttractionsError) {
            console.error(
              "Error creating attractions:",
              insertAttractionsError
            );
            throw insertAttractionsError;
          }
        }
      }

      // Add activities
      if (formData.activities && formData.activities.length > 0) {
        const activitiesToInsert = formData.activities
          .filter(
            (activity) =>
              activity.name && activity.description && activity.duration
          ) // Filter out invalid activities
          .map((activity) => ({
            destination_id: destinationId,
            name: truncateString(activity.name, 255),
            description: truncateString(activity.description, 255),
            duration: truncateString(activity.duration, 255),
            price: activity.price ? truncateString(activity.price, 255) : null,
            image_url: activity.imageUrl
              ? truncateString(activity.imageUrl, 255)
              : null,
          }));

        if (activitiesToInsert.length > 0) {
          console.log("Creating activities:", activitiesToInsert);
          const { error: insertActivitiesError } = await supabase
            .from("activities")
            .insert(activitiesToInsert);

          if (insertActivitiesError) {
            console.error("Error creating activities:", insertActivitiesError);
            throw insertActivitiesError;
          }
        }
      }

      // Add categories
      if (selectedCategories && selectedCategories.length > 0) {
        const categoriesToInsert = selectedCategories
          .filter((category) => category && category.trim().length > 0) // Filter out invalid categories
          .map((category) => ({
            destination_id: destinationId,
            category: truncateString(category, 255),
          }));

        if (categoriesToInsert.length > 0) {
          console.log("Creating categories:", categoriesToInsert);
          const { error: insertCategoriesError } = await supabase
            .from("destination_categories")
            .insert(categoriesToInsert);

          if (insertCategoriesError) {
            console.error("Error creating categories:", insertCategoriesError);
            throw insertCategoriesError;
          }
        }
      }

      console.log("Successfully created all related entities");
    } catch (error) {
      console.error("Error creating related entities:", error);
      throw error;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validations
      if (!formData.name || !formData.location || !formData.description) {
        showToast("error", "Please fill all required fields");
        setIsLoading(false);
        return;
      }

      // Additional validations for data integrity
      if (formData.name && formData.name.trim().length === 0) {
        showToast("error", "Name cannot be empty or just whitespace");
        setIsLoading(false);
        return;
      }

      if (formData.location && formData.location.trim().length === 0) {
        showToast("error", "Location cannot be empty or just whitespace");
        setIsLoading(false);
        return;
      }

      if (formData.description && formData.description.trim().length === 0) {
        showToast("error", "Description cannot be empty or just whitespace");
        setIsLoading(false);
        return;
      }

      // Validate URLs if provided
      if (formData.imageUrl && formData.imageUrl.trim() !== "") {
        try {
          new URL(formData.imageUrl.trim());
        } catch {
          showToast("error", "Please enter a valid Image URL");
          setIsLoading(false);
          return;
        }
      }

      if (formData.googleMapsUrl && formData.googleMapsUrl.trim() !== "") {
        try {
          new URL(formData.googleMapsUrl.trim());
        } catch {
          showToast("error", "Please enter a valid Google Maps URL");
          setIsLoading(false);
          return;
        }
      }

      // Check for field length warnings and show confirmation
      const warnings = [];
      if (formData.name && formData.name.length > 255) {
        warnings.push(
          `Name (${formData.name.length} characters, akan dipotong menjadi 255)`
        );
      }
      if (formData.location && formData.location.length > 255) {
        warnings.push(
          `Location (${formData.location.length} characters, akan dipotong menjadi 255)`
        );
      }
      if (formData.imageUrl && formData.imageUrl.length > 255) {
        warnings.push(
          `Image URL (${formData.imageUrl.length} characters, akan dipotong menjadi 255)`
        );
      }
      if (formData.bestTimeToVisit && formData.bestTimeToVisit.length > 255) {
        warnings.push(
          `Best Time to Visit (${formData.bestTimeToVisit.length} characters, akan dipotong menjadi 255)`
        );
      }

      if (warnings.length > 0) {
        const confirmMessage = `Peringatan: Field berikut melebihi batas 255 karakter:\n\n${warnings.join(
          "\n"
        )}\n\nData akan dipotong secara otomatis. Lanjutkan simpan?`;
        if (!window.confirm(confirmMessage)) {
          setIsLoading(false);
          return;
        }
      }

      console.log(
        "Form submission - isEditing:",
        isEditing,
        "formData.id:",
        formData.id
      );
      console.log("Full formData:", formData);

      if (isEditing && formData.id) {
        // Update existing destination
        const destinationId = parseInt(formData.id);
        console.log("Updating destination with ID:", destinationId);

        // Helper function to truncate string to max length
        const truncateString = (
          str: string | undefined,
          maxLength: number
        ): string => {
          if (!str) return "";
          const trimmed = str.trim();
          return trimmed.length > maxLength
            ? trimmed.substring(0, maxLength).trim()
            : trimmed;
        };

        // Validate and prepare update data
        const updateData = {
          name: truncateString(formData.name, 255),
          location: truncateString(formData.location, 255),
          description: formData.description?.trim() || "", // TEXT field, no limit
          short_description: formData.shortDescription?.trim() || null, // TEXT field, no limit
          image_url: truncateString(formData.imageUrl, 255),
          best_time_to_visit: truncateString(formData.bestTimeToVisit, 255),
          google_maps_url: formData.googleMapsUrl?.trim() || null, // TEXT field, no limit
          updated_at: new Date().toISOString(),
        };

        // Final validation - ensure required fields are not empty after processing
        if (
          !updateData.name ||
          !updateData.location ||
          !updateData.description
        ) {
          throw new Error("Required fields cannot be empty after processing");
        }

        const { error: destError } = await supabase
          .from("destinations")
          .update(updateData)
          .eq("id", destinationId);

        if (destError) throw destError; // Handle images - first remove existing
        const { error: deleteImagesError } = await supabase
          .from("destination_images")
          .delete()
          .eq("destination_id", destinationId);

        if (deleteImagesError) throw deleteImagesError;

        // Add new images
        if (formData.images && formData.images.length > 0) {
          const imagesToInsert = formData.images
            .filter((imageUrl) => imageUrl && imageUrl.trim().length > 0) // Filter out empty URLs
            .map((imageUrl) => ({
              destination_id: destinationId,
              image_url: imageUrl.trim(),
            }));

          if (imagesToInsert.length > 0) {
            const { error: insertImagesError } = await supabase
              .from("destination_images")
              .insert(imagesToInsert);

            if (insertImagesError) throw insertImagesError;
          }
        } // Handle travel tips - first delete existing
        const { error: deleteTipsError } = await supabase
          .from("travel_tips")
          .delete()
          .eq("destination_id", destinationId);

        if (deleteTipsError) throw deleteTipsError;

        // Add new travel tips
        if (formData.travelTips && formData.travelTips.length > 0) {
          const tipsToInsert = formData.travelTips
            .filter((tip) => tip && tip.trim().length > 0) // Filter out empty tips
            .map((tip) => ({
              destination_id: destinationId,
              tip: tip.trim(),
            }));

          if (tipsToInsert.length > 0) {
            const { error: insertTipsError } = await supabase
              .from("travel_tips")
              .insert(tipsToInsert);

            if (insertTipsError) throw insertTipsError;
          }
        }

        // Similar logic for attractions, activities, categories
        try {
          await handleUpdateRelatedEntities(destinationId);
          showToast("success", "Destination updated successfully!");
        } catch (relatedEntitiesError) {
          console.error(
            "Error updating related entities:",
            relatedEntitiesError
          );
          // Even if related entities failed, the main destination was updated
          showToast(
            "warning",
            "Destination updated, but some related data (attractions/activities/categories) could not be saved. Please try editing again."
          );
        }
      } else {
        // Create new destination - generate slug from name
        console.log("Creating new destination");
        const slug = (formData.name || "")
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .replace(/-+/g, "-") // Replace multiple dashes with single dash
          .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes

        console.log("Generated slug:", slug);

        if (!slug || slug.length === 0) {
          throw new Error(
            "Could not create a valid slug from the destination name. Please use alphanumeric characters."
          );
        }

        // Check if slug is too long (database limit is 100 characters)
        if (slug.length > 100) {
          throw new Error(
            `Generated slug is too long (${slug.length} characters). Please use a shorter destination name.`
          );
        }

        // Helper function to truncate string to max length
        const truncateString = (
          str: string | undefined,
          maxLength: number
        ): string => {
          if (!str) return "";
          const trimmed = str.trim();
          return trimmed.length > maxLength
            ? trimmed.substring(0, maxLength).trim()
            : trimmed;
        };

        // Validate and prepare data
        const processedData = {
          slug: truncateString(slug, 100), // slug has VARCHAR(100) limit
          name: truncateString(formData.name, 255),
          location: truncateString(formData.location, 255),
          description: formData.description?.trim() || "", // TEXT field, no limit
          short_description: formData.shortDescription?.trim() || null, // TEXT field, no limit
          image_url: truncateString(formData.imageUrl, 255),
          best_time_to_visit: truncateString(formData.bestTimeToVisit, 255),
          google_maps_url: formData.googleMapsUrl?.trim() || null, // TEXT field, no limit
          created_at: new Date().toISOString(),
        };

        // Final validation - ensure required fields are not empty after processing
        if (
          !processedData.name ||
          !processedData.location ||
          !processedData.description
        ) {
          throw new Error("Required fields cannot be empty after processing");
        }

        // Explicitly exclude 'id' field when creating new destination
        // Truncate fields that have 255 character limits in the database
        const insertData = processedData;

        console.log("Insert data:", insertData);

        const { data: newDestination, error: createError } = await supabase
          .from("destinations")
          .insert(insertData)
          .select("id")
          .single();

        if (createError) throw createError;
        if (!newDestination) throw new Error("Failed to create destination");

        const newId = newDestination.id;

        // Handle images
        if (formData.images && formData.images.length > 0) {
          const imagesToInsert = formData.images
            .filter((imageUrl) => imageUrl && imageUrl.trim().length > 0) // Filter out empty URLs
            .map((imageUrl) => ({
              destination_id: newId,
              image_url: imageUrl.trim(),
            }));

          if (imagesToInsert.length > 0) {
            const { error: insertImagesError } = await supabase
              .from("destination_images")
              .insert(imagesToInsert);

            if (insertImagesError) throw insertImagesError;
          }
        }

        // Handle travel tips
        if (formData.travelTips && formData.travelTips.length > 0) {
          const tipsToInsert = formData.travelTips
            .filter((tip) => tip && tip.trim().length > 0) // Filter out empty tips
            .map((tip) => ({
              destination_id: newId,
              tip: tip.trim(),
            }));

          if (tipsToInsert.length > 0) {
            const { error: insertTipsError } = await supabase
              .from("travel_tips")
              .insert(tipsToInsert);

            if (insertTipsError) throw insertTipsError;
          }
        }

        // Handle categories, attractions, activities
        try {
          await handleCreateRelatedEntities(newId);
          showToast("success", "New destination added successfully!");
        } catch (relatedEntitiesError) {
          console.error(
            "Error creating related entities:",
            relatedEntitiesError
          );
          // Even if related entities failed, the main destination was created
          showToast(
            "warning",
            "Destination created, but some related data (attractions/activities/categories) could not be saved. Please try editing to add them."
          );
        }
      }

      // Refresh destinations list
      fetchDestinations();
    } catch (err) {
      console.error("Error saving destination:", err);

      // More detailed error handling
      let errorMessage = "Failed to save destination. Please try again.";

      if (err && typeof err === "object") {
        if ("message" in err) {
          errorMessage = `Error: ${err.message}`;
        }
        if ("details" in err && err.details) {
          errorMessage += ` Details: ${err.details}`;
        }
        if ("hint" in err && err.hint) {
          errorMessage += ` Hint: ${err.hint}`;
        }
        if ("code" in err && err.code) {
          errorMessage += ` (Code: ${err.code})`;
        }
      }

      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }

    // Reset form and states
    resetForm();
  };

  const handleEdit = (destination: Destination) => {
    setCurrentDestination(destination);
    setFormData(destination);
    setSelectedCategories(destination.category || []);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo(0, 0);
  };
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this destination?")) {
      try {
        setIsLoading(true);
        const destinationToDelete = allDestinations.find(
          (dest) => dest.id === id
        );

        const numericId = parseInt(id);

        // Delete all related entities first (due to foreign key constraints)
        const tables = [
          "destination_images",
          "attractions",
          "activities",
          "travel_tips",
          "destination_categories",
          "cultural_insights",
        ];

        // Delete from all related tables
        for (const table of tables) {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("destination_id", numericId);

          if (error) {
            console.error(`Error deleting from ${table}:`, error);
            // Continue with other tables even if one fails
          }
        }

        // Finally delete the destination
        const { error: deleteError } = await supabase
          .from("destinations")
          .delete()
          .eq("id", numericId);

        if (deleteError) {
          throw deleteError;
        }

        // Update local state
        setAllDestinations(
          allDestinations.filter((destination) => destination.id !== id)
        );

        showToast(
          "success",
          `Destination "${destinationToDelete?.name}" deleted successfully!`
        );
      } catch (err) {
        console.error("Error deleting destination:", err);
        showToast("error", "Failed to delete destination. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      location: "",
      description: "",
      shortDescription: "",
      imageUrl: "",
      images: [],
      attractions: [],
      activities: [],
      bestTimeToVisit: "",
      travelTips: [],
      category: [],
      googleMapsUrl: "", // Add this field
    });
    setSelectedCategories([]);
    setCurrentDestination(null);
    setIsEditing(false);
    setShowForm(false);
    setNewImage("");
    setNewTravelTip("");
    setNewAttraction({ id: "", name: "", description: "", imageUrl: "" });
    setNewActivity({
      id: "",
      name: "",
      description: "",
      duration: "",
      price: "",
      imageUrl: "",
    });
  };

  // Define available categories as array since DestinationCategory is a type, not an enum
  const categoryOptions: DestinationCategory[] = [
    "beach",
    "mountain",
    "cultural",
    "adventure",
    "historical",
    "nature",
    "city",
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Destinations Management
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
                <span className="ml-2 text-sm text-gray-600">
                  Processing...
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (showForm) {
                // If form is currently shown, just hide it
                setShowForm(false);
              } else {
                // If showing form, reset everything first
                resetForm();
                setIsEditing(false);
                setCurrentDestination(null);
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
            {showForm ? "Cancel" : "Add New Destination"}
          </button>
        </div>
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search destinations by name or location..."
            className="w-full p-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Form Section */}
        {showForm && (
          <div className="bg-gray-50 p-6 rounded-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? "Edit Destination" : "Add New Destination"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                      <span className="text-xs text-gray-500">
                        (auto-generated, cannot be changed)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      disabled
                      value={formData.id}
                      className="w-full p-2 border border-gray-300 bg-gray-100 text-gray-500 rounded-md"
                    />
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Name*
                    </label>
                    <span
                      className={`text-xs ${
                        getCharacterCount(formData.name, 255).className
                      }`}
                    >
                      {getCharacterCount(formData.name, 255).count}
                    </span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Bali"
                  />
                  {getFieldWarning("Name", formData.name, 255) && (
                    <p className="text-xs text-amber-600 mt-1">
                      {getFieldWarning("Name", formData.name, 255)}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Location*
                    </label>
                    <span
                      className={`text-xs ${
                        getCharacterCount(formData.location, 255).className
                      }`}
                    >
                      {getCharacterCount(formData.location, 255).count}
                    </span>
                  </div>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Bali, Indonesia"
                  />
                  {getFieldWarning("Location", formData.location, 255) && (
                    <p className="text-xs text-amber-600 mt-1">
                      {getFieldWarning("Location", formData.location, 255)}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Main Image URL
                    </label>
                    <span
                      className={`text-xs ${
                        getCharacterCount(formData.imageUrl, 255).className
                      }`}
                    >
                      {getCharacterCount(formData.imageUrl, 255).count}
                    </span>
                  </div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                  {getFieldWarning("Image URL", formData.imageUrl, 255) && (
                    <p className="text-xs text-amber-600 mt-1">
                      {getFieldWarning("Image URL", formData.imageUrl, 255)}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Brief one-liner about the destination"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description*
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Detailed description of the destination"
                  ></textarea>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Best Time to Visit
                    </label>
                    <span
                      className={`text-xs ${
                        getCharacterCount(formData.bestTimeToVisit, 255)
                          .className
                      }`}
                    >
                      {getCharacterCount(formData.bestTimeToVisit, 255).count}
                    </span>
                  </div>
                  <input
                    type="text"
                    name="bestTimeToVisit"
                    value={formData.bestTimeToVisit}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g., April to October"
                  />
                  {getFieldWarning(
                    "Best Time to Visit",
                    formData.bestTimeToVisit,
                    255
                  ) && (
                    <p className="text-xs text-amber-600 mt-1">
                      {getFieldWarning(
                        "Best Time to Visit",
                        formData.bestTimeToVisit,
                        255
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((category) => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedCategories.includes(category)
                            ? "bg-teal-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Images */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Additional Images
                </h4>
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-grow">
                    <input
                      type="url"
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Image URL"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                  >
                    Add
                  </button>
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Additional ${index}`}
                          className="h-24 w-full object-cover rounded-md"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==")
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Travel Tips */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Travel Tips
                </h4>
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={newTravelTip}
                      onChange={(e) => setNewTravelTip(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Add a travel tip"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTravelTip}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                  >
                    Add
                  </button>
                </div>

                {formData.travelTips && formData.travelTips.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {formData.travelTips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span>{tip}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTravelTip(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Attractions */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Attractions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    name="name"
                    value={newAttraction.name}
                    onChange={handleAttractionChange}
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="Attraction Name"
                  />
                  <input
                    type="text"
                    name="description"
                    value={newAttraction.description}
                    onChange={handleAttractionChange}
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="Attraction Description"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      name="imageUrl"
                      value={newAttraction.imageUrl}
                      onChange={handleAttractionChange}
                      className="flex-grow p-2 border border-gray-300 rounded-md"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttraction}
                      className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {formData.attractions && formData.attractions.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {formData.attractions.map((attraction, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex gap-3 items-center">
                          {attraction.imageUrl && (
                            <img
                              src={attraction.imageUrl}
                              alt={attraction.name}
                              className="h-10 w-10 object-cover rounded-md"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=")
                              }
                            />
                          )}
                          <div>
                            <div className="font-medium">{attraction.name}</div>
                            <div className="text-sm text-gray-600">
                              {attraction.description}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttraction(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activities */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Activities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <input
                    type="text"
                    name="name"
                    value={newActivity.name}
                    onChange={handleActivityChange}
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="Activity Name"
                  />
                  <input
                    type="text"
                    name="description"
                    value={newActivity.description}
                    onChange={handleActivityChange}
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="Activity Description"
                  />
                  <input
                    type="text"
                    name="duration"
                    value={newActivity.duration}
                    onChange={handleActivityChange}
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="Duration (e.g., 2 hours)"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    name="price"
                    value={newActivity.price}
                    onChange={handleActivityChange}
                    className="p-2 border border-gray-300 rounded-md"
                    placeholder="Price (e.g., $50 per person)"
                  />
                  <div className="flex items-center gap-2 md:col-span-2">
                    <input
                      type="url"
                      name="imageUrl"
                      value={newActivity.imageUrl}
                      onChange={handleActivityChange}
                      className="flex-grow p-2 border border-gray-300 rounded-md"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {formData.activities && formData.activities.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {formData.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex gap-3 items-center">
                          {activity.imageUrl && (
                            <img
                              src={activity.imageUrl}
                              alt={activity.name}
                              className="h-10 w-10 object-cover rounded-md"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=")
                              }
                            />
                          )}
                          <div>
                            <div className="font-medium">{activity.name}</div>
                            <div className="text-sm text-gray-600">
                              {activity.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.duration} • {activity.price}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="border-t pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={isLoading}
                  className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                  )}
                  {isEditing ? "Update Destination" : "Add Destination"}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Destinations List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            All Destinations ({filteredDestinations.length})
          </h3>
          <div className="overflow-x-auto">
            {isLoading && allDestinations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-teal-500 mb-4"
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
                <p className="text-gray-500">Loading destinations...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Destination
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
                      Categories
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Attractions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Activities
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
                  {filteredDestinations.length > 0 ? (
                    filteredDestinations.map((destination) => (
                      <tr key={destination.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={destination.imageUrl}
                                alt={destination.name}
                                onError={(e) =>
                                  (e.currentTarget.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvcjwvdGV4dD48L3N2Zz4=")
                                }
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {destination.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {destination.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {destination.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {destination.category &&
                          destination.category.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {destination.category.map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded-full bg-teal-100 text-blue-800"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {destination.attractions?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {destination.activities?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(destination)}
                            disabled={isLoading}
                            className={`text-blue-600 hover:text-blue-900 mr-4 ${
                              isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(destination.id)}
                            disabled={isLoading}
                            className={`text-red-600 hover:text-red-900 ${
                              isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No destinations match your search criteria."
                          : "No destinations available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};

export default DestinationsContent;
