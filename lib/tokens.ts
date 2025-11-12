// Token registry used by the on-chain balances fetcher.
// Extend this list with the tokens you want to monitor.
// Fields:
// - symbol: display symbol
// - name: human readable
// - address: ERC-20 contract address (omit / empty for native)
// - decimals: token decimals
// - coingeckoId: CoinGecko id (for native ETH use 'ethereum', for ERC20 use token id or rely on contract endpoint)
// - chainId: numeric chain id (1 = Ethereum mainnet)
//
// NOTE: This file is safe to commit.
export const KNOWN_TOKENS = [
    {
        symbol: 'ETH',
        name: 'Ethereum',
        address: '', // native
        decimals: 18,
        coingeckoId: 'ethereum',
        chainId: 1
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48',
        decimals: 6,
        coingeckoId: 'usd-coin',
        chainId: 1
    },
    {
        symbol: 'WBTC',
        name: 'Wrapped Bitcoin',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        coingeckoId: 'wrapped-bitcoin',
        chainId: 1
    }
    // Add more tokens here as desired (mainnet addresses). For other chains you can add entries with their chainId and RPC support later.
] as const