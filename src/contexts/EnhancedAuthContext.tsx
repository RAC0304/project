import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User, UserRole } from "../types/user";
import { hasPermission } from "../data/users";
import customAuthService from "../services/customAuthService";
import mockAuthService from "../services/mockAuthService.js";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
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
  updateProfile: (
    updates: Partial<User["profile"]> & {
      dateOfBirth?: string;
      gender?: "male" | "female" | "other";
    }
  ) => Promise<boolean>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (action: string, resource: string) => boolean;
  isRole: (role: UserRole) => boolean;
  isMinRole: (minRole: UserRole) => boolean;
  refreshSession: () => Promise<void>;
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

// Constants for session management
const SESSION_STORAGE_KEYS = {
  USER: "wanderwise_user",
  IS_LOGGED_IN: "wanderwise_isLoggedIn",
  SESSION_TIMESTAMP: "wanderwise_sessionTimestamp",
  SESSION_TIMEOUT: "wanderwise_sessionTimeout",
} as const;

const SESSION_TIMEOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const EnhancedAuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [usesMockAuth, setUsesMockAuth] = useState(false);
  // Flag to track whether session initialization has been done
  const [initDone, setInitDone] = useState(false);

  // Function to validate session
  const validateSession = useCallback((): boolean => {
    const sessionTimestamp = localStorage.getItem(
      SESSION_STORAGE_KEYS.SESSION_TIMESTAMP
    );
    const sessionTimeout = localStorage.getItem(
      SESSION_STORAGE_KEYS.SESSION_TIMEOUT
    );

    if (!sessionTimestamp || !sessionTimeout) {
      return false;
    }

    const currentTime = Date.now();
    const lastActivity = parseInt(sessionTimestamp);
    const timeoutDuration = parseInt(sessionTimeout);

    // Check if session has expired
    const isValid = currentTime - lastActivity < timeoutDuration;
    if (!isValid) {
      console.log(
        "Session expired: Time difference:",
        (currentTime - lastActivity) / 1000,
        "seconds"
      );
    }
    return isValid;
  }, []);

  // Function to update session timestamp - only called explicitly, not during initialization
  const updateSessionTimestamp = useCallback(() => {
    if (initDone && isLoggedIn) {
      localStorage.setItem(
        SESSION_STORAGE_KEYS.SESSION_TIMESTAMP,
        Date.now().toString()
      );
    }
  }, [initDone, isLoggedIn]);

  // Function to clear session
  const clearSession = useCallback(() => {
    Object.values(SESSION_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Clear old keys for backward compatibility
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  }, []);

  // Function to save session
  const saveSession = useCallback((userData: User) => {
    localStorage.setItem(SESSION_STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(SESSION_STORAGE_KEYS.IS_LOGGED_IN, "true");
    localStorage.setItem(
      SESSION_STORAGE_KEYS.SESSION_TIMESTAMP,
      Date.now().toString()
    );
    localStorage.setItem(
      SESSION_STORAGE_KEYS.SESSION_TIMEOUT,
      SESSION_TIMEOUT_DURATION.toString()
    );
  }, []);

  // Function to refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      if (user && isLoggedIn && initDone) {
        updateSessionTimestamp();
        console.log("Session refreshed");
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  }, [user, isLoggedIn, initDone, updateSessionTimestamp]);

  // Logout function (defined early to avoid dependency issues)
  const logout = useCallback(() => {
    if (user && !usesMockAuth) {
      customAuthService.logout(user.id).catch((err) => {
        console.error("Error logging logout event:", err);
      });
    }

    setUser(null);
    setIsLoggedIn(false);
    setUsesMockAuth(false);
    clearSession();
  }, [user, usesMockAuth, clearSession]);

  // Initialize session on mount - separated from other effects
  useEffect(() => {
    if (initDone) return; // Prevent re-initialization

    const initializeSession = () => {
      try {
        console.log("Initializing session...");
        // Check for existing session with new keys
        let savedUser = localStorage.getItem(SESSION_STORAGE_KEYS.USER);
        let isUserLoggedIn =
          localStorage.getItem(SESSION_STORAGE_KEYS.IS_LOGGED_IN) === "true";

        // Fallback to old keys for backward compatibility
        if (!savedUser) {
          savedUser = localStorage.getItem("user");
          isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";

          // If found old session, migrate to new format
          if (savedUser && isUserLoggedIn) {
            localStorage.setItem(SESSION_STORAGE_KEYS.USER, savedUser);
            localStorage.setItem(SESSION_STORAGE_KEYS.IS_LOGGED_IN, "true");
            localStorage.setItem(
              SESSION_STORAGE_KEYS.SESSION_TIMESTAMP,
              Date.now().toString()
            );
            localStorage.setItem(
              SESSION_STORAGE_KEYS.SESSION_TIMEOUT,
              SESSION_TIMEOUT_DURATION.toString()
            );

            // Clear old keys
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
          }
        }

        if (savedUser && isUserLoggedIn) {
          // Validate session without side effects
          const timestamp = localStorage.getItem(
            SESSION_STORAGE_KEYS.SESSION_TIMESTAMP
          );
          const timeout = localStorage.getItem(
            SESSION_STORAGE_KEYS.SESSION_TIMEOUT
          );

          if (timestamp && timeout) {
            const currentTime = Date.now();
            const lastActivity = parseInt(timestamp);
            const timeoutDuration = parseInt(timeout);

            if (currentTime - lastActivity < timeoutDuration) {
              try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setIsLoggedIn(true);
                console.log("Session restored successfully");
              } catch (e) {
                console.error("Error parsing user data:", e);
                clearSession();
              }
            } else {
              // Session expired, clear it
              console.log("Session expired, clearing...");
              clearSession();
            }
          } else {
            clearSession();
          }
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        // Clear invalid session data
        clearSession();
      } finally {
        setInitDone(true);
        setIsInitialized(true);
      }
    };

    // Only initialize once
    initializeSession();
  }, [clearSession, initDone]); // Depends on clearSession and initDone

  // Set up activity listeners in a separate effect
  useEffect(() => {
    if (!initDone) return; // Skip until initialization is complete

    // Set up activity listeners to update session timestamp
    const updateActivity = () => {
      if (isLoggedIn && user) {
        updateSessionTimestamp();
      }
    };

    // Listen for user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEYS.IS_LOGGED_IN) {
        if (e.newValue === "false" || e.newValue === null) {
          // User logged out in another tab
          setUser(null);
          setIsLoggedIn(false);
          setUsesMockAuth(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initDone, isLoggedIn, user, updateSessionTimestamp]);

  // Set up session timeout check
  useEffect(() => {
    if (!isLoggedIn || !user || !initDone) return;

    const checkSessionTimeout = () => {
      if (!validateSession()) {
        console.log("Session timed out");
        logout();
      }
    };

    // Check session every 5 minutes
    const intervalId = setInterval(checkSessionTimeout, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, user, initDone, validateSession, logout]);

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

        // Save session with new format
        saveSession(result.user);

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

            // Save session with new format
            saveSession(mockResult.user);

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

          // Save session with new format
          saveSession(mockResult.user);

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

          // Save session with new format
          saveSession(result.user);

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

          // Save session with new format
          saveSession(mockResult.user);

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
  const updateProfile = async (
    updates: Partial<User["profile"]> & {
      dateOfBirth?: string;
      gender?: "male" | "female" | "other";
    }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      let success;
      if (usesMockAuth) {
        // For mock auth, just update the local state
        // Extract user-level fields and profile fields separately
        const { dateOfBirth, gender, ...profileUpdates } = updates;

        const updatedUser = {
          ...user,
          profile: { ...user.profile, ...profileUpdates },
          ...(dateOfBirth !== undefined ? { dateOfBirth } : {}),
          ...(gender !== undefined ? { gender } : {}),
        };
        setUser(updatedUser);
        saveSession(updatedUser); // Update session storage
        success = true;
      } else {
        success = await customAuthService.updateProfile(user.id, updates);
        if (success) {
          // Extract user-level fields and profile fields separately
          const { dateOfBirth, gender, ...profileUpdates } = updates;

          const updatedUser = {
            ...user,
            profile: { ...user.profile, ...profileUpdates },
            ...(dateOfBirth !== undefined ? { dateOfBirth } : {}),
            ...(gender !== undefined ? { gender } : {}),
          };
          setUser(updatedUser);
          saveSession(updatedUser); // Update session storage
        }
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
    if (!user) return { success: false, error: "User not found" };

    try {
      if (usesMockAuth) {
        // For mock auth, just return success
        return { success: true };
      } else {
        return await customAuthService.updatePassword(
          user.id,
          currentPassword,
          newPassword
        );
      }
    } catch (error) {
      console.error("Update password error:", error);
      return { success: false, error: "Failed to update password" };
    }
  };

  const checkPermission = (action: string, resource: string): boolean => {
    if (!user) return false;
    return hasPermission(user, action, resource);
  };
  const isRole = (role: UserRole): boolean => {
    if (!user || typeof user.role !== "string") return false;
    return (user.role as UserRole) === role;
  };

  const isMinRole = (minRole: UserRole): boolean => {
    if (!user || typeof user.role !== "string") return false;
    return roleHierarchy[user.role as UserRole] >= roleHierarchy[minRole];
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    hasPermission: checkPermission,
    isRole,
    isMinRole,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useEnhancedAuth must be used within an EnhancedAuthProvider"
    );
  }
  return context;
};
