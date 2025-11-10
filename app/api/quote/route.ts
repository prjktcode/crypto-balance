// app/api/sideshift/quote/route.ts
import { NextRequest } from "next/server";
import { getQuote } from "../../../lib/sideshift"; // your existing function (but secret stored securely)

export async function POST(req: NextRequest) {
    try {
        const json = await req.json()
        const userIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

        // Validate required fields
        const required = ['depositCoin', 'depositNetwork', 'settleCoin', 'settleNetwork', 'depositAmount']
        for (const f of required) {
            if (!json[f]) {
                return Response.json({ error: `Missing field ${f}` }, { status: 400 })
            }
        }

        const payload = {
            depositCoin: json.depositCoin,
            depositNetwork: json.depositNetwork,
            settleCoin: json.settleCoin,
            settleNetwork: json.settleNetwork,
            depositAmount: String(json.depositAmount),
            affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || undefined
        }

        const resp = await getQuote(payload, userIp)
        return Response.json({ data: resp }, { status: 200 })
    } catch (err: any) {
        console.error('Quote error', err?.message || err)
        return Response.json({ error: err?.message || 'unknown' }, { status: 500 })
    }
}