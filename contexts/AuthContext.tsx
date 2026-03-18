"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  // Skip if we're in the middle of an OAuth callback (cookies are being set)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isOAuthCallback =
        params.get("oauth") === "success" && params.get("user");
      if (isOAuthCallback) {
        // Don't check auth during OAuth callback - login page will handle it
        setIsLoading(false);
        return;
      }
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Verify session with backend using cookie
      const response = await api.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      }
    } catch (error) {
      // Token might be invalid or expired, try refresh
      try {
        await api.refreshToken();
        // If refresh succeeds, try to get profile again
        const response = await api.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(response.data));
          }
        }
      } catch (refreshError) {
        // Both access and refresh tokens are invalid
        setIsAuthenticated(false);
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
