"use client";

import React from "react";
import { Clock } from "lucide-react";
import useOtpTimer from "../hooks/useOtpTimer";

const OtpTimer = () => {
  const { otpTimer, isExpired, formatTime } = useOtpTimer();

  return (
    <div className="flex items-center justify-center gap-2 p-3 border rounded-lg bg-gray-50">
      <Clock
        className={`w-4 h-4 ${
          isExpired
            ? "text-red-500"
            : otpTimer <= 120
            ? "text-orange-500"
            : "text-blue-500"
        }`}
      />
      <span
        className={`font-mono font-semibold ${
          isExpired
            ? "text-red-500"
            : otpTimer <= 120
            ? "text-orange-500"
            : "text-blue-500"
        }`}
      >
        {isExpired ? "Expired" : formatTime(otpTimer)}
      </span>
      {!isExpired && <span className="text-sm text-gray-500">remaining</span>}
    </div>
  );
};

export default OtpTimer;
