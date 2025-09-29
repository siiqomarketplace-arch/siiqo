"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

interface UserData {
  account_id: string;
  name: string;
  fullname: string;
  email: string;
  role: string;
  phone: string;
  businessname: string;
  address: string;
  description: string;
  country: string;
  state: string;
  zip: string;
}

interface ApiResponse {
  status: "success" | "error";
  users?: UserData[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user from API
  const fetchUserData = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.rootsnsquares.com/innovations/users.php?email=${email}`
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data: ApiResponse = await response.json();

      if (data.status === "success" && data.users && data.users.length > 0) {
        const fetchedUser = data.users[0];

        setUser(fetchedUser);
        setIsLoggedIn(true);

        if (typeof window !== "undefined") {
          sessionStorage.setItem("RSEmail", email);
          sessionStorage.setItem("RSUser", JSON.stringify(fetchedUser));
        }
      } else {
        throw new Error("User not found or API error.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setIsLoggedIn(false);
      setUser(null);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("RSEmail");
        sessionStorage.removeItem("RSUser");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize from sessionStorage (instant hydration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("RSEmail");
        const storedUser = sessionStorage.getItem("RSUser");
        
        console.log(storedEmail);
        console.log(storedUser);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as UserData;
          setUser(parsedUser);
          setIsLoggedIn(true);
          setIsLoading(false);

          // Re-fetch fresh data in background
          if (storedEmail) fetchUserData(storedEmail);
          return;
        } catch (e) {
          console.error("Error parsing RSUser:", e);
        }
      }

      if (storedEmail) {
        fetchUserData(storedEmail);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [fetchUserData]);

  const login = useCallback(
    async (email: string) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("RSEmail", email);
      }
      await fetchUserData(email);
    },
    [fetchUserData]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("RSEmail");
      sessionStorage.removeItem("RSUser");
    }
    setIsLoggedIn(false);
    setUser(null);
    setError(null);
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
