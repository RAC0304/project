import React, { useState } from "react";
import TourGuideSidebar from "../components/tourguide/layout/TourGuideSidebar";
import MinimizeButton from "../components/tourguide/layout/MinimizeButton";
import MessagesContent from "../components/tourguide/dashboard/MessagesContent";
import DashboardContent from "../components/tourguide/dashboard/DashboardContent";
import ProfileContent from "../components/tourguide/dashboard/ProfileContent";
import ToursContent from "../components/tourguide/dashboard/ToursContent";
import BookingsContent from "../components/tourguide/dashboard/BookingsContent";
import ClientsContent from "../components/tourguide/dashboard/ClientsContent";
import ReviewsContent from "../components/tourguide/dashboard/ReviewsContent";
import EditTourModal from "../components/tourguide/modals/EditTourModal";
import Toast, { ToastType } from "../components/common/Toast";
import { useAuth } from "../contexts/AuthContext";
import { TourData } from "../types/tourguide";
import {
  calculateGuideStats,
  getUpcomingTours,
  recentReviews,
  tours as initialTours,
} from "../data/tourGuideDashboardData";

const TourGuideDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tourToEdit, setTourToEdit] = useState<TourData | null>(null);
  const [tours, setTours] = useState<TourData[]>(initialTours);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    type: ToastType;
    message: string;
  }>({
    isVisible: false,
    type: "success",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">
            Please log in to access the dashboard
          </h2>
        </div>
      </div>
    );
  }

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
  const handleEditTour = (tour: TourData) => {
    console.log("Editing tour:", tour);
    setTourToEdit(tour);
    setIsEditModalOpen(true);
  };
  const handleCreateTour = () => {
    console.log("Creating new tour...");
    setTourToEdit(null);
    setIsEditModalOpen(true);
  };
  const handleSaveTour = async (tourData: TourData) => {
    console.log("Saving tour:", tourData);
    setIsLoading(true);

    try {
      const isUpdating = tourData.id && tours.find((t) => t.id === tourData.id);

      if (isUpdating) {
        // Update existing tour
        setTours((prev) =>
          prev.map((tour) => (tour.id === tourData.id ? tourData : tour))
        );
        showToast("success", "Tour updated successfully!");
      } else {
        // Create new tour
        const newTour = {
          ...tourData,
          id: Math.max(...tours.map((t) => t.id), 0) + 1,
          clients: 0,
        };
        setTours((prev) => [...prev, newTour]);
        showToast("success", "Tour created successfully!");
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to save tour:", error);
      showToast("error", "Failed to save tour. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteTour = async (tourId: number) => {
    try {
      const tourToDelete = tours.find((t) => t.id === tourId);
      setTours((prev) => prev.filter((tour) => tour.id !== tourId));
      showToast(
        "success",
        `Tour "${tourToDelete?.title}" deleted successfully!`
      );
    } catch (error) {
      console.error("Failed to delete tour:", error);
      showToast("error", "Failed to delete tour. Please try again.");
      throw error;
    }
  };
  const handleSidebarMinimize = (isMinimized: boolean) => {
    setSidebarMinimized(isMinimized);
  };

  const toggleSidebar = () => {
    setSidebarMinimized(!sidebarMinimized);
  };
  return (
    <div className="flex h-screen bg-gray-50">
      <TourGuideSidebar
        activePage={activePage}
        onPageChange={setActivePage}
        onMinimizeChange={handleSidebarMinimize}
        isMinimized={sidebarMinimized}
      />
      <main
        className={`flex-1 overflow-auto ${
          sidebarMinimized ? "lg:pl-28" : "lg:pl-80"
        } transition-all duration-300`}
      >
        {" "}
        {/* Header with Minimize Button */}
        <div className="sticky top-0 z-10  px-4 py-3 flex items-center justify-between">
          <div className="hidden lg:block">
            <MinimizeButton
              isMinimized={sidebarMinimized}
              onToggle={toggleSidebar}
            />
          </div>
        </div>
        {/* Content Area */}
        <div className="px-4 pt-4">
          {activePage === "dashboard" && (
            <DashboardContent
              guideStats={calculateGuideStats(user.id)}
              upcomingTours={getUpcomingTours(user.id)}
              recentReviews={recentReviews}
              setActivePage={setActivePage}
            />
          )}
          {activePage === "profile" && <ProfileContent user={user} />}{" "}
          {activePage === "tours" && (
            <ToursContent
              tours={tours}
              onEditTour={handleEditTour}
              onCreateTour={handleCreateTour}
              onDeleteTour={handleDeleteTour}
              isLoading={isLoading}
            />
          )}{" "}
          {activePage === "bookings" && (
            <BookingsContent tourGuideId={user.id} />
          )}{" "}
          {activePage === "clients" && <ClientsContent tourGuideId={user.id} />}
          {activePage === "reviews" && <ReviewsContent tourGuideId={user.id} />}
          {activePage === "messages" && <MessagesContent />}
        </div>
      </main>{" "}
      <EditTourModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tourData={tourToEdit}
        onSave={handleSaveTour}
      />
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default TourGuideDashboard;
