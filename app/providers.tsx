'use client'

import React, { useMemo } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiConfig, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { http } from 'viem'

/**
 * Providers - updated for RainbowKit v2 + Wagmi v2 migration
 *
 * - Uses getDefaultConfig from @rainbow-me/rainbowkit (recommended migration path).
 * - Provides a QueryClientProvider (required peer for Wagmi v2).
 * - Wraps app with WagmiConfig and WagmiProvider (follow migration examples).
 * - Uses viem http transport for RPC and passes a WalletConnect projectId.
 *
 * Env:
 * - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (recommended)
 * - NEXT_PUBLIC_MAINNET_RPC (recommended)
 * - NEXT_PUBLIC_APP_NAME
 */

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
    // Chains: keep simple for demo; you can add more chains here.
    const chains = useMemo(() => [mainnet], [])

    // Public config values (safe to expose)
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'RebalancerDemo'
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'cbfc2f1f409ef732b20ba6e538d4ef11'
    const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://eth.drpc.org'

    // Build the RainbowKit/Wagmi config using the new helper
    const config = useMemo(
        () =>
            getDefaultConfig({
                appName,
                projectId,
                chains,
                // Provide viem transports per-chain. You can add additional chains/transports here.
                transports: {
                    [mainnet.id]: http(rpcUrl)
                },
                // Optional: pass custom wallet list via `wallets` if you want to override defaults
                // wallets: [...]
            }),
        [appName, projectId, chains, rpcUrl]
    )

    return (
        // WagmiConfig and WagmiProvider are both shown in the migration docs; include both
        <WagmiConfig config={config}>
            <WagmiProvider config={config} reconnectOnMount={true}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider>
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </WagmiConfig>
    )
}