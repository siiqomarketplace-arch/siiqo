import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Forward request to external API
        const response = await fetch(
            "https://server.bizengo.com/api/auth/resend-verification",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json({ error: "Mockwave signup failed", details: text }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
