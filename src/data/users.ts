import { User, UserRole, RolePermissions } from "../types";

// Demo users with different roles
export const DEMO_USERS: User[] = [
  {
    id: "1",
    email: "user@wanderwise.com",
    username: "John Traveler",
    role: "user",
    profile: {
      firstName: "John",
      lastName: "Doe",
      location: "Jakarta, Indonesia",
      avatar: "/src/asset/image/avatar-user.png",
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
  },
  {
    id: "2",
    email: "guide@wanderwise.com",
    username: "Sarah Guide",
    role: "tour_guide",
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      location: "Bali, Indonesia",
      avatar: "/src/asset/image/avatar-guide.png",
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
  },
  {
    id: "3",
    email: "admin@wanderwise.com",
    username: "Admin System",
    role: "admin",
    profile: {
      firstName: "Michael",
      lastName: "Administrator",
      location: "Jakarta, Indonesia",
      avatar: "/src/asset/image/avatar-admin.png",
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
    default:
      return "Unknown";
  }
};
