import { login } from "@/services/api";

export const getVendorToken = (): string | null => {
  return typeof window !== "undefined"
    ? sessionStorage.getItem("RSToken")
    : null;
};

export const loginUser = async (email: string, password: string) => {
  const response = await login({ email, password });
  return response.data;
};

export const storeAuthData = (
  data: any,
  rememberMe: boolean,
  email: string,
) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("RSToken", data.access_token);
    if (data.refresh_token) {
      sessionStorage.setItem("RSRefreshToken", data.refresh_token);
    }
    sessionStorage.setItem("RSUser", JSON.stringify(data.user));
    sessionStorage.setItem("RSEmail", email);

    if (rememberMe) {
      localStorage.setItem("RSToken", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("RSRefreshToken", data.refresh_token);
      }
      localStorage.setItem("RSUser", JSON.stringify(data.user));
      localStorage.setItem("RSEmail", email);
    }
  }
};
