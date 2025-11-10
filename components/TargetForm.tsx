'use client'

import React, { useState } from 'react'
import { TokenBalance, TargetAllocation } from '../types'

export default function TargetForm({
    balances,
    onChange
}: {
    balances: TokenBalance[]
    onChange: (t: TargetAllocation) => void
}) {
    const [targets, setTargets] = useState<TargetAllocation>(() =>
        balances.reduce((acc, b) => {
            acc[b.symbol] = 0
            return acc
        }, {} as TargetAllocation)
    )

    React.useEffect(() => {
        // initialize when balances change
        const map: TargetAllocation = {}
        balances.forEach((b) => (map[b.symbol] = targets[b.symbol] ?? 0))
        setTargets(map)
    }, [balances])

    const update = (symbol: string, value: string) => {
        const n = Math.min(100, Math.max(0, Number(value || 0)))
        const next = { ...targets, [symbol]: n }
        setTargets(next)
        onChange(next)
    }

    return (
        <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Target Allocation</h3>
            <div className="space-y-3">
                {balances.map((b) => (
                    <div key={b.symbol} className="flex items-center gap-3">
                        <div className="w-20">{b.symbol}</div>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={targets[b.symbol] ?? 0}
                            onChange={(e) => update(b.symbol, e.target.value)}
                            className="input input-bordered px-3 py-2 border rounded w-full"
                        />
                        <div className="w-20 text-sm text-black-500">%</div>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-sm text-black-500">Make sure allocations add up to 100% (not enforced).</div>
        </section>
    )
}