import React, { useState } from "react";
import TourGuideSidebar from "../components/tourguide/layout/TourGuideSidebar";
import MessagesContent from "../components/tourguide/dashboard/MessagesContent";
import DashboardContent from "../components/tourguide/dashboard/DashboardContent";
import ProfileContent from "../components/tourguide/dashboard/ProfileContent";
import ToursContent from "../components/tourguide/dashboard/ToursContent";
import BookingsContent from "../components/tourguide/dashboard/BookingsContent";
import ClientsContent from "../components/tourguide/dashboard/ClientsContent";
import ReviewsContent from "../components/tourguide/dashboard/ReviewsContent";
import EditTourModal from "../components/tourguide/modals/EditTourModal";
import Toast, { ToastType } from "../components/common/Toast";
import { User } from "../types/user";
import { TourData } from "../types/tourguide";
import {
  calculateGuideStats,
  getUpcomingTours,
  recentReviews,
  tours as initialTours,
} from "../data/tourGuideDashboardData";

const TourGuideDashboard: React.FC = () => {
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
  const [user] = useState<User>({
    id: "guide-001",
    email: "example@email.com",
    username: "johndoe",
    role: "tour_guide",
    profile: {
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      location: "Jakarta, Indonesia",
      bio: "Experienced tour guide with passion for history and culture",
    },
    createdAt: new Date().toISOString(),
  });

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

  return (
    <div className="flex h-screen bg-gray-50">
      {" "}
      <TourGuideSidebar
        activePage={activePage}
        onPageChange={setActivePage}
        onMinimizeChange={handleSidebarMinimize}
      />{" "}
      <main
        className={`flex-1 overflow-auto ${
          sidebarMinimized ? "lg:pl-28" : "lg:pl-80"
        } pt-4 px-4 transition-all duration-300`}
      >
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
        {activePage === "bookings" && <BookingsContent tourGuideId={user.id} />}
        {activePage === "clients" && <ClientsContent tourGuideId={user.id} />}
        {activePage === "reviews" && <ReviewsContent tourGuideId={user.id} />}
        {activePage === "messages" && <MessagesContent />}
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
