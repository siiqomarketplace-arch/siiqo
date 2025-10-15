"use client";

import { useState, useEffect } from "react";

const useOtpTimer = (initialTime: number = 600) => {
    const [otpTimer, setOtpTimer] = useState(initialTime);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (otpTimer > 0 && !isExpired) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (otpTimer === 0) {
            setIsExpired(true);
        }
    }, [otpTimer, isExpired]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return { otpTimer, isExpired, formatTime, setOtpTimer, setIsExpired };
};

export default useOtpTimer;
