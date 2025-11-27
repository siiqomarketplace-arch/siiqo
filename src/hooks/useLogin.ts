"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { storeAuthData } from "@/lib/auth";
import { authService } from "@/services/authService";

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
            const data = await authService.login(values.email, values.password);
            
            storeAuthData(data, values.rememberMe ?? false, values.email);

            toast({
                title: "Login Successful!",
                description: "Redirecting to your dashboard...",
            });

            if (data.user?.role === "vendor") {
                router.push("/vendor/dashboard");
            } else if (data.user?.role === "buyer") {
                router.push("/marketplace");
            } else {
                router.push("/");
            }

        } catch (error: any) {
            console.error("Login error full:", error);

            let errorMessage = "Invalid email or password.";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }

            toast({
                variant: "destructive",
                title: "Login Failed, Please try again!",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { onSubmit, isLoading };
};
