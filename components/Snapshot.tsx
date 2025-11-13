// .components/Snapshot.tsx

'use client'

import React from 'react'
import { TokenBalance } from '../types'
import { computeAllocation } from '../lib/rebalance'
import dynamic from 'next/dynamic'

const PieChart = dynamic(() => import('./PieChart'), { ssr: false })

export default function Snapshot({ balances }: { balances: TokenBalance[] }) {
    // Compute allocations and sanitize numbers to guarantee a structured shape.
    const rawAllocations = computeAllocation(balances)

    const allocations = rawAllocations
        .map((a) => ({
            symbol: a.symbol,
            usdValue: Number.isFinite(a.usdValue) ? a.usdValue : 0,
            percent: Number.isFinite(a.percent) ? a.percent : 0,
        }))
        // keep all entries; percent may be 0 when total is 0 (safe)
        // but ensure numbers are finite
        .filter((a) => Number.isFinite(a.usdValue) && Number.isFinite(a.percent))

    const total = allocations.reduce((s, a) => s + a.usdValue, 0)

    // If total is not positive, pass undefined to PieChart to render the empty placeholder donut.
    const chartData = total > 0 ? allocations : undefined

    return (
        <section className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg text-gray-800 font-medium">Portfolio Snapshot</h2>
                <div className="text-sm text-gray-800">Total: ${total.toFixed(2)}</div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <ul className="space-y-3">
                        {allocations.map((a) => (
                            <li key={a.symbol} className="text-gray-800 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{a.symbol}</div>
                                    <div className="text-xs text-gray-800">${a.usdValue.toFixed(2)}</div>
                                </div>
                                <div className="text-sm text-gray-800">{a.percent.toFixed(2)}%</div>
                            </li>
                        ))}
                        {allocations.length === 0 && (
                            <li className="text-sm text-gray-500">No assets yet. Connect your wallet to populate balances.</li>
                        )}
                    </ul>
                </div>

                <div className="w-48 h-48">
                    <PieChart data={chartData} />
                </div>
            </div>
        </section>
    )
}