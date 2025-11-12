'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import WalletStatus from './WalletStatus'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

// Dynamically import ConnectButton to avoid any SSR evaluation of wallet internals
const ConnectButton = dynamic(
    () => import('@rainbow-me/rainbowkit').then((m) => m.ConnectButton),
    { ssr: false }
)

export default function ConnectHero({ compact = false, redirectOnConnect = false }: { compact?: boolean; redirectOnConnect?: boolean }) {
    const { isConnected } = useAccount()
    const router = useRouter()

    // If redirectOnConnect is true, navigate to /dashboard automatically after connection
    useEffect(() => {
        if (isConnected && redirectOnConnect) {
            // small microtask to let state settle
            const t = setTimeout(() => router.push('/dashboard'), 300)
            return () => clearTimeout(t)
        }
    }, [isConnected, redirectOnConnect, router])

    return (
        <div className={`${compact ? 'flex items-center gap-4' : 'space-y-4'}`}>
            {!compact && (
                <div>
                    <h3 className="text-xl font-semibold">Connect your wallet</h3>
                    <p className="text-sm text-slate-600">Securely connect an Ethereum-compatible wallet to get started.</p>
                </div>
            )}

            <div className={`${compact ? 'flex items-center gap-3' : 'flex flex-col gap-3'}`}>
                <div>
                    <WalletStatus />
                </div>

                <div>
                    <ConnectButton />
                </div>
            </div>
        </div>
    )
}