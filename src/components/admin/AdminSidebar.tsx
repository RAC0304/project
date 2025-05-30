import React from 'react';
import {
    Users,
    BarChart3,
    MapPin,
    Calendar,
    UserCheck,
    LogOut,
    Layout,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RoleBadge from '../common/RoleBadge';
import { LOGO_IMAGE } from '../../constants/images';

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

    // Define menu item groups for better organization
    const menuItems = [
        {
            group: "Main",
            items: [
                { id: "dashboard", label: "Dashboard", icon: <Layout className="w-[18px] h-[18px]" /> }
            ]
        },
        {
            group: "Management",
            items: [
                { id: "users", label: "Users", icon: <Users className="w-[18px] h-[18px]" /> },
                { id: "guides", label: "Tour Guides", icon: <UserCheck className="w-[18px] h-[18px]" /> }
            ]
        },
        {
            group: "Content",
            items: [
                { id: "destinations", label: "Destinations", icon: <MapPin className="w-[18px] h-[18px]" /> }
            ]
        },
        {
            group: "Operations",
            items: [
                { id: "bookings", label: "Bookings", icon: <Calendar className="w-[18px] h-[18px]" /> },
                { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-[18px] h-[18px]" /> }
            ]
        }
    ];

    return (
        <>
            {/* Overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}            {/* Sidebar - Desktop always visible, mobile only when mobileMenuOpen is true */}
            <div className={`${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                } w-72 bg-white h-screen shadow-xl fixed left-0 top-0 z-20 transition-transform duration-300 ease-in-out flex flex-col overflow-hidden`}>
                {/* Logo/Brand */}
                <div className="h-20 bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center px-6 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-md flex items-center justify-center shadow-md">
                            <img src={LOGO_IMAGE}
                                alt="WanderWise Logo"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-wide">WanderWise</h1>
                    </div>
                </div>

                {/* Profile Summary - Improved with better spacing and shadow */}
                <div className="p-5 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500 bg-white shadow-inner">
                            <img src={LOGO_IMAGE}
                                alt="Profile Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold text-gray-800 truncate">
                                {user?.profile.firstName} {user?.profile.lastName}
                            </h2>
                            <div className="flex items-center mt-1">
                                <RoleBadge role={user?.role || "admin"} />
                            </div>
                        </div>
                    </div>                </div>

                {/* Navigation with scrollable content */}
                <nav className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2">
                        {menuItems.map((menuGroup, groupIdx) => (
                            <div key={groupIdx} className="mb-5">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                                    {menuGroup.group}
                                </h3>
                                <ul className="space-y-1">
                                    {menuGroup.items.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => setActivePage(item.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${activePage === item.id
                                                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                                                    : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {item.icon}
                                                    <span className="font-medium">{item.label}</span>
                                                </div>
                                                {activePage === item.id && (
                                                    <ChevronRight className="w-4 h-4 text-white" />
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>))}                    {/* Add some bottom padding for better scroll experience */}
                        <div className="h-4"></div>
                    </div>

                    {/* Logout button positioned directly after navigation items */}
                    <div className="px-4 py-4 border-t border-gray-100 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 p-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default AdminSidebar;