import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "../types/user";
import { hasPermission } from "../data/users";
import customAuthService from "../services/customAuthService";
import mockAuthService from "../services/mockAuthService.js";
import profileService from "../services/profileService";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User["profile"]>) => Promise<boolean>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (action: string, resource: string) => boolean;
  isRole: (role: UserRole) => boolean;
  isMinRole: (minRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  tour_guide: 2,
  admin: 3,
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usesMockAuth, setUsesMockAuth] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    const isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (savedUser && isUserLoggedIn) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch {
        // Clear invalid session
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
      }
    }
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try using the custom auth service first
      const result = await customAuthService.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        setIsLoggedIn(true);
        setUsesMockAuth(false);

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");

        return { success: true };
      } else {
        // If real auth fails, try mock auth as fallback
        console.log("Custom auth service failed, trying mock service...");

        try {
          const mockResult = await mockAuthService.login(email, password);

          if (mockResult.success && mockResult.user) {
            setUser(mockResult.user);
            setIsLoggedIn(true);
            setUsesMockAuth(true);

            // Save to localStorage
            localStorage.setItem("user", JSON.stringify(mockResult.user));
            localStorage.setItem("isLoggedIn", "true");

            return { success: true };
          } else {
            return {
              success: false,
              error: mockResult.error || "Login failed",
            };
          }
        } catch {
          return { success: false, error: "Login failed. Please try again." };
        }
      }
    } catch (error) {
      console.log("Custom auth service failed, trying mock service...", error);

      // If real auth fails, try mock auth as fallback
      try {
        const mockResult = await mockAuthService.login(email, password);

        if (mockResult.success && mockResult.user) {
          setUser(mockResult.user);
          setIsLoggedIn(true);
          setUsesMockAuth(true);

          // Save to localStorage
          localStorage.setItem("user", JSON.stringify(mockResult.user));
          localStorage.setItem("isLoggedIn", "true");

          return { success: true };
        } else {
          return { success: false, error: mockResult.error || "Login failed" };
        }
      } catch {
        return { success: false, error: "Login failed. Please try again." };
      }
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Extract first and last name from the name field
      const nameParts = userData.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Map role display names to database enum values
      const mappedRole = userData.role === "Tour Guide" ? "tour_guide" : "user";

      try {
        // Try using the custom auth service first
        const result = await customAuthService.register(
          userData.email,
          userData.password,
          userData.email.split("@")[0], // Use email prefix as username
          firstName,
          lastName,
          mappedRole
        );

        if (result.success && result.user) {
          setUser(result.user);
          setIsLoggedIn(true);
          setUsesMockAuth(false);

          // Save to localStorage
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("isLoggedIn", "true");

          return { success: true };
        } else {
          return {
            success: false,
            error: result.error || "Registration failed",
          };
        }
      } catch (error) {
        console.log(
          "Custom auth service failed, trying mock service...",
          error
        );

        // If real auth fails, try mock auth as fallback
        const mockResult = await mockAuthService.register(
          userData.email,
          userData.password,
          userData.email.split("@")[0], // Use email prefix as username
          firstName,
          lastName,
          userData.role === "Tour Guide" ? "Tour Guide" : "Traveler"
        );

        if (mockResult.success && mockResult.user) {
          setUser(mockResult.user);
          setIsLoggedIn(true);
          setUsesMockAuth(true);

          // Save to localStorage
          localStorage.setItem("user", JSON.stringify(mockResult.user));
          localStorage.setItem("isLoggedIn", "true");

          return { success: true };
        } else {
          return {
            success: false,
            error: mockResult.error || "Registration failed",
          };
        }
      }
    } catch {
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    if (user && !usesMockAuth) {
      customAuthService.logout(user.id).catch((err) => {
        console.error("Error logging logout event:", err);
      });
    }

    setUser(null);
    setIsLoggedIn(false);
    setUsesMockAuth(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  };
  const updateProfile = async (
    updates: Partial<User["profile"]>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      let success;

      if (usesMockAuth) {
        success = await mockAuthService.updateProfile(user.id, updates);
      } else {
        // Use the dedicated profileService for real profile updates
        success = await profileService.updateProfile(user.id, updates);
      }

      if (success) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            ...updates,
          },
          updatedAt: new Date().toISOString(),
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return success;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || usesMockAuth) {
      return { success: false, error: "Operation not supported" };
    }

    try {
      const result = await customAuthService.updatePassword(
        user.id,
        currentPassword,
        newPassword
      );

      return result;
    } catch (error) {
      console.error("Password update error:", error);
      return { success: false, error: "Failed to update password" };
    }
  };

  const checkPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, action, resource);
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isMinRole = (minRole: UserRole): boolean => {
    if (!user) return false;
    return roleHierarchy[user.role] >= roleHierarchy[minRole];
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    hasPermission: checkPermission,
    isRole,
    isMinRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
