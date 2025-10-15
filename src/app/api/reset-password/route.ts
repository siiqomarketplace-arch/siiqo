import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        console.log("Hit reset-password API route");
        const body = await req.json();
        console.log(body)

        // Forward to Mockwave signup API
        const response = await fetch(
            "https://server.bizengo.com/api/auth/reset-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accepts: "application/json"
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { error: "Mockwave signup failed", details: text },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });

    } catch (err: any) {
        console.error("Proxy error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
