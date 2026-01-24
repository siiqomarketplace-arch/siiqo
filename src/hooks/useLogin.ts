"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { storeAuthData } from "@/lib/auth";
import { authService } from "@/services/authService";
import { getServerErrorMessage } from "@/lib/errorHandler";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    setIsLoading(true);

    try {
      const data = await authService.login({
        email: values.email,
        password: values.password,
        remember: values.rememberMe ?? false,
      });

      storeAuthData(data, values.rememberMe ?? false, values.email);

      toast({
        title: "Login Successful!",
        description: "Redirecting to your dashboard...",
      });

      if (data.user?.target_view === "vendor") {
        router.push("/vendor/dashboard");
      } else if (data.user?.target_view === "buyer") {
        router.push("/marketplace");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error full:", error);

      const errorResponse = getServerErrorMessage(error, "Login");
      const title = errorResponse.isServerError
        ? errorResponse.title
        : "Login Failed";

      toast({
        variant: "destructive",
        title,
        description: errorResponse.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { onSubmit, isLoading };
};
