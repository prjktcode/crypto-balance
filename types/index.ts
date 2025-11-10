export type TokenBalance = {
    symbol: string
    name: string
    contract?: string
    network: string
    balance: number // in token units (e.g., 0.5 ETH)
    priceUSD: number
}

export type Allocation = {
    symbol: string
    usdValue: number
    percent: number
}

export type TargetAllocation = {
    [symbol: string]: number // percent (0-100)
}

export type Suggestion = {
    depositCoin: string
    depositNetwork: string
    settleCoin: string
    settleNetwork: string
    depositAmount: string // string amount to deposit (token units)
    estimatedSettleAmount: string // estimate in token units
    reason?: string
}