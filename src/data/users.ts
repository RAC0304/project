import { User, UserRole, RolePermissions } from "../types";

// Demo users with different roles
export const DEMO_USERS: User[] = [
  {
    id: "1",
    email: "user@wanderwise.com",
    username: "JohnT",
    role: "user",
    profile: {
      firstName: "John",
      lastName: "Doe",
      location: "Jakarta, Indonesia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnT",
      bio: "Travel enthusiast who loves exploring new destinations and cultures.",
      phone: "+62 812 3456 7890",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "light",
      },
    },
    createdAt: "2024-01-15T10:00:00Z",
    isActive: true,
  },
  {
    id: "2",
    email: "guide@wanderwise.com",
    username: "SarahG",
    role: "tour_guide",
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      location: "Bali, Indonesia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahG",
      bio: "Professional tour guide with 8+ years experience in Bali and surrounding islands.",
      phone: "+62 821 9876 5432",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "light",
      },
    },
    createdAt: "2024-01-10T08:00:00Z",
    isActive: true,
  },
  {
    id: "3",
    email: "admin@wanderwise.com",
    username: "AdminSys",
    role: "admin",
    profile: {
      firstName: "Michael",
      lastName: "Administrator",
      location: "Jakarta, Indonesia",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminSys",
      bio: "System administrator managing WanderWise platform and operations.",
      phone: "+62 811 1234 5678",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "dark",
      },
    },
    createdAt: "2024-01-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "4",
    email: "emily@wanderwise.com",
    username: "EmilyW",
    role: "user",
    profile: {
      firstName: "Emily",
      lastName: "Wilson",
      location: "Yogyakarta, Indonesia",
      avatar: "",
      bio: "Photography enthusiast looking to capture Indonesia's natural beauty.",
      phone: "+62 822 1111 2222",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "light",
      },
    },
    createdAt: "2024-01-20T14:30:00Z",
    isActive: false, // Inactive user
  },
  {
    id: "5",
    email: "roberto@wanderwise.com",
    username: "RobertoH",
    role: "tour_guide",
    profile: {
      firstName: "Roberto",
      lastName: "Hernandez",
      location: "Lombok, Indonesia",
      avatar: "",
      bio: "Marine biologist and diving instructor with deep knowledge of Indonesia's coral reefs.",
      phone: "+62 813 5555 6666",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "light",
      },
    },
    createdAt: "2024-01-05T09:15:00Z",
    isActive: true,
  },
  {
    id: "6",
    email: "aisha@wanderwise.com",
    username: "AishaK",
    role: "user",
    profile: {
      firstName: "Aisha",
      lastName: "Khan",
      location: "Bandung, Indonesia",
      avatar: "",
      bio: "Culinary adventurer on a mission to taste every Indonesian dish.",
      phone: "+62 878 7777 8888",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: false,
        theme: "light",
      },
    },
    createdAt: "2024-01-25T16:45:00Z",
    isActive: true,
  },
  {
    id: "7",
    email: "david@wanderwise.com",
    username: "DavidT",
    role: "tour_guide",
    profile: {
      firstName: "David",
      lastName: "Thompson",
      location: "Flores, Indonesia",
      avatar: "",
      bio: "Hiking expert specializing in volcanic treks and mountain expeditions.",
      phone: "+62 896 9999 0000",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "dark",
      },
    },
    createdAt: "2023-12-12T11:20:00Z",
    isActive: false, // Inactive user
  },
  {
    id: "8",
    email: "mei@wanderwise.com",
    username: "MeiL",
    role: "user",
    profile: {
      firstName: "Mei",
      lastName: "Lin",
      location: "Surabaya, Indonesia",
      avatar: "",
      bio: "Cultural enthusiast interested in traditional crafts and ceremonies.",
      phone: "+62 877 1234 5678",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "light",
      },
    },
    createdAt: "2024-02-05T08:10:00Z",
    isActive: true,
  },
  {
    id: "9",
    email: "sofia@wanderwise.com",
    username: "SofiaA",
    role: "admin",
    profile: {
      firstName: "Sofia",
      lastName: "Andersen",
      location: "Jakarta, Indonesia",
      avatar: "",
      bio: "Development manager for WanderWise focusing on platform growth and user experience.",
      phone: "+62 811 2222 3333",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "dark",
      },
    },
    createdAt: "2023-11-15T10:30:00Z",
    isActive: true,
  },
  {
    id: "10",
    email: "hassan@wanderwise.com",
    username: "HassanM",
    role: "tour_guide",
    profile: {
      firstName: "Hassan",
      lastName: "Mahmoud",
      location: "Sumatra, Indonesia",
      avatar: "",
      bio: "Wildlife expert specializing in jungle treks and animal spotting expeditions.",
      phone: "+62 813 9876 5432",
      preferences: {
        language: "en",
        currency: "IDR",
        notifications: true,
        theme: "light",
      },
    },
    createdAt: "2024-01-08T13:50:00Z",
    isActive: false, // Inactive user
  },
];

