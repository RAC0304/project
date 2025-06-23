import React, { useState, useEffect, useCallback } from "react";
import { Mail, Phone, Languages, Award, Clock, MapPin } from "lucide-react";
import { User } from "../../../types";
import Toast from "../../common/Toast";
import { PROFILE_IMAGE } from "../../../constants/images";
import supabase from "../../../config/supabaseClient";

// Extended form data interface to include languages and experience
interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  languages: string;
  experience: string;
  specialties: string; // comma separated
  shortBio: string;
  availability: string;
}

interface ProfileContentProps {
  user: User | null;
}

const DEFAULT_PROFILE_IMAGE = (user?: User | null) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${
    user?.profile?.firstName || user?.profile?.lastName || "default"
  }`;

const ProfileContent: React.FC<ProfileContentProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    type: "success" as "success" | "error",
    message: "",
  });
  const [tourCount, setTourCount] = useState<number>(0);
  const [profileImage, setProfileImage] = useState<string>(
    user?.profile_picture || DEFAULT_PROFILE_IMAGE(user)
  );
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Default values for languages and experience
  const defaultLanguages = "English, Spanish";
  const defaultExperience = "5+ years of guiding experience";
  const defaultSpecialties = "Nature, Culture";
  const defaultShortBio = "";
  const defaultAvailability = "Available";

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.profile.firstName || "",
    lastName: user?.profile.lastName || "",
    phone: user?.profile.phone || "",
    location: user?.profile.location || "",
    bio: user?.profile.bio || "",
    languages: defaultLanguages,
    experience: defaultExperience,
    specialties:
      (user?.profile as { specialties?: string[] })?.specialties?.join(", ") ||
      defaultSpecialties,
    shortBio:
      (user?.profile as { short_bio?: string })?.short_bio || defaultShortBio,
    availability:
      (user?.profile as { availability?: string })?.availability ||
      defaultAvailability,
  });
  // Fetch tour guide data from Supabase
  const fetchTourGuide = useCallback(async () => {
    if (!user) return;
    // Fetch tour guide, user, tours
    const { data } = await supabase
      .from("tour_guides")
      .select("*, users:user_id(*), tours:tours(*)")
      .eq("user_id", user.id)
      .single();
    // Fetch tour_guide_languages
    const { data: langData } = await supabase
      .from("tour_guide_languages")
      .select("language")
      .eq("tour_guide_id", data?.id);
    if (data) {
      console.log("Fetched data:", data); // Debug log
      let specialtiesStr = "";
      if (data.specialties) {
        if (Array.isArray(data.specialties)) {
          specialtiesStr = data.specialties.join(", ");
        } else if (typeof data.specialties === "object") {
          // Convert JSONB object to comma-separated string
          specialtiesStr = Object.keys(data.specialties)
            .filter((k) => data.specialties[k])
            .map((k) => k.charAt(0).toUpperCase() + k.slice(1)) // Capitalize first letter
            .join(", ");
        }
      }
      console.log("Processed specialties:", specialtiesStr); // Debug log

      setFormData((prev) => ({
        ...prev,
        firstName: data.users?.first_name || "",
        lastName: data.users?.last_name || "",
        phone: data.users?.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        specialties: specialtiesStr || defaultSpecialties,
        shortBio: data.short_bio || "",
        experience: data.experience?.toString() || "",
        availability: data.availability || "",
        languages:
          langData && langData.length > 0
            ? langData.map((l) => l.language).join(", ")
            : "",
      }));
      // Tours count
      if (Array.isArray(data.tours)) {
        setTourCount(data.tours.length);
      } else {
        // fallback: fetch count
        const { count } = await supabase
          .from("tours")
          .select("id", { count: "exact", head: true })
          .eq("tour_guide_id", data.id);
        setTourCount(count || 0);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchTourGuide();
  }, [fetchTourGuide]);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // Update tour_guides table
    const specialtiesArr = formData.specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const specialtiesObj = specialtiesArr.reduce((acc, cur) => {
      acc[cur.toLowerCase()] = true;
      return acc;
    }, {} as Record<string, boolean>);
    // Get tour_guide_id
    const { data: guideData } = await supabase
      .from("tour_guides")
      .select("id")
      .eq("user_id", user.id)
      .single();
    const tourGuideId = guideData?.id;
    const { error: guideError } = await supabase
      .from("tour_guides")
      .update({
        bio: formData.bio,
        specialties: specialtiesObj,
        short_bio: formData.shortBio,
        experience: Number(formData.experience),
        availability: formData.availability,
        location: formData.location,
      })
      .eq("user_id", user.id);
    // Update users table
    const { error: userError } = await supabase
      .from("users")
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      })
      .eq("id", user.id); // Update tour_guide_languages
    let langError = null;
    if (tourGuideId) {
      // Hapus semua dulu
      await supabase
        .from("tour_guide_languages")
        .delete()
        .eq("tour_guide_id", tourGuideId);
      // Insert ulang
      const langArr = formData.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      if (langArr.length > 0) {
        const inserts = langArr.map((language) => ({
          tour_guide_id: tourGuideId,
          language,
        }));
        const { error: insError } = await supabase
          .from("tour_guide_languages")
          .insert(inserts);
        langError = insError;
      }
    }
    if (!guideError && !userError && !langError) {
      setToast({
        isVisible: true,
        type: "success",
        message: "Profile updated successfully!",
      });
      setIsEditing(false);
      // Fetch latest data from Supabase after update
      await fetchTourGuide();
    } else {
      setToast({
        isVisible: true,
        type: "error",
        message:
          guideError?.message ||
          userError?.message ||
          langError?.message ||
          "Update failed",
      });
    }
  };

  const handleEditClick = () => {
    // Enter editing mode and initialize form with current user data
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Exit edit mode without saving
    setIsEditing(false);
  };

  // Handle image upload (to Supabase Storage)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ isVisible: true, type: "error", message: "File size must be less than 5MB" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setToast({ isVisible: true, type: "error", message: "Please select an image file" });
      return;
    }
    setIsImageLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `profiles/${user.id}.${fileExt}`;
    try {
      // Upload ke bucket avatars
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        setToast({ isVisible: true, type: "error", message: "Failed to upload image to storage." });
        setIsImageLoading(false);
        return;
      }
      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) {
        setToast({ isVisible: true, type: "error", message: "Failed to get public URL." });
        setIsImageLoading(false);
        return;
      }
      setProfileImage(publicUrl);
      // Update profile_picture di table users
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_picture: publicUrl })
        .eq("id", user.id);
      if (!updateError) {
        setToast({ isVisible: true, type: "success", message: "Profile image updated!" });
      } else {
        setToast({ isVisible: true, type: "error", message: "Failed to update profile image URL." });
      }
    } catch {
      setToast({ isVisible: true, type: "error", message: "Failed to upload image. Please try again." });
    } finally {
      setIsImageLoading(false);
    }
  };

  // Remove image (reset to default in table)
  const handleRemoveImage = async () => {
    if (!user) return;
    const defaultImage = DEFAULT_PROFILE_IMAGE(user);
    setIsImageLoading(true);
    try {
      setProfileImage(defaultImage);
      const { error } = await supabase
        .from("users")
        .update({ profile_picture: defaultImage })
        .eq("id", user.id);
      if (!error) {
        setToast({ isVisible: true, type: "success", message: "Profile image removed." });
      } else {
        setToast({ isVisible: true, type: "error", message: "Failed to remove profile image." });
        setProfileImage(user?.profile_picture || "");
      }
    } catch {
      setToast({ isVisible: true, type: "error", message: "Failed to remove profile image." });
      setProfileImage(user?.profile_picture || "");
    } finally {
      setIsImageLoading(false);
    }
  };

  const SPECIALTIES_OPTIONS = [
    "Adventure",
    "Cultural",
    "Historical",
    "Nature",
    "Culinary",
    "Photography",
    "Diving",
  ];

  return (
    <>
      {/* Toast notification */}
      <Toast
        isVisible={toast.isVisible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-28 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
        <div className="px-6 py-6 md:px-8 md:py-8 -mt-20">
          <div className="flex flex-col md:flex-row">
            {/* Profile Image */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 bg-white relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                style={{ opacity: isImageLoading ? 0.5 : 1 }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    {formData.firstName} {formData.lastName}
                  </h1>

                  {formData.location && (
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{formData.location}</span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full">
                      Tour Guide
                    </span>
                    <span className="inline-block px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full">
                      {tourCount} Tours
                    </span>
                    {(user?.profile as { is_verified?: boolean })
                      ?.is_verified && (
                      <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full ml-2">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <button
                    onClick={handleEditClick}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-5 py-2.5 rounded-md transition-colors flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-600">
                  {formData.bio ||
                    "No bio available. Add your professional bio to tell clients about your experience and expertise."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-yellow-600">
                    {(user?.profile as { rating?: number })?.rating ?? 0}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Reviews:</span>
                  <span className="font-semibold">
                    {(user?.profile as { review_count?: number })
                      ?.review_count ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800">
                  {formData.phone || "No phone available"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Languages className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Languages</p>
                <p className="text-gray-800">{formData.languages}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Award className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-gray-800">{formData.experience}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Typical Response Time</p>
                <p className="text-gray-800">Within 3 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? "Edit Profile" : "Account Settings"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={user?.email || ""}
                readOnly
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={formData.phone}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={formData.location}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages
                </label>
                <input
                  type="text"
                  name="languages"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={formData.languages}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="English, Spanish, Indonesian, etc. (comma separated)"
                />
                {isEditing && (
                  <p className="mt-1 text-xs text-gray-500">
                    Separate languages with commas (e.g., "English, Spanish,
                    Indonesian")
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  value={formData.experience}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="e.g., 5+ years of guiding experience"
                />
              </div>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {SPECIALTIES_OPTIONS.map((option) => {
                  const selected = formData.specialties
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const isChecked = selected.includes(option);

                  return (
                    <div
                      key={option}
                      className={`inline-flex items-center px-4 py-1 rounded-full select-none text-sm border transition-all duration-200 cursor-pointer
                        ${
                          isChecked
                            ? "bg-teal-500 text-white border-teal-600 shadow-md transform scale-105"
                            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                        }
                        ${isEditing ? "cursor-pointer" : "cursor-default"}
                      `}
                      onClick={() => {
                        if (!isEditing) return;
                        let updated: string[];
                        if (isChecked) {
                          updated = selected.filter((s) => s !== option);
                        } else {
                          updated = Array.from(new Set([...selected, option]));
                        }
                        setFormData((prev) => ({
                          ...prev,
                          specialties: updated.join(", "),
                        }));
                      }}
                    >
                      <input
                        type="checkbox"
                        name="specialties"
                        value={option}
                        checked={isChecked}
                        onChange={() => {}} // Handled by onClick above
                        className="sr-only" // Hide default checkbox
                        disabled={!isEditing}
                      />
                      {isChecked && (
                        <svg
                          className="mr-1 w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {option}
                    </div>
                  );
                })}
              </div>
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Click to select or deselect specialties.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <input
                type="text"
                name="availability"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={formData.availability}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Available, Unavailable, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Bio
              </label>
              <textarea
                rows={2}
                name="shortBio"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                value={formData.shortBio}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Short summary about yourself"
              ></textarea>
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300 bg-white">
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      style={{ opacity: isImageLoading ? 0.5 : 1 }}
                    />
                  </div>
                  {isEditing && (
                    <div className="flex flex-col space-y-2">
                      <label
                        className={`inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-md cursor-pointer border border-teal-200 hover:bg-teal-100 transition-colors ${
                          isImageLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5v14m7-7H5" />
                        </svg>
                        Upload New Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isImageLoading}
                          className="hidden"
                        />
                      </label>
                      {profileImage &&
                        profileImage !== DEFAULT_PROFILE_IMAGE(user) && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isImageLoading}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Remove Photo
                          </button>
                        )}
                      <span className="text-xs text-gray-500 mt-1">
                        Max file size: 5MB. Supported formats: JPG, PNG, GIF
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfileContent;
