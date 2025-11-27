import api from "@/lib/api_client";

export const locationService = {
  getAddressFromCoordinates: async (lat: number, lon: number) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    const data = await response.json();
    return data;
  },
  detectLocation: async () => {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data;
  },
};