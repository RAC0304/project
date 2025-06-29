import { supabase } from "../config/supabaseClient";
import { Booking } from "./bookingService";

export interface BookingWithDetails extends Booking {
  userName?: string;
  userEmail?: string;
  tourName?: string;
}

// Fungsi debug untuk verifikasi data di Supabase, sekarang mengembalikan log
export async function debugVerifyDatabaseRelations(tourGuideId: number): Promise<string[]> {
  const debugLog: string[] = [];
  debugLog.push("=== DEBUG: Verifikasi Database Relasi ===");

  // 1. Cek tour guide
  const { data: tourGuides, error: tourGuideError } = await supabase
    .from("tour_guides")
    .select("*")
    .eq("id", tourGuideId);

  if (tourGuides && tourGuides.length > 0) {
    debugLog.push(`Tour guide dengan ID ${tourGuideId}: DITEMUKAN (${JSON.stringify(tourGuides[0])})`);
  } else {
    debugLog.push(`Tour guide dengan ID ${tourGuideId}: TIDAK DITEMUKAN`);
  }
  if (tourGuideError) debugLog.push("Error tour guide: " + JSON.stringify(tourGuideError));

  // 2. Cek semua tours milik tour guide
  const { data: tours, error: toursError } = await supabase
    .from("tours")
    .select("*")
    .eq("tour_guide_id", tourGuideId);

  debugLog.push(`Tours untuk tour guide ID ${tourGuideId}: ${tours?.length || 0}`);
  if (toursError) debugLog.push("Error tours: " + JSON.stringify(toursError));
  else if (tours?.length) debugLog.push("Sample tour: " + JSON.stringify(tours[0]));

  // 3. Cek tipe data ID tours
  if (tours?.length) {
    debugLog.push(`Tour ID type: ${typeof tours[0].id}, Value: ${tours[0].id}`);

    // 4. Cek bookings untuk tour pertama
    const tourId = tours[0].id;
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("tour_id", tourId);

    debugLog.push(`Bookings untuk tour ID ${tourId}: ${bookings?.length || 0}`);
    if (bookingsError) debugLog.push("Error bookings: " + JSON.stringify(bookingsError));
    else if (bookings?.length) {
      debugLog.push("Sample booking: " + JSON.stringify(bookings[0]));
      debugLog.push(`Booking tour_id type: ${typeof bookings[0].tour_id}`);

      // 5. Cek user untuk booking
      const userId = bookings[0].user_id;
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId);
      if (users && users.length > 0) {
        debugLog.push(`User untuk ID ${userId}: DITEMUKAN (${users[0].first_name} ${users[0].last_name})`);
      } else {
        debugLog.push(`User untuk ID ${userId}: TIDAK DITEMUKAN`);
      }
      if (userError) debugLog.push("Error user: " + JSON.stringify(userError));
    }
  }

  // 6. Cek langsung semua bookings untuk semua tours tour guide ini
  if (tours?.length) {
    const tourIds = tours.map(t => t.id);
    const { data: allBookings, error: allBookingsError } = await supabase
      .from("bookings")
      .select("*")
      .in("tour_id", tourIds);

    debugLog.push(`Semua bookings untuk tour guide (${tourIds.length} tours): ${allBookings?.length || 0}`);
    if (allBookingsError) debugLog.push("Error semua bookings: " + JSON.stringify(allBookingsError));
  }

  // Tambahan: Cek semua user dengan role tour_guide
  const { data: tourGuideUsers, error: tourGuideUsersError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("role", "tour_guide");
  if (tourGuideUsersError) {
    debugLog.push("Error users (role tour_guide): " + JSON.stringify(tourGuideUsersError));
  } else {
    debugLog.push(`Jumlah user dengan role 'tour_guide': ${tourGuideUsers?.length || 0}`);
    if (tourGuideUsers?.length) {
      debugLog.push(`Contoh user tour_guide: ${JSON.stringify(tourGuideUsers[0])}`);
    }
  }

  debugLog.push("=== END DEBUG ===");
  return debugLog;
}

