import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        await authService.resendVerificationOtp(email);

        return NextResponse.json({ message: "Verification OTP resent" }, { status: 200 });

    } catch (err: any) {
        console.error("Proxy error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
