'use client'

import React, { useEffect, useState } from 'react'
import WalletStatus from '../components/WalletStatus'
import Snapshot from '../components/Snapshot'
import TargetForm from '../components/TargetForm'
import Suggestions from '../components/Suggestions'
import { fetchMockBalances, computeAllocation } from '../lib/rebalance'
import { TokenBalance, TargetAllocation, Suggestion } from '../types'

export default function Page() {
    const [address, setAddress] = useState<string | null>(null)
    const [balances, setBalances] = useState<TokenBalance[]>([])
    const [targets, setTargets] = useState<TargetAllocation>({})
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])

    useEffect(() => {
        if (!address) return
        // fetch balances (mocked)
        fetchMockBalances(address).then(setBalances)
    }, [address])

    useEffect(() => {
        if (!balances.length || !Object.keys(targets).length) {
            setSuggestions([])
            return
        }
        const current = computeAllocation(balances)
        // use lib function to create suggestions (locally estimated)
        const { suggestRebalance } = require('../lib/rebalance')
        const s = suggestRebalance(balances, targets)
        setSuggestions(s)
    }, [balances, targets])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Non-custodial Rebalancer</h1>
                <WalletStatus onAddressChange={setAddress} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Snapshot balances={balances} />
                    <TargetForm balances={balances} onChange={setTargets} />
                </div>

                <div>
                    <Suggestions
                        suggestions={suggestions}
                        onExecute={(updated) => {
                            // refresh balances after shift (in real life you'd re-query on-chain)
                            if (updated) {
                                // naive refresh:
                                if (address) fetchMockBalances(address).then(setBalances)
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}