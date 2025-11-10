import { TokenBalance, TargetAllocation, Suggestion } from '../types'

/**
 * Mocked balances provider.
 * Replace with real on-chain balance + price fetch (Alchemy/Covalent) in production.
 */
export async function fetchMockBalances(address: string): Promise<TokenBalance[]> {
    // For demo, static balances and prices
    await new Promise((r) => setTimeout(r, 300)) // simulate latency
    return [
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            network: 'bitcoin',
            balance: 0.05,
            priceUSD: 70000
        },
        {
            symbol: 'ETH',
            name: 'Ethereum',
            network: 'ethereum',
            balance: 1.2,
            priceUSD: 3200
        },
        {
            symbol: 'USDC',
            name: 'USD Coin',
            network: 'ethereum',
            balance: 1500,
            priceUSD: 1
        }
    ]
}

export function computeAllocation(balances: TokenBalance[]) {
    const usdValues = balances.map((b) => b.balance * b.priceUSD)
    const total = usdValues.reduce((a, b) => a + b, 0)
    return balances.map((b, i) => ({
        symbol: b.symbol,
        usdValue: b.balance * b.priceUSD,
        percent: total > 0 ? (b.balance * b.priceUSD * 100) / total : 0
    }))
}

/**
 * Suggest simple rebalancing swaps:
 * - Compute surplus assets (current > target) and deficit assets (current < target)
 * - Create swap suggestions from surpluses -> deficits proportionally
 *
 * This is a simplified greedy algorithm for demo purposes.
 */
export function suggestRebalance(balances: TokenBalance[], targets: TargetAllocation): Suggestion[] {
    const allocations = computeAllocation(balances)
    const totalUsd = allocations.reduce((s, a) => s + a.usdValue, 0)

    // Build current map
    const currentMap: Record<string, { usd: number; percent: number; token: TokenBalance | undefined }> = {}
    allocations.forEach((a) => {
        const token = balances.find((b) => b.symbol === a.symbol)
        currentMap[a.symbol] = { usd: a.usdValue, percent: a.percent, token }
    })

    // Ensure targets contain same tokens (if not, treat missing as 0)
    const targetSymbols = Object.keys(targets)
    const surplus: { symbol: string; usd: number }[] = []
    const deficit: { symbol: string; usd: number }[] = []

    for (const symbol of targetSymbols) {
        const targetPct = targets[symbol] ?? 0
        const targetUsd = (targetPct / 100) * totalUsd
        const currentUsd = currentMap[symbol]?.usd ?? 0
        const diff = currentUsd - targetUsd
        if (diff > 1) {
            surplus.push({ symbol, usd: diff })
        } else if (diff < -1) {
            deficit.push({ symbol, usd: -diff })
        }
    }

    // Map surplus assets to deficit assets proportionally (simple)
    const suggestions: Suggestion[] = []
    let deficitIndex = 0

    for (const s of surplus) {
        let remaining = s.usd
        while (remaining > 0.5 && deficitIndex < deficit.length) {
            const d = deficit[deficitIndex]
            const take = Math.min(remaining, d.usd)
            // Build suggestion: swap `s.symbol` -> `d.symbol`
            const depositToken = balances.find((b) => b.symbol === s.symbol)
            const settleToken = balances.find((b) => b.symbol === d.symbol)
            if (!depositToken || !settleToken) {
                // If token not in balances (e.g., target includes token not held), skip for now
                deficitIndex++
                continue
            }
            // depositAmount in token units = take / price
            const depositAmountRaw = take / depositToken.priceUSD
            const settleAmountRaw = take / settleToken.priceUSD
            suggestions.push({
                depositCoin: depositToken.symbol,
                depositNetwork: depositToken.network,
                settleCoin: settleToken.symbol,
                settleNetwork: settleToken.network,
                depositAmount: depositAmountRaw.toFixed(8),
                estimatedSettleAmount: settleAmountRaw.toFixed(8),
                reason: `Move ~$${take.toFixed(2)} from ${depositToken.symbol} to ${settleToken.symbol}`
            })
            remaining -= take
            d.usd -= take
            if (d.usd <= 1) deficitIndex++
        }
    }

    return suggestions
}