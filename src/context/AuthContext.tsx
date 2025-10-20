"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import api from "@/lib/api_client";
import api_endpoints from "@/hooks/api_endpoints";

interface UserData {
  account_id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  businessname: string; //no business name in the api response
  address: string; // no address
  description: string; // no description
  country: string;
  state: string;
  zip: string; //no zip info
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from API
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get(
        "https://server.bizengo.com/api/user/profile"
      );
      const data = response.data

      console.log("use profile:", data);
      
      if (data && data.user) {
        setUser(data.user);
        setIsLoggedIn(true);

        if (typeof window !== "undefined") {
          sessionStorage.setItem("RSUser", JSON.stringify(data.user));
        }
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch user profile"
      );
    }
  }, []);

  // Initialize from sessionStorage (instant hydration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("RSUser");
      const storedToken = sessionStorage.getItem("RSToken");
      
      // console.log("Stored user:", storedUser);
      // console.log("Stored token:", storedToken ? "exists" : "null");

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as UserData;
          setUser(parsedUser);
          setIsLoggedIn(true);
          setIsLoading(false);

          // Re-fetch fresh data in background
          fetchUserProfile();
          return;
        } catch (e) {
          console.error("Error parsing RSUser:", e);
          // Clear corrupted data
          sessionStorage.removeItem("RSUser");
          sessionStorage.removeItem("RSToken");
        }
      }

      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post(api_endpoints.LOGIN, {
          email,
          password,
        });

        const data = response.data
        // console.log(data);

        if (data.access_token) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("RSToken", data.access_token);
            sessionStorage.setItem("RSEmail", email);
          }

          // Fetch user profile after login
          await fetchUserProfile();
        } else {
          throw new Error("No access token received");
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Login failed";
        setError(errorMessage);
        setIsLoggedIn(false);
        setUser(null);

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("RSToken");
          sessionStorage.removeItem("RSEmail");
          sessionStorage.removeItem("RSUser");
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserProfile]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("RSEmail");
      sessionStorage.removeItem("RSToken");
      sessionStorage.removeItem("RSUser");
      sessionStorage.removeItem("RSUserRole");
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("authToken");
    }
    window.location.href = "/";
  }, []);

  const contextValue = useMemo(
    () => ({
      isLoggedIn,
      user,
      isLoading,
      error,
      login,
      logout,
    }),
    [isLoggedIn, user, isLoading, error, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
