'use client'

import axios from 'axios'
import { formatUnits, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { TokenBalance } from '../types'
import { KNOWN_TOKENS } from './tokens'

/**
 * Fetch on-chain balances for a wallet address (ETH + selected ERC-20 tokens)
 * - Uses a local viem PublicClient (configured with mainnet + RPC) — no React hooks here.
 * - Uses CoinGecko for USD prices
 *
 * Returns TokenBalance[] with fields:
 * { symbol, name, contract?, network, balance (token units), priceUSD }
 *
 * Notes:
 * - Only supports the tokens listed in lib/tokens.ts (extendable)
 * - Only supports EVM tokens on chainId === 1 (Ethereum mainnet) for CoinGecko token_price path.
 * - CoinGecko rate limits apply; consider caching on server for production.
 */
export async function fetchOnChainBalances(address: `0x${string}`): Promise<TokenBalance[]> {
    if (!address) return []

    // Build a standalone public client (no React hooks)
    const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://eth.drpc.org'
    const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl)
    })

    // 1) Fetch native balance (ETH)
    const nativeToken = KNOWN_TOKENS.find((t) => t.symbol === 'ETH' && t.chainId === 1)
    const nativeBalanceBn = await publicClient.getBalance({ address })
    const nativeBalance = Number(formatUnits(nativeBalanceBn, nativeToken?.decimals ?? 18))

    // 2) For ERC-20 tokens, read balanceOf using readContract (concurrently)
    const erc20Tokens = KNOWN_TOKENS.filter((t) => t.address && t.address.length > 0 && t.chainId === 1)
    const erc20Promises = erc20Tokens.map(async (t) => {
        try {
            const balanceBn = await publicClient.readContract({
                address: t.address as `0x${string}`,
                abi: [
                    {
                        name: 'balanceOf',
                        type: 'function',
                        stateMutability: 'view',
                        inputs: [{ name: '_owner', type: 'address' }],
                        outputs: [{ name: 'balance', type: 'uint256' }]
                    }
                ],
                functionName: 'balanceOf',
                args: [address]
            })
            const bal = Number(formatUnits(balanceBn as bigint, t.decimals))
            return { ...t, balance: bal }
        } catch {
            // If reading fails, return 0 balance for this token
            return { ...t, balance: 0 }
        }
    })
    const erc20Results = await Promise.all(erc20Promises)

    // 3) Fetch USD prices from CoinGecko
    let ethPriceUSD = 0
    try {
        const r = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
        )
        ethPriceUSD = r?.data?.ethereum?.usd ?? 0
    } catch {
        ethPriceUSD = 0
    }

    // prepare contract address list for token_price endpoint (lowercase)
    const contractAddresses = erc20Tokens.map((t) => t.address.toLowerCase()).join(',')
    let tokenPrices: Record<string, { usd?: number }> = {}
    if (contractAddresses) {
        try {
            const r = await axios.get(
                `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses}&vs_currencies=usd`
            )
            tokenPrices = r?.data ?? {}
        } catch {
            tokenPrices = {}
        }
    }

    // 4) Build TokenBalance[] result
    const results: TokenBalance[] = []

    // native
    results.push({
        symbol: 'ETH',
        name: nativeToken?.name ?? 'Ethereum',
        network: 'ethereum',
        balance: nativeBalance,
        priceUSD: ethPriceUSD
    })

    // erc20 tokens
    for (const t of erc20Results) {
        const contractLc = String(t.address).toLowerCase()
        const priceEntry = tokenPrices[contractLc] as { usd?: number } | undefined
        const price = priceEntry?.usd ?? 0
        results.push({
            symbol: t.symbol,
            name: t.name,
            contract: t.address,
            network: 'ethereum',
            balance: (t as any).balance ?? 0,
            priceUSD: price
        })
    }

    return results
}