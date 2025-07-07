import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Mail,
  MapPin,
  Settings,
  Camera,
  LogOut,
  Database,
  Phone,
  Users,
  Globe,
} from "lucide-react";
import { useEnhancedAuth } from "../contexts/useEnhancedAuth";
import RoleBadge from "../components/common/RoleBadge";
import TimezoneInfo from "../components/common/TimezoneInfo";
import { formatIndonesianDate } from "../utils/dateUtils";
import { getUserAccountStats } from "../services/userStatsService";
import BookingStatusTabs from "../components/customer/BookingStatusTabs";
import TripRequestsNotification from "../components/user/TripRequestsNotification";
import {
  userActivityService,
  type ActivityItem,
} from "../services/userActivityService";
import AllActivitiesModal from "../components/AllActivitiesModal";
import PaymentModal from "../components/PaymentModal";
import { chatService, ChatMessage } from "../services/chatService";

const UserProfilePage: React.FC = () => {
  const { user, logout, updateProfile } = useEnhancedAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(user?.profile || null); // Add state for user-level fields
  const [editedUserFields, setEditedUserFields] = useState({
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
  });

  // Update editedUserFields whenever user object changes
  useEffect(() => {
    if (user) {
      setEditedUserFields({
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      });
    }
  }, [user]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    user?.profile?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "default"
    }`
  );

  // Ensure profile image loads properly from Supabase
  useEffect(() => {
    if (user?.profile?.avatar) {
      // If avatar is a Supabase URL, update it with current timestamp to avoid caching issues
      if (user.profile.avatar.includes("supabase")) {
        const timestamp = new Date().getTime();
        const updatedUrl = user.profile.avatar.includes("?")
          ? `${user.profile.avatar}&_t=${timestamp}`
          : `${user.profile.avatar}?_t=${timestamp}`;
        setProfileImage(updatedUrl);
      } else {
        setProfileImage(user.profile.avatar);
      }
    }
  }, [user?.profile?.avatar]);

  // Statistik akun user
  const [accountStats, setAccountStats] = useState({
    reviews_written: 0,
    tours_booked: 0,
    places_visited: 0,
  });

  // Recent activities state
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // All activities modal state
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [allActivitiesLoading, setAllActivitiesLoading] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<{
    id: number;
    title: string;
    amount: number;
    participants: number;
  } | null>(null);

  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatTourGuide, setChatTourGuide] = useState<{
    tourGuideUserId: number; // user_id dari tour guide (untuk receiver_id)
    tourGuideId: number; // id dari tabel tour_guides (untuk tour_guide_id)
    tourGuideName: string;
    bookingId: number;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Function to handle chat button click
  const handleChatWithTourGuide = async (activity: ActivityItem) => {
    // Ambil booking_id dari activity.details
    const bookingId = activity.details?.bookingId;
    let name = activity.details?.tourGuideName || "Tour Guide";
    console.log("[Chat] handleChatWithTourGuide called", {
      bookingId,
      activity,
    });

    if (!bookingId) {
      console.warn(
        "[Chat] Tidak ada bookingId di activity.details",
        activity.details
      );
      setChatTourGuide({
        tourGuideUserId: 0,
        tourGuideId: 0,
        tourGuideName: "Tour Guide",
        bookingId: activity.details?.bookingId || 0,
      });
      setShowChatModal(true);
      setChatError("Booking tidak memiliki informasi ID booking.");
      return;
    }

    try {
      // Import supabase client secara dinamis
      const { supabase } = await import("../utils/supabaseClient");

      // 1. Query ke tabel bookings untuk dapatkan tour_id
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("tour_id")
        .eq("id", bookingId)
        .single();
      console.log("[Chat] Query bookings", {
        bookingId,
        bookingData,
        bookingError,
      });

      if (bookingError || !bookingData || !bookingData.tour_id) {
        console.warn("[Chat] Tidak dapat menemukan tour_id dari bookings", {
          bookingId,
          bookingData,
          bookingError,
        });
        setChatTourGuide({
          tourGuideUserId: 0,
          tourGuideId: 0,
          tourGuideName: name,
          bookingId: activity.details?.bookingId || 0,
        });
        setShowChatModal(true);
        setChatError("Tidak dapat menemukan tour dari booking ini.");
        return;
      }

      const tourId = bookingData.tour_id;

      // 2. Query ke tabel tours untuk dapatkan tour_guide_id
      const { data: tourData, error: tourError } = await supabase
        .from("tours")
        .select("tour_guide_id")
        .eq("id", tourId)
        .single();
      console.log("[Chat] Query tours", { tourId, tourData, tourError });

      if (tourError || !tourData || !tourData.tour_guide_id) {
        console.warn("[Chat] Tidak dapat menemukan tour_guide_id dari tours", {
          tourId,
          tourData,
          tourError,
        });
        setChatTourGuide({
          tourGuideUserId: 0,
          tourGuideId: 0,
          tourGuideName: name,
          bookingId: activity.details?.bookingId || 0,
        });
        setShowChatModal(true);
        setChatError("Tidak dapat menemukan tour guide dari tour ini.");
        return;
      }

      const tourGuideId = tourData.tour_guide_id;

      // 3. Query ke tabel tour_guides untuk dapatkan user_id dan nama
      const { data: guideData, error: guideError } = await supabase
        .from("tour_guides")
        .select("user_id, user: user_id (first_name, last_name)")
        .eq("id", tourGuideId)
        .single();
      console.log("[Chat] Query tour_guides", {
        tourGuideId,
        guideData,
        guideError,
      });

      if (guideError || !guideData || !guideData.user_id) {
        console.warn("[Chat] Tidak dapat menemukan user_id dari tour_guides", {
          tourGuideId,
          guideData,
          guideError,
        });
        setChatTourGuide({
          tourGuideUserId: 0,
          tourGuideId: 0,
          tourGuideName: name,
          bookingId: activity.details?.bookingId || 0,
        });
        setShowChatModal(true);
        setChatError("Tidak dapat menemukan user_id tour guide.");
        return;
      }

      const tourGuideUserId = guideData.user_id;
      if (guideData.user) {
        if (Array.isArray(guideData.user) && guideData.user.length > 0) {
          const u = guideData.user[0];
          if (u && typeof u === "object") {
            name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || name;
          }
        } else if (typeof guideData.user === "object") {
          const u = guideData.user as {
            first_name?: string;
            last_name?: string;
          };
          name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || name;
        }
      }
      console.log("[Chat] Final resolved data for chat:", {
        tourGuideUserId,
        tourGuideId,
        name,
      });
      setChatTourGuide({
        tourGuideUserId: Number(tourGuideUserId),
        tourGuideId: Number(tourGuideId),
        tourGuideName: name,
        bookingId: activity.details?.bookingId || 0,
      });
      setShowChatModal(true);
      setChatError(null);
    } catch (err: unknown) {
      console.error("[Chat] Error saat mencari user_id tour guide:", err);
      setChatTourGuide({
        tourGuideUserId: 0,
        tourGuideId: 0,
        tourGuideName: name,
        bookingId: activity.details?.bookingId || 0,
      });
      setShowChatModal(true);
      setChatError("Terjadi error saat mencari user_id tour guide.");
    }
  };

  useEffect(() => {
    if (user?.id) {
      getUserAccountStats(user.id)
        .then(setAccountStats)
        .catch(() =>
          setAccountStats({
            reviews_written: 0,
            tours_booked: 0,
            places_visited: 0,
          })
        );
    }
  }, [user?.id]);

  // Fetch recent activities
  useEffect(() => {
    if (user?.id) {
      setActivitiesLoading(true);
      userActivityService
        .getUserRecentActivities(user.id, 3)
        .then(setRecentActivities)
        .catch((error) => {
          console.error("Error fetching recent activities:", error);
          setRecentActivities([]);
        })
        .finally(() => setActivitiesLoading(false));
    }
  }, [user?.id]);

  // Function to refresh activities
  const refreshActivities = useCallback(async () => {
    if (user?.id) {
      setActivitiesLoading(true);
      try {
        const activities = await userActivityService.getUserRecentActivities(
          user.id,
          3
        );
        setRecentActivities(activities);
      } catch (error) {
        console.error("Error refreshing activities:", error);
        setRecentActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    }
  }, [user?.id]);

  // Function to handle viewing all activities
  const handleViewAllActivities = async () => {
    if (!user?.id) return;

    setShowAllActivitiesModal(true);
    setAllActivitiesLoading(true);

    try {
      const activities = await userActivityService.getAllUserActivities(
        user.id
      );
      setAllActivities(activities);
    } catch (error) {
      console.error("Error fetching all activities:", error);
      setAllActivities([]);
    } finally {
      setAllActivitiesLoading(false);
    }
  };

  // Function to handle payment for confirmed bookings
  const handlePayNow = (booking: {
    id: number;
    title: string;
    amount: number;
    participants: number;
  }) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  // Function to handle successful payment
  const handlePaymentSuccess = () => {
    // Refresh activities to show updated payment status
    refreshActivities();
    setSelectedBookingForPayment(null);
  };

  // Fetch chat messages when modal opens or booking/tour guide changes
  useEffect(() => {
    const fetchChat = async () => {
      if (
        showChatModal &&
        chatTourGuide &&
        user?.id &&
        chatTourGuide.tourGuideUserId
      ) {
        setChatLoading(true);
        setChatError(null);
        try {
          console.log("[Chat] Fetching messages", {
            userId: user.id,
            tourGuideUserId: chatTourGuide.tourGuideUserId,
            tourGuideId: chatTourGuide.tourGuideId,
            bookingId: chatTourGuide.bookingId,
          });
          const messages = await chatService.getMessages({
            userId: parseInt(user.id),
            tourGuideId: chatTourGuide.tourGuideUserId, // ini adalah user_id tour guide
            bookingId: chatTourGuide.bookingId,
          });
          console.log("[Chat] Messages fetched:", messages);
          setChatMessages(messages);
        } catch (err: unknown) {
          console.error("[Chat] Error fetching chat messages:", err);
          setChatError("Gagal memuat pesan chat.");
          setChatMessages([]);
        } finally {
          setChatLoading(false);
        }
      } else if (
        showChatModal &&
        chatTourGuide &&
        !chatTourGuide.tourGuideUserId
      ) {
        console.warn(
          "[Chat] Informasi tour guide tidak tersedia",
          chatTourGuide
        );
        setChatError("Informasi tour guide tidak tersedia.");
        setChatLoading(false);
      }
    };
    fetchChat();
  }, [showChatModal, chatTourGuide, user?.id]);

  // Send message handler for chat modal
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !chatInput.trim() ||
      !user?.id ||
      !chatTourGuide ||
      !chatTourGuide.tourGuideUserId
    ) {
      if (!chatTourGuide?.tourGuideUserId) {
        console.warn(
          "[Chat] Tidak bisa kirim pesan, tourGuideUserId tidak tersedia",
          chatTourGuide
        );
        setChatError("Informasi tour guide tidak tersedia.");
      }
      return;
    }
    setChatLoading(true);
    setChatError(null);
    try {
      console.log("[Chat] Sending message", {
        senderId: user.id, // user customer ID
        receiverId: chatTourGuide.tourGuideUserId, // tour guide user_id
        tourGuideId: chatTourGuide.tourGuideId, // tour guide table ID
        content: chatInput.trim(),
      });
      const res = await chatService.sendMessage({
        senderId: parseInt(user.id), // sender_id: customer user_id
        receiverId: chatTourGuide.tourGuideUserId, // receiver_id: tour guide user_id
        tourGuideId: chatTourGuide.tourGuideId, // tour_guide_id: ID dari tabel tour_guides
        bookingId: chatTourGuide.bookingId, // booking_id: untuk referensi (optional)
        content: chatInput.trim(), // content: isi pesan
      });
      console.log("[Chat] Send message result:", res);
      if (res.success && res.message) {
        setChatMessages((prev) => [...prev, res.message!]);
        setChatInput("");
      } else {
        console.error("[Chat] Error sending message:", res.error);
        setChatError(res.error || "Gagal mengirim pesan.");
      }
    } catch (err: unknown) {
      console.error("[Chat] Error sending message:", err);
      setChatError("Gagal mengirim pesan.");
    } finally {
      setChatLoading(false);
    }
  };

  // If no user is logged in, this page should be protected by ProtectedRoute
  if (!user) {
    return null;
  }
  const handleInputChange = (
    field: keyof typeof user.profile | "dateOfBirth" | "gender",
    value: string | string[]
  ) => {
    if (field === "dateOfBirth") {
      setEditedUserFields({
        ...editedUserFields,
        dateOfBirth: value as string,
      });
      return;
    }

    if (field === "gender") {
      // Ensure gender is one of the valid enum values
      const genderValue = value as string;
      if (
        genderValue === "male" ||
        genderValue === "female" ||
        genderValue === "other" ||
        genderValue === ""
      ) {
        setEditedUserFields({
          ...editedUserFields,
          gender: genderValue as "male" | "female" | "other" | "",
        });
      }
      return;
    }

    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };
  const handleSaveChanges = async () => {
    if (editedProfile) {
      setIsLoading(true);

      try {
        // Make sure gender is typed correctly
        const typedGender =
          editedUserFields.gender === "male" ||
            editedUserFields.gender === "female" ||
            editedUserFields.gender === "other"
            ? (editedUserFields.gender as "male" | "female" | "other")
            : undefined;

        // Combine profile updates with user field updates
        const allUpdates = {
          ...editedProfile,
          dateOfBirth: editedUserFields.dateOfBirth || undefined,
          gender: typedGender,
        };

        // Update the user profile through AuthContext with Supabase
        const success = await updateProfile(allUpdates);

        if (success) {
          setIsEditing(false);
          // Optional: Show success message
        } else {
          // Handle failure
          alert("Failed to update profile. Please try again.");
          // Keep the editing state open
        }
      } catch (error) {
        console.error("Profile update error:", error);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  const handleCancelEdit = () => {
    setEditedProfile(user.profile);
    setEditedUserFields({
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
    });
    setIsEditing(false);
  };
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      logout();
      // The redirect will happen automatically after logout
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
      alert("Failed to logout. Please try again.");
    }
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Store the previous image URL for recovery if needed
      const previousImage = user?.profile?.avatar || "";
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string;

          console.log("Image loaded, converting to base64...");

          // Validate image size (optional: limit to reasonable size)
          const base64Data = result.split(",")[1];
          const sizeInBytes = (base64Data.length * 3) / 4;
          const sizeInMB = sizeInBytes / (1024 * 1024);

          if (sizeInMB > 5) {
            // 5MB limit
            alert(
              "Image size too large. Please choose an image smaller than 5MB."
            );
            setIsLoading(false);
            return;
          }

          // Show the image immediately for responsive UX
          setProfileImage(result);

          console.log("Updating profile with new image...");
          // Update user profile with new avatar through Supabase
          const success = await updateProfile({ avatar: result });

          if (success) {
            console.log("Profile image updated successfully");
            // No need to store in localStorage as it will be fetched from server
          } else {
            console.error("Failed to update profile image");

            // Show more detailed error message
            const errorMessage =
              "Failed to update profile image. This might be due to storage limits, network issues, or the image being too large. Please try again with a smaller image.";
            alert(errorMessage);

            // Restore previous image if update failed
            setProfileImage(previousImage);
          }
        } catch (error) {
          console.error("Image upload error:", error);

          // Provide more specific error feedback
          let errorMessage = "Failed to upload image. Please try again.";

          if (error instanceof Error) {
            if (
              error.message.includes("storage") ||
              error.message.includes("bucket")
            ) {
              errorMessage =
                "Storage error: The image storage system is not available. Please try again later.";
            } else if (
              error.message.includes("network") ||
              error.message.includes("connection")
            ) {
              errorMessage =
                "Network error: Please check your internet connection and try again.";
            } else if (
              error.message.includes("too long") ||
              error.message.includes("character varying")
            ) {
              errorMessage =
                "Image data too large: Please try a smaller image or different format.";
            } else if (error.message.includes("upload")) {
              errorMessage =
                "Failed to upload image to storage. Please try again or contact support.";
            }
          }

          alert(errorMessage);

          // Restore previous image
          setProfileImage(previousImage);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        alert("Error reading file. Please try another image.");
        setIsLoading(false);

        // Restore previous image
        setProfileImage(previousImage);
      };

      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = async () => {
    const defaultImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;

    setIsLoading(true);

    try {
      console.log("Removing custom profile image...");

      // Update UI immediately for better UX
      setProfileImage(defaultImage);

      // Update user profile to remove custom avatar through Supabase
      const success = await updateProfile({ avatar: defaultImage });

      if (success) {
        console.log("Custom profile image removed successfully");
      } else {
        console.error("Failed to remove profile image");
        alert("Failed to remove profile image. Please try again.");
        // Restore previous image if update failed
        setProfileImage(user?.profile?.avatar || "");
      }
    } catch (error) {
      console.error("Image removal error:", error);
      alert("Failed to remove profile image. Please try again.");
      // Restore previous image
      setProfileImage(user?.profile?.avatar || "");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Test Supabase image storage functionality
   */
  const testImageStorage = async () => {
    try {
      setIsLoading(true);

      // Import directly here to avoid circular dependencies
      const { profileService } = await import("../services/profileService");

      console.log("Testing Supabase storage functionality...");
      const testResult = await profileService.testImageUpload();

      if (testResult.success) {
        console.log("✅ Image storage test passed:", testResult.message);
        alert(
          "Image storage is working correctly! You can upload profile pictures."
        );
      } else {
        console.error(
          "❌ Image storage test failed:",
          testResult.message,
          testResult.details
        );
        alert(
          `Image storage test failed: ${testResult.message}. Check console for details.`
        );
      }
    } catch (error) {
      console.error("Error testing image storage:", error);
      alert("Error while testing image storage. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const profile = user.profile;
  const currentProfile = editedProfile || user.profile;

  if (!profile || !currentProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Trip Requests Notification for Customers */}
        {/* Profile Header */}

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
          <div className="px-6 py-8 md:px-8 -mt-16">
            <div className="flex flex-col items-center">
              {" "}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <img
                      src={profileImage}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.warn(
                          "Profile image failed to load:",
                          profileImage
                        );
                        // Fallback to default avatar if image fails to load
                        setProfileImage(
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                        );
                        // Optionally update the profile with the default image
                        if (
                          user?.profile?.avatar &&
                          !user.profile.avatar.includes("dicebear")
                        ) {
                          // Update profile to use the default image to prevent future failures
                          updateProfile({
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                          }).then((success) => {
                            if (success) {
                              console.log(
                                "Updated profile with default avatar after image load failure"
                              );
                            }
                          });
                        }
                      }}
                    />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  {" "}
                  <label
                    className={`p-2 bg-teal-500 rounded-full text-white ${isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-teal-600 cursor-pointer"
                      } transition-colors shadow-md`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                      className="hidden"
                    />
                  </label>
                  {profileImage &&
                    profileImage !==
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` && (
                      <button
                        onClick={handleRemoveImage}
                        disabled={isLoading}
                        className={`p-2 bg-red-500 rounded-full text-white ${isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-red-600"
                          } transition-colors shadow-md`}
                        title="Remove photo"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.profile.firstName} {user.profile.lastName}
                </h1>
                <p className="text-gray-600 mt-1">@{user.username}</p>{" "}
                <div className="mt-2">
                  <RoleBadge role={user.role} />
                </div>
                {/* Add the storage test button only in development */}
                {import.meta.env.DEV && (
                  <button
                    onClick={testImageStorage}
                    disabled={isLoading}
                    className={`mt-3 text-xs px-2 py-1 bg-gray-200 rounded ${isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-300"
                      }`}
                  >
                    Test Storage
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Personal Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              {" "}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h2>
                <div className="flex items-center space-x-4">
                  <TimezoneInfo />
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className={`flex items-center text-sm bg-teal-600 text-white px-3 py-1 rounded-md ${isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-teal-700"
                          }`}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className={`flex items-center text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md ${isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-gray-200"
                          }`}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={isLoading}
                      className={`flex items-center text-sm text-teal-600 ${isLoading
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:text-teal-700"
                        }`}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">First Name</p>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.profile.firstName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Last Name</p>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.profile.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>{" "}
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Location</p>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.location || ""}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.profile.location || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>{" "}
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentProfile.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder="+62 xxx-xxxx-xxxx"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.profile.phone || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>{" "}
                {/* Date of Birth */}
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Date of Birth</p>{" "}
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedUserFields.dateOfBirth}
                        onChange={(e) =>
                          setEditedUserFields({
                            ...editedUserFields,
                            dateOfBirth: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.dateOfBirth
                          ? formatIndonesianDate(user.dateOfBirth)
                          : "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Gender</p>{" "}
                    {isEditing ? (
                      <select
                        value={editedUserFields.gender}
                        onChange={(e) => {
                          const value = e.target.value;
                          const typedValue =
                            value === "male" ||
                              value === "female" ||
                              value === "other" ||
                              value === ""
                              ? (value as "" | "male" | "female" | "other")
                              : "";
                          setEditedUserFields({
                            ...editedUserFields,
                            gender: typedValue,
                          });
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">
                        {user.gender
                          ? user.gender.charAt(0).toUpperCase() +
                          user.gender.slice(1)
                          : "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
                {/* Ganti Languages menjadi Asal Negara */}
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Asal Negara</p>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentProfile.countryOfOrigin || ""}
                        onChange={(e) =>
                          handleInputChange("countryOfOrigin", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Contoh: Indonesia"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.profile.countryOfOrigin || "Tidak diisi"}
                      </p>
                    )}
                  </div>
                </div>
                {/* Hapus Bio */}
                {/* Profile Photo Management */}
                <div className="flex items-start">
                  <Camera className="w-5 h-5 text-teal-500 mr-3 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Profile Photo</p>
                    <div className="mt-2 space-y-2">
                      {" "}
                      <div className="flex items-center space-x-3">
                        <label
                          className={`flex items-center space-x-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg ${isLoading
                              ? "opacity-70 cursor-not-allowed"
                              : "cursor-pointer hover:bg-teal-100"
                            } transition-colors`}
                        >
                          {isLoading ? (
                            <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Camera className="w-4 h-4 text-teal-600" />
                          )}
                          <span className="text-sm text-teal-700">
                            {isLoading ? "Uploading..." : "Upload New Photo"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isLoading}
                            className="hidden"
                          />
                        </label>
                        {profileImage &&
                          profileImage !==
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` && (
                            <button
                              onClick={handleRemoveImage}
                              disabled={isLoading}
                              className={`px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 ${isLoading
                                  ? "opacity-70 cursor-not-allowed"
                                  : "hover:bg-red-100"
                                } transition-colors`}
                            >
                              {isLoading ? "Removing..." : "Remove Photo"}
                            </button>
                          )}
                        {import.meta.env.DEV && (
                          <button
                            onClick={testImageStorage}
                            disabled={isLoading}
                            className={`px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 ${isLoading
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-blue-100"
                              } transition-colors`}
                            title="Test Supabase storage functionality"
                          >
                            <span className="flex items-center">
                              <Database className="w-4 h-4 mr-2" />
                              Test Storage
                            </span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Max file size: 5MB. Supported formats: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Logout Button */}{" "}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg ${isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-red-600"
                    } transition-colors duration-300`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Stats and Activity */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Account Statistics
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Reviews Written</p>
                  <p className="text-2xl font-semibold text-teal-600">
                    {accountStats.reviews_written}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tours Booked</p>
                  <p className="text-2xl font-semibold text-teal-600">
                    {accountStats.tours_booked}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Places Visited</p>
                  <p className="text-2xl font-semibold text-teal-600">
                    {accountStats.places_visited}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Activity
                </h2>
                <button
                  onClick={refreshActivities}
                  disabled={activitiesLoading}
                  className={`p-2 rounded-lg transition-colors ${activitiesLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-teal-50 text-teal-600 hover:bg-teal-100"
                    }`}
                  title="Refresh activities"
                >
                  <div
                    className={`w-4 h-4 ${activitiesLoading ? "animate-spin" : ""
                      }`}
                  >
                    🔄
                  </div>
                </button>
              </div>
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">
                    Loading activities...
                  </span>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      {/* Icon - Fixed width untuk alignment */}
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-200 text-lg">
                        {activity.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 ml-4">
                        {/* Header: Title dan Date */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 leading-5">
                            {activity.title}
                          </h4>
                          <time className="text-xs text-gray-500 whitespace-nowrap ml-3 mt-0.5">
                            {activity.formattedDate}
                          </time>
                        </div>

                        {/* Description */}
                        <p
                          className="text-sm text-gray-600 leading-5 mb-3"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {activity.description}
                        </p>

                        {/* Badge & Payment Status */}
                        <div className="flex items-center space-x-2">
                          {/* Handle different booking activity types */}
                          {activity.type === "booking" && (
                            <>
                              {/* Show different badges based on activity type */}
                              {activity.details?.activityType ===
                                "creation" && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    Booking Created
                                  </span>
                                )}

                              {activity.details?.activityType ===
                                "confirmation" && (
                                  <>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                      Confirmed
                                    </span>
                                    {/* Show Pay Now button for confirmed bookings with pending payment */}
                                    {activity.details?.paymentStatus ===
                                      "pending" && (
                                        <button
                                          onClick={() =>
                                            handlePayNow({
                                              id: activity.details!.bookingId || 0,
                                              title:
                                                activity.details!.tourTitle ||
                                                "Unknown Tour",
                                              amount: activity.details!.amount || 0,
                                              participants:
                                                activity.details!.participants || 1,
                                            })
                                          }
                                          className="ml-2 inline-flex items-center px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors"
                                        >
                                          💳 Pay Now
                                        </button>
                                      )}
                                  </>
                                )}

                              {activity.details?.activityType === "payment" && (
                                <>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                    Paid
                                  </span>
                                  <button
                                    className="ml-2 px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                                    onClick={() =>
                                      handleChatWithTourGuide(activity)
                                    }
                                  >
                                    Chat dengan Tour Guide
                                  </button>
                                </>
                              )}

                              {activity.details?.activityType ===
                                "cancellation" && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                    Cancelled
                                  </span>
                                )}

                              {/* Fallback for legacy booking activities without activityType */}
                              {!activity.details?.activityType && (
                                <>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    Booking
                                  </span>
                                  {activity.details?.status && (
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ml-1 ${activity.details.status === "confirmed"
                                          ? "bg-green-50 text-green-700 border border-green-200"
                                          : activity.details.status ===
                                            "pending"
                                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                            : activity.details.status ===
                                              "cancelled"
                                              ? "bg-red-50 text-red-700 border border-red-200"
                                              : "bg-gray-50 text-gray-700 border border-gray-200"
                                        }`}
                                    >
                                      {activity.details.status}
                                    </span>
                                  )}
                                  {/* Pay Now button for legacy confirmed bookings with pending payment */}
                                  {activity.details?.status === "confirmed" &&
                                    activity.details?.paymentStatus ===
                                    "pending" && (
                                      <button
                                        onClick={() =>
                                          handlePayNow({
                                            id:
                                              activity.details!.bookingId || 0,
                                            title:
                                              activity.details!.tourTitle ||
                                              "Unknown Tour",
                                            amount:
                                              activity.details!.amount || 0,
                                            participants:
                                              activity.details!.participants ||
                                              1,
                                          })
                                        }
                                        className="ml-2 inline-flex items-center px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors"
                                      >
                                        💳 Pay Now
                                      </button>
                                    )}
                                  {/* Chat button for legacy paid bookings */}
                                  {activity.details?.paymentStatus ===
                                    "paid" && (
                                      <button
                                        className="ml-2 px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                                        onClick={() =>
                                          handleChatWithTourGuide(activity)
                                        }
                                      >
                                        Chat dengan Tour Guide
                                      </button>
                                    )}
                                </>
                              )}
                            </>
                          )}

                          {/* Handle other activity types */}
                          {activity.type !== "booking" && activity.details && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === "message"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : activity.type === "tour_request"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                }`}
                            >
                              {activity.type === "message"
                                ? "Message"
                                : activity.type === "tour_request"
                                  ? "Tour Request"
                                  : activity.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length >= 3 && (
                    <div className="text-center pt-4 border-t border-gray-200 mt-4">
                      <button
                        onClick={handleViewAllActivities}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <span>View all activities</span>
                        <svg
                          className="ml-1 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-300 text-5xl mb-4">📝</div>
                  <h3 className="text-gray-700 text-lg font-medium mb-2">
                    No recent activity
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Start exploring and booking tours to see your activity
                    history here!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Status Section - Full width for customers */}
        {user.role === "customer" && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              My Bookings
            </h2>
            {/* Trip Requests Notification for Customers (moved here) */}
            <TripRequestsNotification userId={user.id} onPayNow={handlePayNow} />
            <BookingStatusTabs
              userId={parseInt(user.id)}
              hideReviewNeeded={true}
            />
          </div>
        )}
      </div>

      {/* All Activities Modal */}
      <AllActivitiesModal
        activities={allActivities}
        isOpen={showAllActivitiesModal}
        onClose={() => setShowAllActivitiesModal(false)}
        isLoading={allActivitiesLoading}
        onPayNow={handlePayNow}
        onChatWithTourGuide={handleChatWithTourGuide}
      />

      {/* Payment Modal */}
      {selectedBookingForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
          }}
          booking={selectedBookingForPayment}
          userDetails={{
            name: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""
              }`.trim(),
            email: user.email || "",
            phone: user.profile?.phone || "",
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Chat Modal (integrated) */}
      {showChatModal && chatTourGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowChatModal(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-2">
              Chat dengan {chatTourGuide.tourGuideName}
            </h3>
            <div className="h-48 overflow-y-auto border rounded mb-3 p-2 bg-gray-50 text-sm text-gray-700 flex flex-col">
              {chatLoading ? (
                <div className="text-center text-gray-400 mt-16">
                  Memuat pesan...
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-gray-400 text-center mt-16">
                  Belum ada pesan.
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 flex ${msg.sender_id === parseInt(user.id)
                        ? "justify-end"
                        : "justify-start"
                      }`}
                  >
                    <div
                      className={`px-3 py-1 rounded-lg ${msg.sender_id === parseInt(user.id)
                          ? "bg-teal-600 text-white"
                          : "bg-gray-200 text-gray-800"
                        } max-w-[70%]`}
                    >
                      <span>{msg.content}</span>
                      <div className="text-xs text-gray-300 mt-1 text-right">
                        {new Date(msg.sent_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {chatError && (
                <div className="text-red-500 text-xs text-center mt-2">
                  {chatError}
                </div>
              )}
            </div>
            <form className="flex gap-2" onSubmit={handleSendChatMessage}>
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1"
                placeholder="Tulis pesan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button
                type="submit"
                className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                disabled={chatLoading || !chatInput.trim()}
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
