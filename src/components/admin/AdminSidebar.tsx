import React from 'react';
import {
    Users,
    BarChart3,
    MapPin,
    Calendar,
    UserCheck,
    LogOut,
    Layout
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RoleBadge from '../common/RoleBadge';

interface AdminSidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activePage,
    setActivePage,
    mobileMenuOpen,
    setMobileMenuOpen
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}
            <div className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                } w-64 bg-white h-screen shadow-lg fixed left-0 top-0 z-20 transition-transform duration-300 ease-in-out flex flex-col`}>
                {/* Logo/Brand */}
                <div className="h-20 bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center px-6 flex-shrink-0">
                    <h1 className="text-xl font-bold text-white">WanderWise Admin</h1>
                </div>

                {/* Profile Summary */}
                <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 bg-white">
                            <img
                                src={"/src/asset/image/logologin.png"}
                                alt="Profile Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-medium text-gray-900 truncate">
                                {user?.profile.firstName} {user?.profile.lastName}
                            </h2>
                            <div className="flex items-center mt-1">
                                <RoleBadge role={user?.role || "admin"} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto px-4 py-4">
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => setActivePage("dashboard")}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activePage === "dashboard" ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Layout className="w-5 h-5" />
                                <span>Dashboard</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActivePage("users")}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activePage === "users" ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                <span>Users</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActivePage("guides")}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activePage === "guides" ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <UserCheck className="w-5 h-5" />
                                <span>Tour Guides</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActivePage("destinations")}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activePage === "destinations" ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <MapPin className="w-5 h-5" />
                                <span>Destinations</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActivePage("bookings")}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activePage === "bookings" ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Bookings</span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActivePage("analytics")}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activePage === "analytics" ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>Analytics</span>
                            </button>
                        </li>




                        {/* Add some extra space at the bottom for better scrolling experience */}
                        <div className="h-16"></div>
                    </ul>
                </nav>

                {/* Logout at bottom */}
                <div className="w-full p-4 bg-gray-50 shadow-inner flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;