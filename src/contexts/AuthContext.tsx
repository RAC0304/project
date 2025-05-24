import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "../types";
import {
  getUserByEmail,
  validateCredentials,
  hasPermission,
} from "../data/users";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User["profile"]>) => void;
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

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    const isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (savedUser && isUserLoggedIn) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!validateCredentials(email, password)) {
        return { success: false, error: "Invalid email or password" };
      }

      const foundUser = getUserByEmail(email);
      if (!foundUser) {
        return { success: false, error: "User not found" };
      }

      // Update last login
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      };

      setUser(updatedUser);
      setIsLoggedIn(true);

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("isLoggedIn", "true");

      return { success: true };
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." };
    }
  };
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  };

  const updateProfile = (updates: Partial<User["profile"]>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        ...updates,
      },
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
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
    logout,
    updateProfile,
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
