import React, { useState, useEffect, useRef } from "react";
import { User, UserRole } from "../../types";
import {
  Search,
  Filter,
  Edit,
  UserX,
  MoreHorizontal,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Check,
  AlertCircle,
  Camera,
} from "lucide-react";
import RoleBadge from "../common/RoleBadge";
import "./admin.css";
import { supabase } from "../../utils/supabaseClient"; // Import Supabase client

// Interface for modal form data
interface UserFormData {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  location: string;
  avatar?: string;
  bio: string;
  phone: string;
  isActive?: boolean;
}

// Updated the EnhancedUser type to include 'specialties' and 'languages' properties.
interface EnhancedUser extends Omit<User, "isActive"> {
  isActive: boolean;
  specialties: string[]; // Added specialties property
  languages: string[]; // Added languages property
}

const initialFormData: UserFormData = {
  id: "",
  email: "",
  username: "",
  role: "user",
  firstName: "",
  lastName: "",
  location: "",
  avatar: "",
  bio: "",
  phone: "",
  isActive: true,
};

const UsersContent: React.FC = () => {
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // File upload related
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);

  // State for notification
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    show: boolean;
  }>({
    type: "success",
    message: "",
    show: false,
  });
  useEffect(() => {
    // Fetch users from Supabase
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, username, role, first_name, last_name, phone, date_of_birth, gender, profile_picture, is_active, bio, location, languages, experience, created_at"
        );
      if (error) {
        // fallback: empty
        setUsers([]);
        setFilteredUsers([]);
        return;
      }
      const enhancedUsers: EnhancedUser[] = (data || []).map((user: any) => ({
        id: String(user.id),
        email: user.email,
        username: user.username || "",
        role:
          user.role === undefined ||
          user.role === null ||
          user.role === "unknown"
            ? "customer"
            : user.role,
        profile: {
          firstName: user.first_name,
          lastName: user.last_name,
          location: user.location || "",
          avatar: user.profile_picture || "",
          bio: user.bio || "",
          phone: user.phone || "",
        },
        createdAt: user.created_at,
        isActive: user.is_active ?? true,
        specialties: [], // You can map from user.experience or another field if needed
        languages: Array.isArray(user.languages) ? user.languages : [],
      }));
      setUsers(enhancedUsers);
      setFilteredUsers(enhancedUsers);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.profile.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter((user) => user.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter((user) => !user.isActive);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Handle opening modal for add user
  const handleAddUser = () => {
    setModalMode("add");
    setFormData(initialFormData);
    setFormErrors({});
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for edit user
  const handleEditUser = (userData: User) => {
    setModalMode("edit");
    setFormData({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      firstName: userData.profile.firstName,
      lastName: userData.profile.lastName,
      location: userData.profile.location || "",
      avatar: userData.profile.avatar || "",
      bio: userData.profile.bio || "",
      phone: userData.profile.phone || "",
    });
    setFormErrors({});
    setPreviewImage(userData.profile.avatar || null);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Show notification function
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({
      type,
      message,
      show: true,
    });

    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Handle image selection  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification("error", "Image size must be less than 2MB");
      return;
    }

    // Check file type
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type)
    ) {
      showNotification("error", "Only JPG, PNG and GIF images are allowed");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user types
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";

    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.username) errors.username = "Username is required";
    else if (formData.username.length < 3)
      errors.username = "Username must be at least 3 characters";

    // Check for duplicate username/email when adding a new user
    if (modalMode === "add") {
      if (
        users.some(
          (u) => u.username.toLowerCase() === formData.username.toLowerCase()
        )
      ) {
        errors.username = "This username is already taken";
      }

      if (
        users.some(
          (u) => u.email.toLowerCase() === formData.email.toLowerCase()
        )
      ) {
        errors.email = "This email is already in use";
      }
    }

    // When editing, check for duplicates only with other users
    if (modalMode === "edit") {
      const otherUsers = users.filter((u) => u.id !== formData.id);

      if (
        otherUsers.some(
          (u) => u.username.toLowerCase() === formData.username.toLowerCase()
        )
      ) {
        errors.username = "This username is already taken";
      }

      if (
        otherUsers.some(
          (u) => u.email.toLowerCase() === formData.email.toLowerCase()
        )
      ) {
        errors.email = "This email is already in use";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Reset form and image state
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setPreviewImage(null);
  };

  // CREATE USER
  const createUser = async (user: Omit<UserFormData, "id">) => {
    const { data, error } = await supabase.from("users").insert([
      {
        email: user.email,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        phone: user.phone,
        profile_picture: user.avatar,
        is_active: user.isActive,
        bio: user.bio,
        location: user.location,
      },
    ]);
    return { data, error };
  };

  // UPDATE USER
  const updateUser = async (id: string, user: Omit<UserFormData, "id">) => {
    const { data, error } = await supabase
      .from("users")
      .update({
        email: user.email,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        phone: user.phone,
        profile_picture: user.avatar,
        is_active: user.isActive,
        bio: user.bio,
        location: user.location,
      })
      .eq("id", id);
    return { data, error };
  };

  // DELETE USER
  const deleteUser = async (id: string) => {
    const { data, error } = await supabase.from("users").delete().eq("id", id);
    return { data, error };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let avatarUrl = formData.avatar;
    if (previewImage) {
      avatarUrl = previewImage;
    }
    if (modalMode === "add") {
      // CREATE USER to Supabase
      const { error } = await createUser({ ...formData, avatar: avatarUrl });
      if (!error) {
        showNotification(
          "success",
          `User ${formData.firstName} ${formData.lastName} added successfully!`
        );
        // Refresh user list
        const { data } = await supabase
          .from("users")
          .select(
            "id, email, username, role, first_name, last_name, phone, date_of_birth, gender, profile_picture, is_active, bio, location, languages, experience, created_at"
          );
        if (data) {
          const enhancedUsers: EnhancedUser[] = (data || []).map(
            (user: any) => ({
              id: String(user.id),
              email: user.email,
              username: user.username || "",
              role:
                user.role === undefined ||
                user.role === null ||
                user.role === "unknown"
                  ? "customer"
                  : user.role,
              profile: {
                firstName: user.first_name,
                lastName: user.last_name,
                location: user.location || "",
                avatar: user.profile_picture || "",
                bio: user.bio || "",
                phone: user.phone || "",
              },
              createdAt: user.created_at,
              isActive: user.is_active ?? true,
              specialties: [],
              languages: Array.isArray(user.languages) ? user.languages : [],
            })
          );
          setUsers(enhancedUsers);
          setFilteredUsers(enhancedUsers);
        }
      } else {
        showNotification("error", error.message);
      }
    } else {
      // UPDATE USER to Supabase
      const { error } = await updateUser(formData.id, {
        ...formData,
        avatar: avatarUrl,
      });
      if (!error) {
        showNotification(
          "success",
          `User ${formData.firstName} ${formData.lastName} updated successfully!`
        );
        // Refresh user list
        const { data } = await supabase
          .from("users")
          .select(
            "id, email, username, role, first_name, last_name, phone, date_of_birth, gender, profile_picture, is_active, bio, location, languages, experience, created_at"
          );
        if (data) {
          const enhancedUsers: EnhancedUser[] = (data || []).map(
            (user: any) => ({
              id: String(user.id),
              email: user.email,
              username: user.username || "",
              role:
                user.role === undefined ||
                user.role === null ||
                user.role === "unknown"
                  ? "customer"
                  : user.role,
              profile: {
                firstName: user.first_name,
                lastName: user.last_name,
                location: user.location || "",
                avatar: user.profile_picture || "",
                bio: user.bio || "",
                phone: user.phone || "",
              },
              createdAt: user.created_at,
              isActive: user.is_active ?? true,
              specialties: [],
              languages: Array.isArray(user.languages) ? user.languages : [],
            })
          );
          setUsers(enhancedUsers);
          setFilteredUsers(enhancedUsers);
        }
      } else {
        showNotification("error", error.message);
      }
    }
    setIsModalOpen(false);
    resetForm();
  };

  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    const { error } = await deleteUser(id);
    if (!error) {
      showNotification("success", "User deleted successfully!");
      // Refresh user list
      const { data } = await supabase
        .from("users")
        .select(
          "id, email, username, role, first_name, last_name, phone, date_of_birth, gender, profile_picture, is_active, bio, location, languages, experience, created_at"
        );
      if (data) {
        const enhancedUsers: EnhancedUser[] = (data || []).map((user: any) => ({
          id: String(user.id),
          email: user.email,
          username: user.username || "",
          role:
            user.role === undefined ||
            user.role === null ||
            user.role === "unknown"
              ? "customer"
              : user.role,
          profile: {
            firstName: user.first_name,
            lastName: user.last_name,
            location: user.location || "",
            avatar: user.profile_picture || "",
            bio: user.bio || "",
            phone: user.phone || "",
          },
          createdAt: user.created_at,
          isActive: user.is_active ?? true,
          specialties: [],
          languages: Array.isArray(user.languages) ? user.languages : [],
        }));
        setUsers(enhancedUsers);
        setFilteredUsers(enhancedUsers);
      }
    } else {
      showNotification("error", error.message);
    }
  };

  return (
    <>
      {/* Header with counts */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
            <div className="text-sm text-teal-600 mb-1">Total Users</div>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "customer").length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="text-sm text-green-600 mb-1">Tour Guides</div>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "tour_guide").length}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 mb-1">Administrators</div>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          <div className="flex gap-4">
            {/* Role Filter */}
            <div className="relative">
              <select
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as UserRole | "all")
                }
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="tour_guide">Tour Guides</option>
                <option value="admin">Administrators</option>
              </select>
              <Filter className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Filter className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            {/* Add User Button */}
            <button
              className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors"
              onClick={() => handleAddUser()}
            >
              <UserPlus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
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
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
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
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {" "}
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          {user.profile.avatar ? (
                            <img
                              src={user.profile.avatar}
                              alt={user.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-teal-100 text-teal-800 font-semibold">
                              {user.profile.firstName.charAt(0)}
                              {user.profile.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile.firstName} {user.profile.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.profile.location || "Not set"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className={`${
                            user.isActive
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                              : "text-green-500 hover:text-green-700 hover:bg-green-50"
                          } p-1 rounded`}
                          title={
                            user.isActive ? "Deactivate User" : "Activate User"
                          }
                          onClick={() => {
                            const confirmMessage = user.isActive
                              ? `Are you sure you want to deactivate ${user.profile.firstName} ${user.profile.lastName}?`
                              : `Do you want to reactivate ${user.profile.firstName} ${user.profile.lastName}?`;

                            if (window.confirm(confirmMessage)) {
                              // Toggle user active status
                              setUsers((prevUsers) =>
                                prevUsers.map((u) =>
                                  u.id === user.id
                                    ? { ...u, isActive: !u.isActive }
                                    : u
                                )
                              );

                              const message = user.isActive
                                ? `User ${user.profile.firstName} ${user.profile.lastName} has been deactivated.`
                                : `User ${user.profile.firstName} ${user.profile.lastName} has been reactivated.`;

                              showNotification("success", message);
                            }
                          }}
                        >
                          {user.isActive ? (
                            <UserX className="w-5 h-5" />
                          ) : (
                            <UserCheck className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                          title="View Details"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                          title="Delete User"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete ${user.profile.firstName} ${user.profile.lastName}?`
                              )
                            ) {
                              handleDeleteUser(user.id);
                            }
                          }}
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  currentPage >= Math.ceil(filteredUsers.length / usersPerPage)
                }
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage >= Math.ceil(filteredUsers.length / usersPerPage)
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                  <span className="font-medium">
                    {indexOfLastUser > filteredUsers.length
                      ? filteredUsers.length
                      : indexOfLastUser}
                  </span>{" "}
                  of <span className="font-medium">{filteredUsers.length}</span>{" "}
                  users
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({
                    length: Math.ceil(filteredUsers.length / usersPerPage),
                  }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? "z-10 bg-teal-50 border-teal-500 text-teal-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage >=
                      Math.ceil(filteredUsers.length / usersPerPage)
                    }
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage >=
                      Math.ceil(filteredUsers.length / usersPerPage)
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white flex items-center animate-fade-in-right z-50`}
        >
          {notification.type === "success" ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Modal for Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === "add" ? "Add User" : "Edit User"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto p-6 flex-grow">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mb-2 relative">
                    {previewImage || formData.avatar ? (
                      <img
                        src={previewImage || formData.avatar}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-teal-100 text-teal-800 font-semibold">
                        {formData.firstName ? formData.firstName.charAt(0) : ""}
                        {formData.lastName ? formData.lastName.charAt(0) : ""}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-teal-50 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>
                      {formData.avatar || previewImage
                        ? "Change Avatar"
                        : "Upload Avatar"}
                    </span>
                  </button>
                  {(formData.avatar || previewImage) && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, avatar: "" }));
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Remove Image
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: 2MB (JPG, PNG, GIF)
                  </p>
                </div>
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        formErrors.firstName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        formErrors.lastName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                {/* Username and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        formErrors.username
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter username"
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.username}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
                {/* Role, Location and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="user">User</option>
                      <option value="tour_guide">Tour Guide</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter bio"
                    rows={3}
                  />
                </div>
                {/* Active Status - Only show in edit mode */}
                {modalMode === "edit" && (
                  <div className="flex items-center mt-2">
                    {" "}
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />{" "}
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      User account is active
                    </label>
                  </div>
                )}
                {/* Modal Footer */}{" "}
                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                  >
                    {" "}
                    {modalMode === "add" ? "Add User" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isDetailsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                User Details
              </h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto p-6 flex-grow">
              {/* User Profile Header */}
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                  {selectedUser.profile.avatar ? (
                    <img
                      src={selectedUser.profile.avatar}
                      alt={`${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-teal-100 text-teal-800 font-semibold">
                      {selectedUser.profile.firstName.charAt(0)}
                      {selectedUser.profile.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.profile.firstName}{" "}
                    {selectedUser.profile.lastName}
                  </h3>
                  <div className="flex items-center mt-1">
                    <RoleBadge role={selectedUser.role} />
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                        selectedUser.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                {/* Account Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Account Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="text-sm font-medium">
                          {selectedUser.username}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 text-gray-400 mr-1" />
                          <p className="text-sm font-medium text-teal-600">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Member Since</p>
                        <p className="text-sm font-medium">
                          {new Date(selectedUser.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Login</p>
                        <p className="text-sm font-medium">
                          {selectedUser.lastLogin
                            ? new Date(
                                selectedUser.lastLogin
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Contact Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.profile.phone && (
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 text-gray-400 mr-1" />
                            <p className="text-sm font-medium">
                              {selectedUser.profile.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedUser.profile.location && (
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                            <p className="text-sm font-medium">
                              {selectedUser.profile.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedUser.profile.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Bio
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedUser.profile.bio}</p>
                    </div>
                  </div>
                )}

                {/* Specialties and Languages - Only for Tour Guides */}
                {selectedUser.role === "tour_guide" && (
                  <div className="space-y-4">
                    {/* Specialties */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700">
                        Specialties
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.specialties.map((specialty: string) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
                          >
                            {specialty.charAt(0).toUpperCase() +
                              specialty.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.languages.map((language: string) => (
                          <span
                            key={language}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
                          >
                            {language.charAt(0).toUpperCase() +
                              language.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleEditUser(selectedUser);
                  setIsDetailsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersContent;
