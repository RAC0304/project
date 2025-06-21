import React, { useState, useEffect } from "react";
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
import { useEnhancedAuth } from "../contexts/useEnhancedAuth";
import { Tour } from "../services/tourService";
import {
  getToursByGuide,
  createTour,
  updateTour,
  deleteTour,
} from "../services/tourService";
import { getTourGuideIdByUserId } from "../services/tourGuideService";
import { getGuideStats } from "../services/guideStatsService";
import { getUpcomingToursByGuide } from "../services/upcomingToursService";
import { UpcomingTour } from "../services/upcomingToursService";
import { Review } from "../services/recentReviewsService";
import { getRecentReviewsByGuide } from "../services/recentReviewsService";

const TourGuideDashboard: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tourToEdit, setTourToEdit] = useState<Tour | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
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
  const [tourGuideId, setTourGuideId] = useState<number | null>(null);
  const [guideStats, setGuideStats] = useState<GuideStats | null>(null);
  const [upcomingTours, setUpcomingTours] = useState<UpcomingTour[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  interface GuideStats {
    totalTours: number;
    upcomingTours: number;
    totalClients: number;
    averageRating: number;
    monthlyEarnings: number;
    responseRate: number;
    monthlyBookings: number;
    bookingsTrend?: string;
    earningsTrend?: string;
    clientsTrend?: string;
    ratingTrend?: string;
  }

  useEffect(() => {
    if (!user) {
      setTourGuideId(null);
      setTours([]);
      setGuideStats(null);
    } else {
      getTourGuideIdByUserId(Number(user.id)).then(setTourGuideId);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);

    if (!user || !tourGuideId) {
      setTours([]);
      setGuideStats(null);
      setUpcomingTours([]);
      setRecentReviews([]);
      setIsLoading(false);
    } else {
      Promise.all([
        getToursByGuide(tourGuideId).then((data) => setTours(data)),
        getGuideStats(tourGuideId).then((stats) => {
          const formattedStats: GuideStats = {
            totalTours: stats.totalTours || 0,
            upcomingTours: stats.activeTours || 0,
            totalClients: stats.totalClients || 0,
            averageRating: stats.averageRating || 0,
            monthlyEarnings: stats.monthlyEarnings || 0,
            responseRate: 94, // Dummy, sesuaikan jika ada data
            monthlyBookings: stats.totalBookings || 0,
            bookingsTrend: "100% this month", // Dummy, sesuaikan jika ada data
            earningsTrend: `IDR ${stats.monthlyEarnings?.toLocaleString(
              "id-ID"
            )}`,
            clientsTrend: `${stats.activeTours || 0} upcoming`,
            ratingTrend: "Active guide",
          };
          setGuideStats(formattedStats);
        }),
        getUpcomingToursByGuide(tourGuideId).then(setUpcomingTours),
        getRecentReviewsByGuide(tourGuideId).then(setRecentReviews),
      ])
        .catch((err) => {
          console.error("Gagal mengambil data dari Supabase:", err);
          showToast("error", "Gagal memuat data dashboard dari server.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, tourGuideId]);

  // Tambahkan efek untuk refetch data dashboard setiap kali menu dashboard diaktifkan
  useEffect(() => {
    if (activePage === "dashboard") {
      setIsLoading(true);
      if (!user || !tourGuideId) {
        setTours([]);
        setGuideStats(null);
        setUpcomingTours([]);
        setRecentReviews([]);
        setIsLoading(false);
      } else {
        Promise.all([
          getToursByGuide(tourGuideId).then((data) => setTours(data)),
          getGuideStats(tourGuideId).then((stats) => {
            const formattedStats: GuideStats = {
              totalTours: stats.totalTours || 0,
              upcomingTours: stats.activeTours || 0,
              totalClients: stats.totalClients || 0,
              averageRating: stats.averageRating || 0,
              monthlyEarnings: stats.monthlyEarnings || 0,
              responseRate: 94,
              monthlyBookings: stats.totalBookings || 0,
              bookingsTrend: "100% this month",
              earningsTrend: `IDR ${stats.monthlyEarnings?.toLocaleString(
                "id-ID"
              )}`,
              clientsTrend: `${stats.activeTours || 0} upcoming`,
              ratingTrend: "Active guide",
            };
            setGuideStats(formattedStats);
          }),
          getUpcomingToursByGuide(tourGuideId).then(setUpcomingTours),
          getRecentReviewsByGuide(tourGuideId).then(setRecentReviews),
        ])
          .catch((err) => {
            console.error("Gagal mengambil data dari Supabase:", err);
            showToast("error", "Gagal memuat data dashboard dari server.");
          })
          .finally(() => setIsLoading(false));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

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

  const handleEditTour = (tour: Tour) => {
    setTourToEdit(tour);
    setIsEditModalOpen(true);
  };
  const handleCreateTour = () => {
    setTourToEdit(null);
    setIsEditModalOpen(true);
  };
  const handleSaveTour = async (tourData: Tour) => {
    console.log("TourGuideDashboard - handleSaveTour received:", tourData);
    console.log("TourGuideDashboard - tourData.id:", tourData.id);

    setIsLoading(true);
    try {
      const { id, ...tourToSave } = tourData;
      console.log("TourGuideDashboard - destructured id:", id);
      console.log("TourGuideDashboard - tourToSave:", tourToSave);
      if (id && id > 0) {
        console.log("TourGuideDashboard - Updating tour with id:", id);
        const updated = await updateTour(id, tourToSave);
        console.log("TourGuideDashboard - Updated tour result:", updated);
        setTours((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        showToast("success", "Tour updated successfully!");
      } else {
        console.log("TourGuideDashboard - Creating new tour");
        if (!tourGuideId) throw new Error("Tour guide ID not found");
        const created = await createTour({
          ...tourToSave,
          tour_guide_id: tourGuideId,
        });
        console.log("TourGuideDashboard - Created tour result:", created);
        setTours((prev) => [...prev, created]);
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
    setIsLoading(true);
    try {
      await deleteTour(tourId);
      setTours((prev) => prev.filter((tour) => tour.id !== tourId));
      showToast("success", "Tour deleted successfully!");
    } catch (error) {
      console.error("Failed to delete tour:", error);
      showToast("error", "Failed to delete tour. Please try again.");
    } finally {
      setIsLoading(false);
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
        <div className="sticky top-0 z-10  px-4 py-3 flex items-center justify-between">
          <div className="hidden lg:block">
            <MinimizeButton
              isMinimized={sidebarMinimized}
              onToggle={toggleSidebar}
            />
          </div>
        </div>
        <div className="px-4 pt-4">
          {" "}
          {activePage === "dashboard" && (
            <DashboardContent
              guideStats={guideStats || undefined}
              upcomingTours={upcomingTours}
              recentReviews={recentReviews}
              setActivePage={setActivePage}
              loading={isLoading}
            />
          )}
          {activePage === "profile" && <ProfileContent user={user} />}
          {activePage === "tours" && (
            <ToursContent
              tours={tours}
              onEditTour={handleEditTour}
              onCreateTour={handleCreateTour}
              onDeleteTour={handleDeleteTour}
              isLoading={isLoading}
            />
          )}
          {activePage === "bookings" && (
            <BookingsContent tourGuideId={Number(user.id)} />
          )}
          {activePage === "clients" && <ClientsContent tourGuideId={user.id} />}
          {activePage === "reviews" && <ReviewsContent tourGuideId={user.id} />}
          {activePage === "messages" && tourGuideId && (
            <MessagesContent tourGuideId={tourGuideId.toString()} />
          )}
        </div>
      </main>
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
