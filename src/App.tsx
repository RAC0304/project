import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import DestinationPage from "./pages/DestinationPage";
import DestinationsListPage from "./pages/DestinationsListPage";
import ItinerariesPage from "./pages/ItinerariesPage";
import ItineraryDetailPage from "./pages/ItineraryDetailPage";
import AboutPage from "./pages/AboutPage";
import TourGuidesPage from "./pages/TourGuidesPage";
// import TourGuideProfilePage from "./pages/TourGuideProfilePage";
import ReviewsPage from "./pages/ReviewsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import UserProfilePage from "./pages/UserProfilePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TourGuideDashboard from "./pages/TourGuideDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!hideHeaderFooter && <Header />}
      <main className={`flex-grow ${!hideHeaderFooter ? "pt-14" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsListPage />} />
          <Route path="/destinations/:id" element={<DestinationPage />} />
          <Route path="/itineraries" element={<ItinerariesPage />} />
          <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
          <Route path="/tour-guides" element={<TourGuidesPage />} />
          {/* <Route path="/tour-guides/:id" element={<TourGuideProfilePage />} /> */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />

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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />        </Routes>
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
