// app/api/sideshift/quote/route.ts
import { NextRequest } from "next/server";
import { getQuote } from "../../../lib/sideshift"; // your existing function (but secret stored securely)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { depositCoin, depositNetwork, settleCoin, settleNetwork, depositAmount } = body;

        // Get real user IP (adjust based on your hosting)
        const userIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            "212.103.48.92";

        // Ensure your getQuote() uses process.env for secrets!
        const quote = await getQuote({
            depositCoin,
            depositNetwork,
            settleCoin,
            settleNetwork,
            depositAmount,
            userIp,
        });

        return Response.json(quote);
    } catch (error: any) {
        console.error("API Route Error:", error.response?.data || error.message);
        return Response.json(
            { error: "Failed to fetch quote", details: error.response?.data },
            { status: error.response?.status || 500 }
        );
    }
}