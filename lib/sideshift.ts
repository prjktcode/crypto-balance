import axios from 'axios'

const SIDESHIFT_BASE = 'https://sideshift.ai/v2'

export type SideshiftQuoteRequest = {
    depositCoin: string
    depositNetwork: string
    settleCoin: string
    settleNetwork: string
    depositAmount: string
    affiliateId?: string
}

/**
 * Request a quote from Sideshift.ai server-side.
 * This function is intended to be used from server (Next.js route handlers).
 */
export async function getQuote(payload: SideshiftQuoteRequest, userIp: string) {
    const secret = process.env.SIDESHIFT_SECRET
    if (!secret) {
        throw new Error('SIDESHIFT_SECRET not configured in env')
    }
    const body = {
        depositCoin: payload.depositCoin,
        depositNetwork: payload.depositNetwork,
        settleCoin: payload.settleCoin,
        settleNetwork: payload.settleNetwork,
        depositAmount: payload.depositAmount,
        affiliateId: payload.affiliateId || process.env.SIDESHIFT_AFFILIATE_ID || undefined
    }

    const resp = await axios.post(`${SIDESHIFT_BASE}/quotes`, body, {
        headers: {
            'Content-Type': 'application/json',
            'x-sideshift-secret': secret,
            'x-user-ip': userIp || ''
        },
        timeout: 15000
    })
    return resp.data
}

/**
 * Create a shift (execute swap) via SideShift /v2/shifts
 */
export async function createShift(payload: any, userIp: string) {
    const secret = process.env.SIDESHIFT_SECRET
    if (!secret) {
        throw new Error('SIDESHIFT_SECRET not configured in env')
    }

    const resp = await axios.post(`${SIDESHIFT_BASE}/shifts`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'x-sideshift-secret': secret,
            'x-user-ip': userIp || ''
        },
        timeout: 20000
    })
    return resp.data
}