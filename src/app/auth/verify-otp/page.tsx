"use client";

import React, { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import OtpCard from "./components/OtpCard";

const VerifyEmailPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:underline hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Signup
        </Link>
      </div>

      {/* OTP Card */}
      <OtpCard />
    </div>
  );
};

const VerifyEmail = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <VerifyEmailPage />
  </Suspense>
);

export default VerifyEmail;
