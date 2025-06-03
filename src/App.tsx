import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense } from 'react';
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy load all page components
const HomePage = lazy(() => import("./pages/HomePage"));
const DestinationPage = lazy(() => import("./pages/DestinationPage"));
const DestinationsListPage = lazy(() => import("./pages/DestinationsListPage"));
const ItinerariesPage = lazy(() => import("./pages/ItinerariesPage"));
const ItineraryDetailPage = lazy(() => import("./pages/ItineraryDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TourGuidesPage = lazy(() => import("./pages/TourGuidesPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const TourGuideDashboard = lazy(() => import("./pages/TourGuideDashboard"));
const MapDemoPage = lazy(() => import("./pages/MapDemoPage"));

function App() {
  const location = useLocation();

  // Check if the current path is the login, register, unauthorized page
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/unauthorized";

  // Check if it's the guide or admin dashboard page to hide header and footer
  const isGuideDashboard = location.pathname === "/guide/dashboard";
  const isAdminDashboard = location.pathname === "/admin/dashboard";

  // Combined condition to check if header/footer should be hidden
  const hideHeaderFooter = isAuthPage || isGuideDashboard || isAdminDashboard;
  // Loading spinner component for lazy-loaded routes
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-blue-600 animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!hideHeaderFooter && <Header />}
      <main className={`flex-grow ${!hideHeaderFooter ? "pt-14" : ""}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} /><Route path="/destinations" element={<DestinationsListPage />} />
            <Route path="/destinations/:id" element={<DestinationPage />} />
            <Route path="/itineraries" element={<ItinerariesPage />} />
            <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
            <Route path="/tour-guides" element={<TourGuidesPage />} />
            {/* <Route path="/tour-guides/:id" element={<TourGuideProfilePage />} /> */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/map" element={<MapDemoPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Admin Only Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Tour Guide Only Routes */}
            <Route
              path="/guide/dashboard"
              element={
                <ProtectedRoute requiredRole="tour_guide">
                  <TourGuideDashboard />
                </ProtectedRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />          <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

// Create router with future flags to address React Router warnings
const createRouterWithFutureFlags = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
};

export default function AppWrapper() {
  return createRouterWithFutureFlags();
}