// Ubah return getBookingsWithDetailsByGuide agar mengembalikan bookings dan debugLog
export async function getBookingsWithDetailsByGuide(
  tourGuideId: number
): Promise<{ bookings: BookingWithDetails[]; debugLog: string[] }> {
  console.log(`[getBookingsWithDetailsByGuide] Starting query for tour guide ID: ${tourGuideId}`);

  // Jalankan fungsi debug untuk verifikasi data
  const debugLog = await debugVerifyDatabaseRelations(tourGuideId);

  try {
    // Get all tour IDs for this guide
    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("id, title")
      .eq("tour_guide_id", tourGuideId);

    if (toursError) {
      console.error("[getBookingsWithDetailsByGuide] Error fetching tours:", toursError);
      return { bookings: [], debugLog };
    }

    if (!tours || tours.length === 0) {
      console.warn(`[getBookingsWithDetailsByGuide] No tours found for tour guide ID: ${tourGuideId}`);
      return { bookings: [], debugLog };
    }

    console.log(`[getBookingsWithDetailsByGuide] Found ${tours.length} tours:`, tours);
    const tourIds = tours.map((t) => t.id);
    const tourIdsStr = tourIds.map(id => String(id));

    // PENTING: Convert semua ID ke string untuk memastikan kompatibilitas tipe
    console.log("Tour IDs (original):", tourIds);
    console.log("Tour IDs (string):", tourIdsStr);

    // Coba ambil bookings dengan kedua tipe (number dan string)
    let data = [];
    let error = null;

    // Pertama coba dengan tipe asli
    const resultOriginal = await supabase
      .from("bookings")
      .select("*")
      .in("tour_id", tourIds);

    if (resultOriginal.data?.length) {
      data = resultOriginal.data;
      console.log(`[getBookingsWithDetailsByGuide] Found ${data.length} bookings with original types`);
    } else {
      error = resultOriginal.error;

      // Jika tidak berhasil, coba dengan string
      const resultStr = await supabase
        .from("bookings")
        .select("*")
        .in("tour_id", tourIdsStr);

      if (resultStr.data?.length) {
        data = resultStr.data;
        console.log(`[getBookingsWithDetailsByGuide] Found ${data.length} bookings with string types`);
      } else {
        error = resultStr.error;
      }
    }

    if (error) {
      console.error("[getBookingsWithDetailsByGuide] Error fetching bookings:", error);
      return { bookings: [], debugLog };
    }

    if (!data || data.length === 0) {
      console.warn(`[getBookingsWithDetailsByGuide] No bookings found for tour IDs: ${tourIds.join(", ")}`);
      return { bookings: [], debugLog };
    }

    console.log(`[getBookingsWithDetailsByGuide] Found ${data.length} raw bookings:`, data);

    // Get all user details in one query
    const userIds = Array.from(new Set(data.map((b) => b.user_id)));
    // PENTING: Convert juga userIds ke string
    const userIdsStr = userIds.map(id => String(id));
    // Coba dengan kedua tipe
    let users: any[] = [];
    let usersError = null;

    const usersOriginal = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", userIds);

    if (usersOriginal.data?.length) {
      users = usersOriginal.data;
    } else {
      usersError = usersOriginal.error;

      const usersStr = await supabase
        .from("users")
        .select("id, first_name, last_name, email")
        .in("id", userIdsStr);

      if (usersStr.data?.length) {
        users = usersStr.data;
      } else {
        usersError = usersStr.error;
      }
    }

    if (usersError) {
      console.error("[getBookingsWithDetailsByGuide] Error fetching users:", usersError);
    }

    console.log(`[getBookingsWithDetailsByGuide] Found ${users?.length || 0} users`);

    // Map the bookings with tour and user details
    const bookingsWithDetails = data.map((booking) => {
      const tour = tours.find((t) => t.id === booking.tour_id || String(t.id) === String(booking.tour_id));
      const user = users?.find((u) => u.id === booking.user_id || String(u.id) === String(booking.user_id));

      return {
        ...booking,
        userName: user ? `${user.first_name} ${user.last_name}` : `User #${booking.user_id}`,
        userEmail: user?.email || "",
        tourName: tour?.title || `Tour #${booking.tour_id}`,
      };
    });

    console.log(`[getBookingsWithDetailsByGuide] Final bookings with details:`, bookingsWithDetails);
    return { bookings: bookingsWithDetails, debugLog };
  } catch (error) {
    console.error("[getBookingsWithDetailsByGuide] Unexpected error:", error);
    return { bookings: [], debugLog };
  }
}

