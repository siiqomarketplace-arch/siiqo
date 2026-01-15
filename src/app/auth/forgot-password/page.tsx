"use client";

import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/Button";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useEffect } from "react";

// Zod schema validation.
const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine((val) => val.toLowerCase().endsWith(".com"), {
      message: "Email must end with .com",
    }),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // detect and set users origin for later navigation.
  useEffect(() => {
    const origin = searchParams?.get("origin");
    if (origin) {
      sessionStorage.setItem("reset_origin", origin);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post("/api/auth/forgot-password", {
        email: data.email,
      });

      toast({
        title: "Email sent",
        description:
          response.data.message ||
          "Please check your inbox for a password reset code.",
      });

      sessionStorage.setItem("reset_email", data.email);
      router.push("/auth/reset-password-otp");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to send password reset code. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  const handleBackToLogin = () => {
    // detect where they're coming from and navigate user to the right page.
    const origin = sessionStorage.getItem("reset_origin");
    // console.log("reset password target_view: ", origin);

    setTimeout(() => {
      if (origin === "vendor") {
        router.replace("/auth/login");
      } else {
        router.replace("/auth/login");
      }
      sessionStorage.removeItem("reset_origin");
      sessionStorage.removeItem("reset_email");
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:underline hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>

        <Card className="border bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <img src="/images/siiqo.png" alt="Siiqo Logo" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Forgot Password?
            </CardTitle>
            <CardDescription>
              Enter your email address to receive a reset code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                variant="navy"
                type="submit"
                className="w-full text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
