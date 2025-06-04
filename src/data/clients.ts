// Client data for tour guide dashboard

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  lastBooking: string;
  status: "active" | "inactive";
  joinDate: string;
  location?: string;
  avatar?: string;
  preferredLanguage?: string;
  specialInterests?: string[];
  notes?: string;
}

export const clients: Client[] = [
  {
    id: "client-001",
    name: "Emily Wilson",
    email: "emily@wanderwise.com",
    phone: "+62 822 1111 2222",
    totalBookings: 5,
    totalSpent: 8750000, // IDR
    averageRating: 4.8,
    lastBooking: "2025-06-15",
    status: "active",
    joinDate: "2024-08-15T08:30:00Z",
    location: "Jakarta, Indonesia",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b550?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "English",
    specialInterests: ["Cultural Tours", "Temple Visits", "Photography"],
    notes: "Loves sunset temple visits and traditional ceremonies",
  },
  {
    id: "client-002",
    name: "Aisha Khan",
    email: "aisha@wanderwise.com",
    phone: "+62 878 7777 8888",
    totalBookings: 3,
    totalSpent: 4200000,
    averageRating: 4.9,
    lastBooking: "2025-06-18",
    status: "active",
    joinDate: "2024-11-20T09:45:00Z",
    location: "Surabaya, Indonesia",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "English",
    specialInterests: ["Arts & Crafts", "Batik Making", "Local Markets"],
    notes: "Interested in traditional art forms and handicrafts",
  },
  {
    id: "client-003",
    name: "Mei Lin",
    email: "mei@wanderwise.com",
    phone: "+62 856 3333 4444",
    totalBookings: 7,
    totalSpent: 12600000,
    averageRating: 4.7,
    lastBooking: "2025-05-28",
    status: "active",
    joinDate: "2024-06-10T10:20:00Z",
    location: "Bandung, Indonesia",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Mandarin",
    specialInterests: ["Street Food", "Culinary Tours", "Night Markets"],
    notes: "Food enthusiast, prefers authentic local experiences",
  },
  {
    id: "client-004",
    name: "David Thompson",
    email: "david.thompson@email.com",
    phone: "+62 812 5555 6666",
    totalBookings: 2,
    totalSpent: 3200000,
    averageRating: 4.5,
    lastBooking: "2025-05-20",
    status: "active",
    joinDate: "2025-01-05T14:15:00Z",
    location: "Bali, Indonesia",
    preferredLanguage: "English",
    specialInterests: ["Adventure Tours", "Hiking", "Nature Photography"],
    notes: "Adventurous traveler, enjoys outdoor activities",
  },
  {
    id: "client-005",
    name: "Sarah Martinez",
    email: "sarah.martinez@email.com",
    phone: "+62 813 7777 8888",
    totalBookings: 4,
    totalSpent: 6800000,
    averageRating: 4.6,
    lastBooking: "2025-04-25",
    status: "active",
    joinDate: "2024-09-12T11:30:00Z",
    location: "Yogyakarta, Indonesia",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Spanish",
    specialInterests: ["Historical Sites", "Museums", "Cultural Heritage"],
    notes: "History enthusiast, loves learning about Indonesian heritage",
  },
  {
    id: "client-006",
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+62 821 9999 0000",
    totalBookings: 6,
    totalSpent: 9200000,
    averageRating: 4.8,
    lastBooking: "2025-03-15",
    status: "inactive",
    joinDate: "2024-05-20T16:45:00Z",
    location: "Melbourne, Australia",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "English",
    specialInterests: ["Beach Tours", "Diving", "Marine Life"],
    notes: "Marine enthusiast, prefers coastal destinations",
  },
  {
    id: "client-007",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+62 814 1111 2222",
    totalBookings: 3,
    totalSpent: 4500000,
    averageRating: 4.9,
    lastBooking: "2025-06-10",
    status: "active",
    joinDate: "2024-12-08T13:20:00Z",
    location: "São Paulo, Brazil",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Portuguese",
    specialInterests: ["Traditional Dance", "Music", "Festivals"],
    notes: "Loves cultural performances and traditional festivals",
  },
  {
    id: "client-008",
    name: "Kumar Patel",
    email: "kumar.patel@email.com",
    phone: "+62 815 3333 4444",
    totalBookings: 8,
    totalSpent: 14400000,
    averageRating: 4.7,
    lastBooking: "2025-06-05",
    status: "active",
    joinDate: "2024-04-15T09:10:00Z",
    location: "Mumbai, India",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Hindi",
    specialInterests: ["Spiritual Tours", "Temples", "Meditation"],
    notes: "Spiritual traveler, interested in religious and meditation sites",
  },
  {
    id: "client-009",
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "+62 816 5555 6666",
    totalBookings: 2,
    totalSpent: 2800000,
    averageRating: 4.4,
    lastBooking: "2025-01-20",
    status: "inactive",
    joinDate: "2024-10-25T15:30:00Z",
    location: "Singapore",
    avatar:
      "https://images.unsplash.com/photo-1574425710976-99d94d3d88c6?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "English",
    specialInterests: ["Shopping", "Modern Architecture", "City Tours"],
    notes: "Prefers urban experiences and modern attractions",
  },
  {
    id: "client-010",
    name: "Robert Johnson",
    email: "robert.johnson@email.com",
    phone: "+62 817 7777 8888",
    totalBookings: 5,
    totalSpent: 7500000,
    averageRating: 4.6,
    lastBooking: "2025-06-12",
    status: "active",
    joinDate: "2024-07-30T12:45:00Z",
    location: "London, UK",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "English",
    specialInterests: ["Wildlife", "National Parks", "Eco Tours"],
    notes: "Wildlife photographer, interested in conservation efforts",
  },
  {
    id: "client-011",
    name: "Sofia Rodriguez",
    email: "sofia.rodriguez@email.com",
    phone: "+62 818 9999 0000",
    totalBookings: 4,
    totalSpent: 5600000,
    averageRating: 4.8,
    lastBooking: "2025-05-30",
    status: "active",
    joinDate: "2024-08-05T10:15:00Z",
    location: "Madrid, Spain",
    avatar:
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Spanish",
    specialInterests: ["Cooking Classes", "Local Cuisine", "Markets"],
    notes: "Culinary enthusiast, loves learning traditional recipes",
  },
  {
    id: "client-012",
    name: "Zhang Wei",
    email: "zhang.wei@email.com",
    phone: "+62 819 1111 2222",
    totalBookings: 6,
    totalSpent: 8800000,
    averageRating: 4.7,
    lastBooking: "2025-06-08",
    status: "active",
    joinDate: "2024-06-20T14:30:00Z",
    location: "Beijing, China",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Mandarin",
    specialInterests: ["Traditional Architecture", "Gardens", "Tea Culture"],
    notes: "Appreciates traditional design and peaceful environments",
  },
  {
    id: "client-013",
    name: "Anna Mueller",
    email: "anna.mueller@email.com",
    phone: "+62 820 3333 4444",
    totalBookings: 3,
    totalSpent: 4200000,
    averageRating: 4.5,
    lastBooking: "2025-04-15",
    status: "inactive",
    joinDate: "2024-11-10T11:20:00Z",
    location: "Berlin, Germany",
    avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "German",
    specialInterests: ["Art Galleries", "Museums", "Cultural Events"],
    notes: "Art lover, enjoys contemporary and traditional art forms",
  },
  {
    id: "client-014",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@email.com",
    phone: "+62 821 5555 6666",
    totalBookings: 7,
    totalSpent: 11200000,
    averageRating: 4.9,
    lastBooking: "2025-06-14",
    status: "active",
    joinDate: "2024-05-05T08:45:00Z",
    location: "Tokyo, Japan",
    avatar:
      "https://images.unsplash.com/photo-1508186225823-0963cf9ab0de?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "Japanese",
    specialInterests: ["Traditional Crafts", "Minimalism", "Zen Gardens"],
    notes: "Interested in traditional Japanese-Indonesian cultural connections",
  },
  {
    id: "client-015",
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+62 822 7777 8888",
    totalBookings: 4,
    totalSpent: 6000000,
    averageRating: 4.6,
    lastBooking: "2025-06-01",
    status: "active",
    joinDate: "2024-09-18T16:00:00Z",
    location: "Toronto, Canada",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    preferredLanguage: "English",
    specialInterests: ["Adventure Sports", "Volcano Hiking", "Extreme Sports"],
    notes: "Adrenaline seeker, loves challenging outdoor activities",
  },
];

