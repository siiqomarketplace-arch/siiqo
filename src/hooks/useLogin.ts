"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { loginUser, storeAuthData } from "@/lib/auth";



export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRedirect = () => {
        toast({
            title: "Login Successful!",
            description: "Redirecting to your dashboard...",
        });

        setTimeout(() => {
            window.location.href = "/marketplace";
        }, 1000);
    };

    const onSubmit = async (values: {
        email: string;
        password: string;
        rememberMe?: boolean;
    }) => {
        setIsLoading(true);

        try {
            const data = await loginUser(values.email, values.password);

            // Check if role is buyer
            if (data.user.role === "buyer") {
                storeAuthData(data, values.rememberMe ?? false, values.email);
                handleRedirect();
            } else {
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description:
                        data.message || "Unable to complete login. Please try again.",
                });
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
