import { NextRequest, NextResponse } from 'next/server'
import { createShift } from "../../../lib/sideshift"

export async function POST(req: NextRequest) {
    try {
        const json = await req.json()
        const userIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''

        // Basic validation - ensure we have deposit & settle info and returnAddress etc.
        const required = ['depositCoin', 'depositNetwork', 'settleCoin', 'settleNetwork', 'depositAmount', 'returnAddress']
        for (const f of required) {
            if (!json[f]) {
                return NextResponse.json({ error: `Missing field ${f}` }, { status: 400 })
            }
        }

        const payload = {
            depositCoin: json.depositCoin,
            depositNetwork: json.depositNetwork,
            settleCoin: json.settleCoin,
            settleNetwork: json.settleNetwork,
            depositAmount: String(json.depositAmount),
            returnAddress: json.returnAddress,
            affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || undefined
        }

        const resp = await createShift(payload, userIp)
        return NextResponse.json({ data: resp }, { status: 200 })
    } catch (err: any) {
        console.error('Shift error', err?.message || err)
        return NextResponse.json({ error: err?.message || 'unknown' }, { status: 500 })
    }
}