// Helper functions to work with client data
export const getClientsByTourGuide = (tourGuideId: string): Client[] => {
  // In a real application, this would filter by tour guide ID
  // For now, return all clients as demo data since we don't have tour guide associations
  console.log("Fetching clients for tour guide:", tourGuideId);
  return clients;
};

export const getActiveClients = (): Client[] => {
  return clients.filter((client) => client.status === "active");
};

export const getInactiveClients = (): Client[] => {
  return clients.filter((client) => client.status === "inactive");
};

export const getClientById = (clientId: string): Client | undefined => {
  return clients.find((client) => client.id === clientId);
};

export const getClientsByLocation = (location: string): Client[] => {
  return clients.filter((client) =>
    client.location?.toLowerCase().includes(location.toLowerCase())
  );
};

export const getTopSpendingClients = (limit: number = 5): Client[] => {
  return [...clients]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

export const getHighestRatedClients = (limit: number = 5): Client[] => {
  return [...clients]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
};

export const getMostActiveClients = (limit: number = 5): Client[] => {
  return [...clients]
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .slice(0, limit);
};

// Statistics helpers
export const getClientStats = () => {
  const totalClients = clients.length;
  const activeClients = getActiveClients().length;
  const inactiveClients = getInactiveClients().length;
  const totalRevenue = clients.reduce(
    (sum, client) => sum + client.totalSpent,
    0
  );
  const averageSpending = totalRevenue / totalClients;
  const totalBookings = clients.reduce(
    (sum, client) => sum + client.totalBookings,
    0
  );
  const averageRating =
    clients.reduce((sum, client) => sum + client.averageRating, 0) /
    totalClients;

  return {
    totalClients,
    activeClients,
    inactiveClients,
    totalRevenue,
    averageSpending,
    totalBookings,
    averageRating: Math.round(averageRating * 10) / 10,
  };
};
