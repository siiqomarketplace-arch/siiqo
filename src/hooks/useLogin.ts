"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { loginUser, storeAuthData } from "@/lib/auth";

export const useLogin = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleRedirect = () => {
        toast({
            title: "Login Successful!",
            description: "Redirecting to your dashboard...",
        });
        setTimeout(() => {
            const redirectUrl = sessionStorage.getItem("redirectUrl");
            sessionStorage.removeItem("redirectUrl");
            router.push(redirectUrl || "/marketplace");
        }, 1500);
    };

    const onSubmit = async (values: { email: string; password: string; rememberMe?: boolean }) => {
        console.log("✅ Form values received:", values);
        setIsLoading(true);

        try {
            const data = await loginUser(values.email, values.password);
            console.log("✅ API response:", data);

            storeAuthData(data, values.rememberMe ?? false, values.email);
            handleRedirect();
        } catch (error: any) {
            console.error("❌ Login error full:", error);

            let errorMessage = "Invalid email or password.";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }

            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { onSubmit, isLoading };
};
