//.app/providers.tsx

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { http } from 'viem'

/**
 * Client-only Providers that safely dynamic-imports RainbowKit/getDefaultConfig
 * to avoid executing WalletConnect code during SSR (which triggers the
 * String.repeat(-1) error in server chunks).
 *
 * Behavior:
 * - During SSR nothing that references @rainbow-me/rainbowkit is imported.
 * - On the client we dynamically import getDefaultConfig and RainbowKitProvider,
 *   create the config, then render the full providers tree.
 *
 * Note: until the config is ready we render a small loader; this prevents
 * components using wagmi hooks from running before the provider is mounted.
 */

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
    const chains = useMemo(() => [mainnet], [])

    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'RebalancerDemo'
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '16639b26dbf4e22ecaf475186aae113f'
    const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://eth.drpc.org'

    // local state to hold client-only imports and built config
    const [clientReady, setClientReady] = useState(false)
    const [RainbowKitProvider, setRainbowKitProvider] = useState<any | null>(null)
    const [config, setConfig] = useState<any | null>(null)

    useEffect(() => {
        let mounted = true

            // Dynamic import only on the client — avoids SSR evaluation of walletconnect core
            ; (async () => {
                try {
                    const rk = await import('@rainbow-me/rainbowkit')
                    // Prefer getDefaultConfig (RainbowKit helper). Falls back to createConfig if needed.
                    const getDefaultConfig = rk.getDefaultConfig as any
                    let builtConfig: any

                    if (typeof getDefaultConfig === 'function') {
                        builtConfig = getDefaultConfig({
                            appName,
                            projectId,
                            chains,
                            transports: {
                                [mainnet.id]: http(rpcUrl)
                            }
                        })
                    } else {
                        // Fallback: create basic wagmi config (safer fallback)
                        builtConfig = createConfig({
                            connectors: [], // connectors will be filled by RainbowKit if needed
                            transports: {
                                [mainnet.id]: http(rpcUrl)
                            }
                        })
                    }

                    if (!mounted) return

                    setRainbowKitProvider(() => rk.RainbowKitProvider)
                    setConfig(builtConfig)
                    setClientReady(true)
                } catch (err) {
                    // If dynamic import fails, log and keep the app from attempting wallet hooks.
                    // Client will show the fallback UI and you can inspect console for errors.
                    // eslint-disable-next-line no-console
                    console.error('Failed to load RainbowKit dynamically', err)
                    setClientReady(false)
                }
            })()

        return () => {
            mounted = false
        }
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Loading / fallback UI while we wait for client-only config to be ready.
    // Important: do NOT render children that use wagmi hooks until config exists.
    if (!clientReady || !config || !RainbowKitProvider) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="p-4 rounded bg-white shadow text-sm text-gray-900">Loading wallet providers...</div>
            </div>
        )
    }

    const RKProvider = RainbowKitProvider

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RKProvider>
                    {children}
                </RKProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}