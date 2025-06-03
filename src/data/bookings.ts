import { Booking } from "../types/tourguide";

export const bookings: Booking[] = [
  {
    id: "booking-001",
    tourId: "tour-001",
    tourName: "Sacred Temples of Bali",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "4",
    userName: "Emily Wilson",
    userEmail: "emily@wanderwise.com",
    userPhone: "+62 822 1111 2222",
    date: "2025-06-15",
    participants: 4,
    status: "confirmed",
    specialRequests:
      "We would like to visit Tanah Lot temple at sunset if possible.",
    totalAmount: 750000 * 4, // price * participants
    paymentStatus: "paid",
    createdAt: "2025-05-15T08:30:00Z",
    updatedAt: "2025-05-15T10:15:00Z",
  },
  {
    id: "booking-002",
    tourId: "tour-002",
    tourName: "Ubud Arts and Crafts",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "6",
    userName: "Aisha Khan",
    userEmail: "aisha@wanderwise.com",
    userPhone: "+62 878 7777 8888",
    date: "2025-06-18",
    participants: 2,
    status: "confirmed",
    specialRequests: "Interested in batik making workshops particularly.",
    totalAmount: 600000 * 2, // price * participants
    paymentStatus: "paid",
    createdAt: "2025-05-16T09:45:00Z",
    updatedAt: "2025-05-16T11:20:00Z",
  },
  {
    id: "booking-003",
    tourId: "tour-003",
    tourName: "Jakarta Street Food Safari",
    tourGuideId: "guide-002",
    tourGuideName: "Maya Dewi",
    userId: "8",
    userName: "Mei Lin",
    userEmail: "mei@wanderwise.com",
    userPhone: "",
    date: "2025-06-20",
    participants: 6,
    status: "pending",
    specialRequests: "We have one vegetarian in our group.",
    totalAmount: 500000 * 6, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-05-17T14:20:00Z",
    updatedAt: "2025-05-17T14:20:00Z",
  },
  {
    id: "booking-004",
    tourId: "tour-004",
    tourName: "Mount Rinjani 3-Day Summit Trek",
    tourGuideId: "guide-003",
    tourGuideName: "Rizal Hakim",
    userId: "1",
    userName: "John Smith",
    userEmail: "john@wanderwise.com",
    userPhone: "+62 812 3456 7890",
    date: "2025-07-05",
    participants: 4,
    status: "confirmed",
    specialRequests:
      "We are all experienced hikers but would like extra water supplies.",
    totalAmount: 3500000 * 4, // price * participants
    paymentStatus: "paid",
    createdAt: "2025-05-20T10:10:00Z",
    updatedAt: "2025-05-20T13:45:00Z",
  },
  {
    id: "booking-005",
    tourId: "tour-006",
    tourName: "Borobudur Sunrise & Prambanan Sunset",
    tourGuideId: "guide-004",
    tourGuideName: "Siti Nuraini",
    userId: "4",
    userName: "Emily Wilson",
    userEmail: "emily@wanderwise.com",
    userPhone: "+62 822 1111 2222",
    date: "2025-06-25",
    participants: 2,
    status: "confirmed",
    specialRequests:
      "Interested in photography opportunities, bringing professional camera equipment.",
    totalAmount: 900000 * 2, // price * participants
    paymentStatus: "paid",
    createdAt: "2025-05-21T16:30:00Z",
    updatedAt: "2025-05-21T17:15:00Z",
  },
  {
    id: "booking-006",
    tourId: "tour-007",
    tourName: "Raja Ampat Diving Safari",
    tourGuideId: "guide-005",
    tourGuideName: "Wayan Dharma",
    userId: "5",
    userName: "Roberto Hernandez",
    userEmail: "roberto@wanderwise.com",
    userPhone: "+62 813 5555 6666",
    date: "2025-07-15",
    participants: 4,
    status: "confirmed",
    specialRequests:
      "We have our own diving gear. All divers are PADI Advanced Open Water certified.",
    totalAmount: 12000000 * 4, // price * participants
    paymentStatus: "paid",
    createdAt: "2025-05-22T08:45:00Z",
    updatedAt: "2025-05-22T09:30:00Z",
  },
  {
    id: "booking-007",
    tourId: "tour-008",
    tourName: "Beginner's Dive Experience",
    tourGuideId: "guide-005",
    tourGuideName: "Wayan Dharma",
    userId: "6",
    userName: "Aisha Khan",
    userEmail: "aisha@wanderwise.com",
    userPhone: "+62 878 7777 8888",
    date: "2025-07-10",
    participants: 2,
    status: "cancelled",
    specialRequests: "Never dived before, need full equipment rental.",
    totalAmount: 8000000 * 2, // price * participants
    paymentStatus: "refunded",
    createdAt: "2025-05-23T11:20:00Z",
    updatedAt: "2025-05-30T14:15:00Z",
  },
  {
    id: "booking-008",
    tourId: "tour-009",
    tourName: "Komodo Photography Expedition",
    tourGuideId: "guide-006",
    tourGuideName: "Eka Saputra",
    userId: "2",
    userName: "Jane Doe",
    userEmail: "jane@wanderwise.com",
    userPhone: "+62 821 9876 5432",
    date: "2025-08-05",
    participants: 1,
    status: "pending",
    specialRequests:
      "Professional photographer, bringing multiple lenses and tripods.",
    totalAmount: 9500000 * 1, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-05-24T09:10:00Z",
    updatedAt: "2025-05-24T09:10:00Z",
  },
  {
    id: "booking-009",
    tourId: "tour-005",
    tourName: "Lombok Waterfall Circuit",
    tourGuideId: "guide-003",
    tourGuideName: "Rizal Hakim",
    userId: "8",
    userName: "Mei Lin",
    userEmail: "mei@wanderwise.com",
    userPhone: "",
    date: "2025-06-28",
    participants: 3,
    status: "pending",
    specialRequests:
      "One person in our group has limited mobility and may need assistance on trails.",
    totalAmount: 800000 * 3, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-05-25T13:40:00Z",
    updatedAt: "2025-05-25T13:40:00Z",
  },
  {
    id: "booking-010",
    tourId: "tour-001",
    tourName: "Sacred Temples of Bali",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "1",
    userName: "John Smith",
    userEmail: "john@wanderwise.com",
    userPhone: "+62 812 3456 7890",
    date: "2025-07-25",
    participants: 5,
    status: "confirmed",
    specialRequests:
      "Would like to perform a small private ceremony at one of the temples if possible.",
    totalAmount: 750000 * 5, // price * participants
    paymentStatus: "paid",
    createdAt: "2025-05-26T10:30:00Z",
    updatedAt: "2025-05-26T14:20:00Z",
  },
  {
    id: "booking-011",
    tourId: "tour-005",
    tourName: "Jakarta City Heritage Walk",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "2",
    userName: "David Johnson",
    userEmail: "david@wanderwise.com",
    userPhone: "+62 878 1234 5678",
    date: "2025-06-10",
    participants: 3,
    status: "pending",
    specialRequests:
      "Kami membutuhkan pemandu yang bisa berbahasa Inggris dengan lancar.",
    totalAmount: 450000 * 3, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-06-02T09:15:00Z",
    updatedAt: "2025-06-02T09:15:00Z",
  },
  {
    id: "booking-012",
    tourId: "tour-009",
    tourName: "Borobudur Sunrise Tour",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "7",
    userName: "Hiroshi Tanaka",
    userEmail: "hiroshi@wanderwise.com",
    userPhone: "+62 812 8888 9999",
    date: "2025-06-08",
    participants: 2,
    status: "pending",
    specialRequests:
      "Membutuhkan transportasi dari hotel di Yogyakarta ke Borobudur.",
    totalAmount: 850000 * 2, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-06-01T16:40:00Z",
    updatedAt: "2025-06-01T16:40:00Z",
  },
  {
    id: "booking-013",
    tourId: "tour-016",
    tourName: "Lombok Waterfall Trek",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "5",
    userName: "Roberto Hernandez",
    userEmail: "roberto@wanderwise.com",
    userPhone: "+62 813 5555 6666",
    date: "2025-06-05",
    participants: 4,
    status: "pending",
    specialRequests:
      "Kami membawa anak kecil umur 8 tahun, mohon rute yang sesuai.",
    totalAmount: 550000 * 4, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-06-03T08:25:00Z",
    updatedAt: "2025-06-03T08:25:00Z",
  },
  {
    id: "booking-014",
    tourId: "tour-012",
    tourName: "Tana Toraja Cultural Tour",
    tourGuideId: "guide-001",
    tourGuideName: "Adi Putra",
    userId: "1",
    userName: "John Smith",
    userEmail: "john@wanderwise.com",
    userPhone: "+62 812 3456 7890",
    date: "2025-06-12",
    participants: 2,
    status: "pending",
    specialRequests:
      "Tertarik menghadiri upacara pemakaman tradisional jika ada.",
    totalAmount: 1200000 * 2, // price * participants
    paymentStatus: "pending",
    createdAt: "2025-06-02T14:50:00Z",
    updatedAt: "2025-06-02T14:50:00Z",
  },
];