// Fungsi baru: ambil bookings berdasarkan userId tour guide (bukan tour_guide_id)
export async function getBookingsWithDetailsByGuideUserId(
  tourGuideUserId: number
): Promise<{ bookings: BookingWithDetails[]; debugLog: string[] }> {
  const debugLog: string[] = [];
  debugLog.push(`=== STARTING: getBookingsWithDetailsByGuideUserId for user ID ${tourGuideUserId} ===`);

  // 1. Cek apakah user ada dan role-nya tour_guide
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, role")
    .eq("id", tourGuideUserId)
    .eq("role", "tour_guide");

  if (userError) {
    debugLog.push("Error fetching user: " + JSON.stringify(userError));
    return { bookings: [], debugLog };
  }

  if (!users || users.length === 0) {
    debugLog.push(`User dengan ID ${tourGuideUserId} tidak ditemukan atau bukan tour_guide`);
    return { bookings: [], debugLog };
  }

  const user = users[0];
  debugLog.push(`User ditemukan: ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);

  // 2. Cari profil tour_guide
  const { data: tourGuides, error: tourGuideError } = await supabase
    .from("tour_guides")
    .select("*")
    .eq("user_id", tourGuideUserId);

  if (tourGuideError) {
    debugLog.push("Error fetching tour_guide profile: " + JSON.stringify(tourGuideError));
    return { bookings: [], debugLog };
  }

  if (!tourGuides || tourGuides.length === 0) {
    debugLog.push(`User ${tourGuideUserId} belum punya profil tour_guide di tabel tour_guides`);
    return { bookings: [], debugLog };
  }

  const tourGuideProfile = tourGuides[0];
  debugLog.push(`Profil tour_guide ditemukan: ID ${tourGuideProfile.id}, Location: ${tourGuideProfile.location}`);

  // 3. Cari tours
  const { data: tours, error: toursError } = await supabase
    .from("tours")
    .select("*")
    .eq("tour_guide_id", tourGuideProfile.id);

  if (toursError) {
    debugLog.push("Error fetching tours: " + JSON.stringify(toursError));
    return { bookings: [], debugLog };
  }

  if (!tours || tours.length === 0) {
    debugLog.push(`Tour guide ${tourGuideProfile.id} belum punya tour di tabel tours`);
    return { bookings: [], debugLog };
  }

  debugLog.push(`Ditemukan ${tours.length} tours untuk tour_guide ${tourGuideProfile.id}`);
  const tourIds = tours.map(t => t.id);

  // 4. Cari bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .in("tour_id", tourIds);

  if (bookingsError) {
    debugLog.push("Error fetching bookings: " + JSON.stringify(bookingsError));
    return { bookings: [], debugLog };
  }

  if (!bookings || bookings.length === 0) {
    debugLog.push(`Tidak ada bookings untuk tours: ${tourIds.join(", ")}`);
    return { bookings: [], debugLog };
  }

  debugLog.push(`Ditemukan ${bookings.length} bookings`);

  // 5. Ambil data customers
  const customerIds = Array.from(new Set(bookings.map(b => b.user_id)));
  const { data: customers, error: customersError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .in("id", customerIds);

  if (customersError) {
    debugLog.push("Error fetching customers: " + JSON.stringify(customersError));
  }

  // 6. Map bookings dengan details
  const bookingsWithDetails = bookings.map((booking) => {
    const tour = tours.find(t => t.id === booking.tour_id);
    const customer = customers?.find(c => c.id === booking.user_id);

    return {
      ...booking,
      userName: customer ? `${customer.first_name} ${customer.last_name}` : `User #${booking.user_id}`,
      userEmail: customer?.email || "",
      tourName: tour?.title || `Tour #${booking.tour_id}`,
    };
  });

  debugLog.push(`=== SUCCESS: Returning ${bookingsWithDetails.length} bookings with details ===`);
  return { bookings: bookingsWithDetails, debugLog };
}

// Ambil semua user dengan role tour_guide beserta profil dan bookings (jika ada)
export async function getAllTourGuidesWithBookings() {
  const debugLog: string[] = [];
  // 1. Ambil semua user dengan role tour_guide
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("role", "tour_guide");

  if (userError) {
    return { guides: [], debugLog: ["Error fetching users: " + JSON.stringify(userError)] };
  }
  if (!users || users.length === 0) {
    return { guides: [], debugLog: ["No users with role tour_guide found"] };
  }

  debugLog.push(`Ditemukan ${users.length} user dengan role tour_guide.`);

  // 2. Untuk setiap user, ambil profil tour_guide dan bookings (jika ada)
  const guides = [];
  for (const user of users) {
    // Profil tour_guide
    const { data: guideProfile } = await supabase
      .from("tour_guides")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!guideProfile) {
      guides.push({ user, guideProfile: null, tours: [], bookings: [] });
      debugLog.push(`User ${user.id} (${user.first_name} ${user.last_name}) belum punya profil tour_guide.`);
      continue;
    }
    // Tours
    const { data: tours } = await supabase
      .from("tours")
      .select("*")
      .eq("tour_guide_id", guideProfile.id);
    if (!tours || tours.length === 0) {
      guides.push({ user, guideProfile, tours: [], bookings: [] });
      debugLog.push(`Tour guide ${guideProfile.id} (${user.first_name}) belum punya tour.`);
      continue;
    }
    // Bookings
    const tourIds = tours.map(t => t.id);
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .in("tour_id", tourIds);
    guides.push({ user, guideProfile, tours, bookings: bookings || [] });
    debugLog.push(`Tour guide ${guideProfile.id} (${user.first_name}) punya ${tours.length} tour dan ${bookings?.length || 0} bookings.`);
  }
  return { guides, debugLog };
}