// Demo passwords (in real app, these would be hashed)
export const USER_CREDENTIALS = {
  "user@wanderwise.com": "user123",
  "guide@wanderwise.com": "guide123",
  "admin@wanderwise.com": "admin123",
};

// Role-based permissions
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: "user",
    permissions: [
      { action: "read", resource: "destinations" },
      { action: "read", resource: "itineraries" },
      { action: "read", resource: "tour_guides" },
      { action: "create", resource: "bookings" },
      { action: "read", resource: "own_profile" },
      { action: "update", resource: "own_profile" },
      { action: "create", resource: "reviews" },
      { action: "read", resource: "reviews" },
      { action: "update", resource: "own_reviews" },
    ],
  },
  {
    role: "tour_guide",
    permissions: [
      { action: "read", resource: "destinations" },
      { action: "read", resource: "itineraries" },
      { action: "read", resource: "tour_guides" },
      { action: "read", resource: "bookings" },
      { action: "update", resource: "own_bookings" },
      { action: "read", resource: "own_profile" },
      { action: "update", resource: "own_profile" },
      { action: "create", resource: "guide_content" },
      { action: "update", resource: "guide_content" },
      { action: "read", resource: "reviews" },
      { action: "respond", resource: "reviews" },
      { action: "read", resource: "earnings" },
      { action: "manage", resource: "availability" },
    ],
  },
  {
    role: "admin",
    permissions: [
      { action: "read", resource: "*" },
      { action: "create", resource: "*" },
      { action: "update", resource: "*" },
      { action: "delete", resource: "*" },
      { action: "manage", resource: "users" },
      { action: "manage", resource: "tour_guides" },
      { action: "manage", resource: "destinations" },
      { action: "manage", resource: "itineraries" },
      { action: "manage", resource: "system" },
      { action: "view", resource: "analytics" },
      { action: "manage", resource: "permissions" },
    ],
  },
];

// Helper functions
export const getUserByEmail = (email: string): User | undefined => {
  return DEMO_USERS.find((user) => user.email === email);
};

export const validateCredentials = (
  email: string,
  password: string
): boolean => {
  return USER_CREDENTIALS[email as keyof typeof USER_CREDENTIALS] === password;
};

export const getUserPermissions = (role: UserRole) => {
  return ROLE_PERMISSIONS.find((rp) => rp.role === role)?.permissions || [];
};

export const hasPermission = (
  userRole: UserRole,
  action: string,
  resource: string
): boolean => {
  const permissions = getUserPermissions(userRole);

  // Admin has all permissions
  if (userRole === "admin") {
    return true;
  }

  // Check for specific permission
  return permissions.some(
    (p) =>
      (p.action === action || p.action === "*") &&
      (p.resource === resource || p.resource === "*")
  );
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case "user":
      return "Traveler";
    case "tour_guide":
      return "Tour Guide";
    case "admin":
      return "Administrator";
    case "customer":
      return "Customer";
    default:
      return "Unknown";
  }
};