// Get all bookings
export const getAllBookings = (): Booking[] => {
  return bookings;
};

// Get booking by ID
export const getBookingById = (id: string): Booking | undefined => {
  return bookings.find((booking) => booking.id === id);
};

// Get bookings by user ID
export const getBookingsByUserId = (userId: string): Booking[] => {
  return bookings.filter((booking) => booking.userId === userId);
};

// Get bookings by tour guide ID
export const getBookingsByTourGuideId = (tourGuideId: string): Booking[] => {
  return bookings.filter((booking) => booking.tourGuideId === tourGuideId);
};

// Get bookings by status
export const getBookingsByStatus = (status: string): Booking[] => {
  return bookings.filter((booking) => booking.status === status);
};

// Update booking status
export const updateBookingStatus = (
  bookingId: string,
  newStatus: "confirmed" | "pending" | "cancelled" | "completed"
): Booking | undefined => {
  const bookingIndex = bookings.findIndex(
    (booking) => booking.id === bookingId
  );

  if (bookingIndex === -1) {
    console.error(`Booking with ID ${bookingId} not found.`);
    return undefined;
  }

  // Create a new updatedAt timestamp
  const updatedAt = new Date().toISOString();

  // Update the booking status and updatedAt time
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status: newStatus,
    updatedAt: updatedAt,
  };

  return bookings[bookingIndex];
};
