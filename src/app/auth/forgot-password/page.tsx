"use client";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        "https://server.bizengo.com/api/auth/request-password-reset",
        { email }
      );

      toast({
        title: "Email sent",
        description:
          data.message || "Please check your inbox for a password reset code.",
      });

      // console.log("reset email: ", email);
      sessionStorage.setItem("reset_email", email);

      // Redirect to verification page
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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:underline hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <Card className="border bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Forgot Password?
            </CardTitle>
            <CardDescription>
              Enter your email address to receive a reset code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <Button
                variant="navy"
                type="submit"
                className="w-full text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
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
