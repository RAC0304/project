import React, { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Settings,
  Camera,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import RoleBadge from "../components/common/RoleBadge";

const UserProfilePage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(user?.profile || null);
  const [profileImage, setProfileImage] = useState<string>(
    localStorage.getItem(`profile_image_${user?.id}`) ||
      user?.profile?.avatar ||
      ""
  );

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
  const handleSaveChanges = () => {
    if (editedProfile) {
      // Update the user profile through AuthContext
      updateProfile(editedProfile);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(user.profile);
    setIsEditing(false);
  };
  const handleLogout = () => {
    logout();
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        // Save to localStorage for persistence
        localStorage.setItem(`profile_image_${user.id}`, result);
        // Update user profile with new avatar
        updateProfile({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    const defaultImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    setProfileImage(defaultImage);
    localStorage.removeItem(`profile_image_${user.id}`);
    // Update user profile to remove custom avatar
    updateProfile({ avatar: defaultImage });
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
                  <img
                    src={
                      profileImage ||
                      user.profile.avatar ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
                        user.username
                    }
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 flex space-x-1">
                  <label className="p-2 bg-teal-500 rounded-full text-white hover:bg-teal-600 transition-colors shadow-md cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {profileImage &&
                    profileImage !==
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` && (
                      <button
                        onClick={handleRemoveImage}
                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-md"
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
                <p className="text-gray-600 mt-1">@{user.username}</p>
                <div className="mt-2">
                  <RoleBadge role={user.role} />
                </div>
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
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveChanges}
                        className="flex items-center text-sm bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-sm text-teal-600 hover:text-teal-700"
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
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors">
                          <Camera className="w-4 h-4 text-teal-600" />
                          <span className="text-sm text-teal-700">
                            Upload New Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {profileImage &&
                          profileImage !==
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` && (
                            <button
                              onClick={handleRemoveImage}
                              className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-100 transition-colors"
                            >
                              Remove Photo
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

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
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
