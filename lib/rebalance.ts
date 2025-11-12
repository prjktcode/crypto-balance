/**
 * lib/rebalance.ts
 *
 * Improved, pure rebalance logic that works with real on-chain TokenBalance[]
 * and TargetAllocation. This module:
 * - Computes current allocation (usd + percent)
 * - Builds a list of surplus -> deficit swap suggestions using a simple,
 *   deterministic greedy algorithm
 *
 * Notes:
 * - This is intentionally pure (no network calls). Use the server-side
 *   /api/quote route to fetch SideShift quotes for each suggestion.
 * - depositAmount and estimatedSettleAmount are returned as token-unit strings
 *   (rounded to 8 decimals) — good for display and for passing into /api/quote.
 */

import { TokenBalance, TargetAllocation, Suggestion, Allocation } from '../types'

const MIN_USD_DIFF = 1 // ignore diffs smaller than this (USD)

/**
 * Compute allocation (usd value + percent) for a set of balances.
 */
export function computeAllocation(balances: TokenBalance[]): Allocation[] {
    const usdValues = balances.map((b) => b.balance * b.priceUSD)
    const total = usdValues.reduce((a, b) => a + b, 0)
    return balances.map((b) => {
        const usdValue = b.balance * b.priceUSD
        return {
            symbol: b.symbol,
            usdValue,
            percent: total > 0 ? (usdValue * 100) / total : 0
        }
    })
}

/**
 * Suggest rebalancing swaps from surplus -> deficit assets.
 *
 * Algorithm:
 * 1. Compute current usd values and total portfolio USD.
 * 2. For every symbol in targets, compute targetUsd = targetPct/100 * totalUsd.
 * 3. If currentUsd > targetUsd + MIN_USD_DIFF => surplus; if < targetUsd - MIN_USD_DIFF => deficit.
 * 4. Greedy allocate surplus amounts to deficits (largest surplus/deficit first).
 *
 * This is a simple demonstrator algorithm. You can improve it later by:
 * - Reducing number of swaps (graph matching / cycle elimination)
 * - Preferring swaps that reduce network hops
 * - Considering order book/liquidity constraints (quotes)
 */
export function suggestRebalance(balances: TokenBalance[], targets: TargetAllocation): Suggestion[] {
    // Build maps for quick lookup
    const balanceMap: Record<string, TokenBalance> = {}
    balances.forEach((b) => {
        balanceMap[b.symbol] = b
    })

    // Compute current allocations and total USD
    const allocations = computeAllocation(balances)
    const totalUsd = allocations.reduce((s, a) => s + a.usdValue, 0)

    // Build full list of symbols to consider: union of balances and target keys
    const symbolsSet = new Set<string>()
    allocations.forEach((a) => symbolsSet.add(a.symbol))
    Object.keys(targets).forEach((s) => symbolsSet.add(s))
    const allSymbols = Array.from(symbolsSet)

    // Compute surplus & deficit arrays
    type Side = { symbol: string; usd: number }
    const surplus: Side[] = []
    const deficit: Side[] = []

    for (const symbol of allSymbols) {
        const currentUsd = allocations.find((a) => a.symbol === symbol)?.usdValue ?? 0
        const targetPct = Number(targets[symbol] ?? 0)
        const targetUsd = (targetPct / 100) * totalUsd
        const diff = currentUsd - targetUsd
        if (diff > MIN_USD_DIFF) surplus.push({ symbol, usd: diff })
        else if (diff < -MIN_USD_DIFF) deficit.push({ symbol, usd: -diff })
        // small diffs within MIN_USD_DIFF are ignored
    }

    // Sort surplus (largest first) and deficit (largest first) to minimize number of swaps
    surplus.sort((a, b) => b.usd - a.usd)
    deficit.sort((a, b) => b.usd - a.usd)

    // Greedy pairing: iterate surpluses and allocate to deficits
    const suggestions: Suggestion[] = []
    let deficitIdx = 0

    for (const s of surplus) {
        let remaining = s.usd
        // if the surplus asset is not in balances (e.g., target includes token not held) skip
        const depositToken = balanceMap[s.symbol]
        if (!depositToken) continue

        while (remaining > MIN_USD_DIFF && deficitIdx < deficit.length) {
            const d = deficit[deficitIdx]
            const takeUsd = Math.min(remaining, d.usd)
            const settleToken = balanceMap[d.symbol]
            // If settle token isn't held (user doesn't have it), it's still valid to acquire it.
            // But we need a price estimate to compute token unit amounts; skip if price unknown.
            const depositPrice = depositToken.priceUSD ?? 0
            const settlePrice = settleToken?.priceUSD ?? 0

            // If we have prices, compute token-unit amounts; otherwise set 0 and mark unknown
            const depositAmountRaw = depositPrice > 0 ? takeUsd / depositPrice : 0
            const settleAmountRaw = settlePrice > 0 ? takeUsd / settlePrice : 0

            const suggestion: Suggestion = {
                depositCoin: depositToken.symbol,
                depositNetwork: depositToken.network,
                settleCoin: d.symbol,
                settleNetwork: settleToken?.network ?? depositToken.network, // assume same network if unknown
                depositAmount: depositAmountRaw > 0 ? depositAmountRaw.toFixed(8) : '0',
                estimatedSettleAmount: settleAmountRaw > 0 ? settleAmountRaw.toFixed(8) : '0',
                reason: `Rebalance: move ~$${takeUsd.toFixed(2)} from ${depositToken.symbol} to ${d.symbol}`
            }

            suggestions.push(suggestion)

            // update counters
            remaining -= takeUsd
            d.usd -= takeUsd
            if (d.usd <= MIN_USD_DIFF) deficitIdx++
        }
    }

    return suggestions
}

/**
 * Utility: builds a human-readable comparison between current and target allocation.
 * Returns an array containing symbol, currentPct, targetPct, overUnder (usd and pct).
 */
export function compareCurrentToTarget(balances: TokenBalance[], targets: TargetAllocation) {
    const allocations = computeAllocation(balances)
    const totalUsd = allocations.reduce((s, a) => s + a.usdValue, 0)
    const result = allocations.map((a) => {
        const targetPct = Number(targets[a.symbol] ?? 0)
        const targetUsd = (targetPct / 100) * totalUsd
        const diffUsd = a.usdValue - targetUsd
        return {
            symbol: a.symbol,
            currentPct: a.percent,
            targetPct,
            currentUsd: a.usdValue,
            targetUsd,
            overUnderUsd: diffUsd
        }
    })

    // Also include any target symbols not in current allocations
    for (const k of Object.keys(targets)) {
        if (!result.find((r) => r.symbol === k)) {
            const targetPct = Number(targets[k] ?? 0)
            result.push({
                symbol: k,
                currentPct: 0,
                targetPct,
                currentUsd: 0,
                targetUsd: (targetPct / 100) * totalUsd,
                overUnderUsd: 0 - (targetPct / 100) * totalUsd
            })
        }
    }

    // sort by descending under/over absolute USD for display
    result.sort((a, b) => Math.abs(b.overUnderUsd) - Math.abs(a.overUnderUsd))
    return result
}