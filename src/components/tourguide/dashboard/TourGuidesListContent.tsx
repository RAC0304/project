import React, { useState, useEffect } from "react";
import { Star, MapPin, Globe, Users, Award } from "lucide-react";
import {
  getAllTourGuides,
  TourGuideData,
} from "../../../services/tourGuideService";

interface TourGuidesListContentProps {
  loading?: boolean;
}

const TourGuidesListContent: React.FC<TourGuidesListContentProps> = ({
  loading = false,
}) => {
  const [tourGuides, setTourGuides] = useState<TourGuideData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllTourGuides();
  }, []);

  const fetchAllTourGuides = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllTourGuides();
      setTourGuides(data);
    } catch (err) {
      setError("Gagal memuat data tour guide");
      console.error("Error fetching all tour guides:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTourGuides = tourGuides.filter((guide) => {
    const matchesSearch =
      guide.users?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      guide.users?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      guide.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderTourGuideCard = (guide: TourGuideData) => {
    const fullName = `${guide.users?.first_name || ""} ${
      guide.users?.last_name || ""
    }`.trim();
    const languages =
      guide.tour_guide_languages?.map((lang) => lang.language) || [];

    return (
      <div
        key={guide.id}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
      >
        <div className="p-6">
          {/* Header with profile picture and basic info */}
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "TG"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {fullName || "Nama tidak tersedia"}
                </h3>
                {guide.is_verified && (
                  <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{guide.users?.email}</p>

              {/* Rating */}
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(guide.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {guide.rating?.toFixed(1) || "0.0"} ({guide.review_count || 0}{" "}
                  reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Location and languages */}
          <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{guide.location || "Lokasi tidak tersedia"}</span>
            </div>
            {languages.length > 0 && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                <span>{languages.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Users className="w-4 h-4 mr-1" />
            <span>{guide.experience || 0} years experience</span>
          </div>

          {/* Bio */}
          {(guide.short_bio || guide.bio) && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {guide.short_bio || guide.bio}
            </p>
          )}

          {/* Specialties */}
          {guide.specialties && typeof guide.specialties === "object" && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Specialties:
              </h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(guide.specialties).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-block px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-full"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
            <div className="text-gray-600">ID: {guide.id}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Daftar Tour Guide</h2>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full max-w-xs"
          placeholder="Cari nama, lokasi, atau bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isLoading || loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filteredTourGuides.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          Tidak ada tour guide ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTourGuides.map(renderTourGuideCard)}
        </div>
      )}
    </div>
  );
};

export default TourGuidesListContent;
