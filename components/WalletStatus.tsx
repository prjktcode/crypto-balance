//.components/WalletStatus.ts

'use client'

import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'



export default function WalletStatus({ onAddressChange }: { onAddressChange?: (addr: string | null) => void }) {
    const { address, isConnected } = useAccount()
    const { chain } = useChainId()

    React.useEffect(() => {
        if (onAddressChange) onAddressChange(address ?? null)
    }, [address, onAddressChange])

    return (
        <div className="flex items-center gap-4">
            <div className="text-sm text-gray-900">
                {isConnected ? (
                    <div>
                        <div className="font-medium">{address}</div>
                        <div className="text-xs text-gray-900">Chain: {chain?.name ?? chain?.id}</div>
                    </div>
                ) : (
                    <div className="text-sm">Not connected</div>
                )}
            </div>
            <ConnectButton />
        </div>
    )
}