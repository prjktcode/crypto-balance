//app/dashboard/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import WalletStatus from '@/../components/WalletStatus'
import Snapshot from '@/../components/Snapshot'
import TargetForm from '@/../components/TargetForm'
import Suggestions from '@/../components/Suggestions'
import { fetchOnChainBalances } from '@/../lib/balances'
import { TokenBalance, TargetAllocation, Suggestion } from '@/../types'
import { useAccount } from 'wagmi'
import { suggestRebalance } from '@/../lib/rebalance'

export default function DashboardPage() {
    const { address } = useAccount()
    const [balances, setBalances] = useState<TokenBalance[]>([])
    const [targets, setTargets] = useState<TargetAllocation>({})
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!address) {
            setBalances([])
            return
        }
        let canceled = false
        setLoading(true)
        fetchOnChainBalances(address)
            .then((b) => {
                if (!canceled) setBalances(b)
            })
            .catch((err) => setError(String(err?.message ?? err)))
            .finally(() => setLoading(false))
        return () => {
            canceled = true
        }
    }, [address])

    useEffect(() => {
        if (!balances.length || !Object.keys(targets).length) {
            setSuggestions([])
            return
        }
        const s = suggestRebalance(balances, targets)
        setSuggestions(s)
    }, [balances, targets])

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <WalletStatus />
                </div>

                {error && <div className="text-red-600 mb-4">Error: {error}</div>}
                {loading && <div className="text-gray-600 mb-4">Loading balances...</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Snapshot balances={balances} />
                        <TargetForm balances={balances} onChange={setTargets} />
                    </div>

                    <div>
                        <Suggestions
                            suggestions={suggestions}
                            onExecute={(updated) => {
                                if (updated && address) fetchOnChainBalances(address).then(setBalances)
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}