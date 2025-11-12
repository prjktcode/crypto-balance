'use client'

import React from 'react'
import { TokenBalance } from '../types'
import { computeAllocation } from '../lib/rebalance'
import dynamic from 'next/dynamic'

const PieChart = dynamic(() => import('./PieChart'), { ssr: false })

export default function Snapshot({ balances }: { balances: TokenBalance[] }) {
    const allocations = computeAllocation(balances)
    const total = allocations.reduce((s, a) => s + a.usdValue, 0)

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
                    </ul>
                </div>

                <div className="w-48 h-48">
                    <PieChart data={allocations} />
                </div>
            </div>
        </section>
    )
}