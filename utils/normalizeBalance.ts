import { TokenBalance} from '../types'

export function normalize(balances: TokenBalance[]) {
    // Example helper: ensure symbols uppercase, sort by USD value descending
    return balances
        .map((b) => ({ ...b, symbol: b.symbol.toUpperCase() }))
        .sort((a, b) => b.balance * b.priceUSD - a.balance * a.priceUSD)
}