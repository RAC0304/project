import React from "react";
import {
    Mail,
    Phone,
    Languages,
    Award,
    Clock,
    MapPin,
} from "lucide-react";
import { User } from "../../../types";
import { PROFILE_IMAGE } from "../../../constants/images";

interface ProfileContentProps {
    user: User | null;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ user }) => {
    return (
        <>
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="h-28 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                <div className="px-6 py-6 md:px-8 md:py-8 -mt-20">
                    <div className="flex flex-col md:flex-row">
                        {/* Profile Image */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6 bg-white">
                            <img
                                src={user?.profile.avatar || PROFILE_IMAGE}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                        {user?.profile.firstName} {user?.profile.lastName}
                                    </h1>

                                    {user?.profile.location && (
                                        <div className="flex items-center space-x-2 mb-2">
                                            <MapPin className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">
                                                {user.profile.location}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-block px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full">
                                            Tour Guide
                                        </span>
                                        <span className="inline-block px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full">
                                            47 Tours
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0">
                                    <button className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-5 py-2.5 rounded-md transition-colors flex items-center">
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
                                    {user?.profile.bio ||
                                        "No bio available. Add your professional bio to tell clients about your experience and expertise."}
                                </p>
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
                                    {user?.profile.phone || "No phone available"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Languages className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Languages</p>
                                <p className="text-gray-800">English, Spanish</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Award className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Experience</p>
                                <p className="text-gray-800">
                                    5+ years of guiding experience
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Clock className="w-5 h-5 text-teal-600 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">
                                    Typical Response Time
                                </p>
                                <p className="text-gray-800">Within 3 hours</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Account Settings
                    </h2>
                    <div className="space-y-6">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    defaultValue={user?.profile.firstName || ""}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    defaultValue={user?.profile.lastName || ""}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                defaultValue={user?.profile.phone || ""}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                defaultValue={user?.profile.location || ""}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                defaultValue={user?.profile.bio || ""}
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button className="bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileContent;
