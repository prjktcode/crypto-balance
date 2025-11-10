'use client'

import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'

function shortenAddress(addr?: string | null) {
    if (!addr) return ''
    return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

/**
 * WalletStatus
 * - Must be a client component and rendered as a child of Providers (WagmiProvider)
 * - Uses useAccount/useChainId which require the WagmiProvider context
 */
export default function WalletStatus({ onAddressChange }: { onAddressChange?: (addr: string | null) => void }) {
    const { address, isConnected } = useAccount()
    const { chain } = useChainId()

    React.useEffect(() => {
        if (onAddressChange) onAddressChange(address ?? null)
    }, [address, onAddressChange])

    return (
        <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
                {isConnected ? (
                    <div>
                        <div className="font-medium">{shortenAddress(address)}</div>
                        <div className="text-xs text-gray-500">Chain: {chain?.name ?? chain?.id}</div>
                    </div>
                ) : (
                    <div className="text-sm">Not connected</div>
                )}
            </div>
            <ConnectButton />
        </div>
    )
}