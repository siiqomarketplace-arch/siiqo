import { useState, useCallback, useEffect } from "react";
import { locationService } from "@/services/locationService";

export const useLocationDetection = () => {
    const [location, setLocation] = useState({ country: "", state: "" });
    const [loading, setLoading] = useState(false);
    const [detected, setDetected] = useState(false);

    const detectLocation = useCallback(async () => {
        setLoading(true);
        try {
            const data = await locationService.detectLocation();

            if (data.country_name && data.region) {
                setLocation({ country: data.country_name, state: data.region });
                setDetected(true);
            } else throw new Error("Incomplete data");
        } catch {
            console.warn("Location detection failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    return { location, loading, detected, refresh: detectLocation };
};
