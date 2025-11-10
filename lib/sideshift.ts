// lib/sideshift.ts
type QuoteParams = {
    depositCoin: "BTC";
    depositNetwork: "bitcoin";
    settleCoin: "USDT";
    settleNetwork: "arbitrum";
    depositAmount: "0.000001";
    userIp: string;
};

export async function getQuote({
    depositCoin,
    depositNetwork,
    settleCoin,
    settleNetwork,
    depositAmount,
    userIp,
}: QuoteParams) {
    const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'API-Key': process.env.SIDESHIFT_SECRET!,
},
        body: JSON.stringify({
            depositCoin,
            depositNetwork,
            settleCoin,
            settleNetwork,
            depositAmount,
            userIp,
        }),
    });

    if (!res.ok) {
        const err = await res.json();
        console.error("❌ Quote API route error:", err);
        throw new Error("Failed to fetch quote");
    }

    const data = await res.json();
    console.log("✅ Quote received:", data);
    return data;
}