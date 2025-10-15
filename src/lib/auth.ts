import axios from "axios";

export interface LoginResponse {
    access_token: string;
    message: string;
    user: {
        email: string;
        role: "buyer" | "vendor";
    };
}

export const loginUser = async (email: string, password: string) => {
    const response = await axios.post<LoginResponse>(
        "https://server.bizengo.com/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
};

export const storeAuthData = (
    data: LoginResponse,
    rememberMe: boolean,
    email: string
) => {
    if (typeof window === "undefined") return;

    sessionStorage.setItem("RSEmail", email);
    sessionStorage.setItem("RSToken", data.access_token);
    sessionStorage.setItem("RSUserRole", data.user.role);
    sessionStorage.setItem("RSUser", JSON.stringify(data.user));

    if (rememberMe) localStorage.setItem("rememberedEmail", email);
};
