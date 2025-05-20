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
import TourGuideProfilePage from "./pages/TourGuideProfilePage";
import ReviewsPage from "./pages/ReviewsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/Login"; // Import halaman login
import RegisterPage from "./pages/Register"; // Import halaman register

function App() {
  const location = useLocation();

  // Check if the current path is the login or register route
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinations" element={<DestinationsListPage />} />
          <Route path="/destinations/:id" element={<DestinationPage />} />
          <Route path="/itineraries" element={<ItinerariesPage />} />
          <Route path="/itineraries/:id" element={<ItineraryDetailPage />} />
          <Route path="/tour-guides" element={<TourGuidesPage />} />
          <Route path="/tour-guides/:id" element={<TourGuideProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/login" element={<LoginPage />} /> {/* Rute login */}
          <Route path="/register" element={<RegisterPage />} />{" "}
          {/* Rute register */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
