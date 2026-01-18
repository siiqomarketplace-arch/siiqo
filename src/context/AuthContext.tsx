"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { UserData, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await userService.getUserProfile();
      const userProfile = data;

      if (userProfile) {
        setUser(userProfile);
        setIsLoggedIn(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("RSUser", JSON.stringify(userProfile));
        }
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch user profile"
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("RSUser");
      const storedToken = sessionStorage.getItem("RSToken");

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as UserData;
          setUser(parsedUser);
          setIsLoggedIn(true);
          fetchUserProfile();
        } catch (e) {
          console.error("Error parsing RSUser:", e);
          sessionStorage.removeItem("RSUser");
          sessionStorage.removeItem("RSToken");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [fetchUserProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await authService.login({ email, password });

        if (data.access_token) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("RSToken", data.access_token);
            sessionStorage.setItem("RSEmail", email);
            if (data.user?.target_view) {
              sessionStorage.setItem("RSUsertarget_view", data.user.target_view);
            }
          }

          if (data.user) {
            setUser(data.user);
            setIsLoggedIn(true);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("RSUser", JSON.stringify(data.user));
            }
          } else {
            await fetchUserProfile();
          }
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
      sessionStorage.removeItem("RSUsertarget_view");
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
      refreshUserProfile: fetchUserProfile,
    }),
    [isLoggedIn, user, isLoading, error, login, logout, fetchUserProfile]
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
