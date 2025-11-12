'use client'

import axios from 'axios'
import { usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import type { TokenBalance } from '../types'
import { KNOWN_TOKENS } from './tokens'

/**
 * Fetch on-chain balances for a wallet address (ETH + selected ERC-20 tokens)
 * - Uses wagmi's public client (viem) configured in your Providers
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
export async function fetchOnChainBalances(address: string): Promise<TokenBalance[]> {
    if (!address) return []

    const publicClient = usePublicClient()
    if (!publicClient) throw new Error('Public client not available — ensure Providers are mounted')

    // 1) Fetch native balance (ETH)
    const nativeToken = KNOWN_TOKENS.find((t) => t.symbol === 'ETH' && t.chainId === 1)
    const nativeBalanceBn = await publicClient.getBalance({ address })
    const nativeBalance = Number(formatUnits(nativeBalanceBn, nativeToken?.decimals ?? 18))

    // 2) For ERC-20 tokens, read balanceOf using readContract (concurrently)
    const erc20Tokens = KNOWN_TOKENS.filter((t) => t.address && t.address.length > 0 && t.chainId === 1)
    const erc20Promises = erc20Tokens.map(async (t) => {
        try {
            const balanceBn = await publicClient.readContract({
                address: t.address,
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
        } catch (err) {
            // If reading fails, return 0 balance for this token
            return { ...t, balance: 0 }
        }
    })
    const erc20Results = await Promise.all(erc20Promises)

    // 3) Fetch USD prices from CoinGecko
    // - Native ETH price via /simple/price
    // - ERC20 token prices via /simple/token_price/ethereum using contract addresses
    let ethPriceUSD = 0
    try {
        const r = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
        )
        ethPriceUSD = r?.data?.ethereum?.usd ?? 0
    } catch (err) {
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
        } catch (err) {
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