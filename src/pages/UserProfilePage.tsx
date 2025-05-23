import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, MapPin, Settings, Camera } from "lucide-react";

interface UserProfile {
  username: string;
  email: string;
  joinDate: string;
  location: string;
  avatarUrl: string;
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userData = localStorage.getItem("user");

    if (!isLoggedIn || !userData) {
      navigate("/login");
      return;
    }

    // Get stored profile or create mock profile
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      setEditedProfile(JSON.parse(storedProfile));
    } else {
      const mockProfile: UserProfile = {
        username: "Demo User",
        email: JSON.parse(userData).email,
        joinDate: "May 2025",
        location: "Indonesia",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      };
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
      localStorage.setItem("userProfile", JSON.stringify(mockProfile));
    }
  }, [navigate]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value,
      });
    }
  };

  const handleSaveChanges = () => {
    if (editedProfile) {
      setProfile(editedProfile);
      localStorage.setItem("userProfile", JSON.stringify(editedProfile));
      // Dispatch custom event to notify Header component
      window.dispatchEvent(new Event("userProfileUpdate"));
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (!profile || !editedProfile) {
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
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-teal-500 rounded-full text-white hover:bg-teal-600 transition-colors shadow-md">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                {profile.username}
              </h1>
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
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.username}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-teal-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-teal-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.location}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-teal-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900">{profile.joinDate}</p>
                  </div>
                </div>
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
