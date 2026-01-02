"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLoader } from "@/components/ui/AppLoader";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || user?.target_view !== "vendor")) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, user, isLoading, router]);

  if (isLoading || !isLoggedIn || user?.target_view !== "vendor") {
    return (
      <div className="flex items-center justify-center h-screen">
        <AppLoader />
      </div>
    );
  }

  return <>{children}</>;
}