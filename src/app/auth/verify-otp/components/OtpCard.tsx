"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import OtpInput from "./OtpInput";
import OtpTimer from "./OtpTimer";
import OtpActions from "./OtpActions";

const OtpCard = () => {
  const [otp, setOtp] = useState("");

  return (
    <Card className="w-full max-w-md border bg-white/90 backdrop-blur-md">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your email
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OTP Timer */}
        <OtpTimer />

        {/* OTP Input */}
        <OtpInput otp={otp} setOtp={setOtp} />

        {/* Actions */}
        <OtpActions otp={otp} />
      </CardContent>
    </Card>
  );
};

export default OtpCard;
