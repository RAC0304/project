import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Settings,
  Camera,
  LogOut,
  Database,
} from "lucide-react";
import { useAuth } from "../contexts/CustomAuthContext";
import RoleBadge from "../components/common/RoleBadge";

const UserProfilePage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(user?.profile || null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    user?.profile?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${
        user?.username || "default"
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

  // If no user is logged in, this page should be protected by ProtectedRoute
  if (!user) {
    return null;
  }

  const handleInputChange = (
    field: keyof typeof user.profile,
    value: string
  ) => {
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
        // Update the user profile through AuthContext with Supabase
        const success = await updateProfile(editedProfile);

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
              "Failed to update profile image. This might be due to storage limits or network issues. Please try again later.";
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
                    className={`p-2 bg-teal-500 rounded-full text-white ${
                      isLoading
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
                        className={`p-2 bg-red-500 rounded-full text-white ${
                          isLoading
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
                    className={`mt-3 text-xs px-2 py-1 bg-gray-200 rounded ${
                      isLoading
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h2>
                <div className="flex space-x-4">
                  {" "}
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className={`flex items-center text-sm bg-teal-600 text-white px-3 py-1 rounded-md ${
                          isLoading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-teal-700"
                        }`}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className={`flex items-center text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md ${
                          isLoading
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
                      className={`flex items-center text-sm text-teal-600 ${
                        isLoading
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
                </div>
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
                  <Calendar className="w-5 h-5 text-teal-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>{" "}
                {/* Bio Section */}
                <div className="flex items-start">
                  <Settings className="w-5 h-5 text-teal-500 mr-3 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Bio</p>{" "}
                    {isEditing ? (
                      <textarea
                        value={currentProfile.bio || ""}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.profile.bio || "No bio available"}
                      </p>
                    )}
                  </div>
                </div>
                {/* Profile Photo Management */}
                <div className="flex items-start">
                  <Camera className="w-5 h-5 text-teal-500 mr-3 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Profile Photo</p>
                    <div className="mt-2 space-y-2">
                      {" "}
                      <div className="flex items-center space-x-3">
                        <label
                          className={`flex items-center space-x-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg ${
                            isLoading
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
                              className={`px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 ${
                                isLoading
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
                            className={`px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 ${
                              isLoading
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
                  className={`flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg ${
                    isLoading
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
                  <p className="text-2xl font-semibold text-teal-600">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tours Booked</p>
                  <p className="text-2xl font-semibold text-teal-600">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Places Visited</p>
                  <p className="text-2xl font-semibold text-teal-600">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Activity
              </h2>
              <div className="text-gray-600 text-sm">
                No recent activity to show
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
