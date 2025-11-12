'use client'

import React, { useState } from 'react'
import { Suggestion } from '../types'

export default function Suggestions({
    suggestions,
    onExecute
}: {
    suggestions: Suggestion[]
    onExecute?: (refreshed?: boolean) => void
}) {
    const [quotes, setQuotes] = useState<Record<number, any>>({})
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
    const [executing, setExecuting] = useState(false)

    const fetchQuote = async (s: Suggestion, i: number) => {
        setLoadingIndex(i)
        try {
            const resp = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    depositCoin: s.depositCoin,
                    depositNetwork: s.depositNetwork,
                    settleCoin: s.settleCoin,
                    settleNetwork: s.settleNetwork,
                    depositAmount: s.depositAmount
                })
            })
            const data = await resp.json()
            setQuotes((q) => ({ ...q, [i]: data.data ?? data }))
        } catch (e) {
            setQuotes((q) => ({ ...q, [i]: { error: (e as any).message } }))
        } finally {
            setLoadingIndex(null)
        }
    }

    const executeShift = async (s: Suggestion, i: number) => {
        // This endpoint will call SideShift's /v2/shifts and return deposit instructions.
        setExecuting(true)
        try {
            const resp = await fetch('/api/shift', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    depositCoin: s.depositCoin,
                    depositNetwork: s.depositNetwork,
                    settleCoin: s.settleCoin,
                    settleNetwork: s.settleNetwork,
                    depositAmount: s.depositAmount,
                    // For demo we set returnAddress to a placeholder. In a real app this should be the user's receive address.
                    returnAddress: 'demo-return-address'
                })
            })
            const data = await resp.json()
            if (data.error) {
                alert('Shift error: ' + data.error)
            } else {
                alert('Shift created! Check response in console.')
                console.log('shift', data.data)
                if (onExecute) onExecute(true)
            }
        } catch (err: any) {
            alert('Shift request failed: ' + err?.message)
        } finally {
            setExecuting(false)
        }
    }

    if (!suggestions.length) {
        return (
            <section className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg text-gray-900 font-medium mb-2">Suggestions</h3>
                <div className="text-sm text-gray-900">No suggestions — set target allocation to see recommendations.</div>
            </section>
        )
    }

    return (
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-medium">Rebalance Suggestions</h3>

            {suggestions.map((s, i) => (
                <div key={i} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">{s.depositCoin} → {s.settleCoin}</div>
                            <div className="text-sm text-gray-500">{s.reason}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm">Deposit: {s.depositAmount} {s.depositCoin}</div>
                            <div className="text-sm">Est. Receive: {s.estimatedSettleAmount} {s.settleCoin}</div>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => fetchQuote(s, i)}
                            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                            disabled={loadingIndex === i}
                        >
                            {loadingIndex === i ? 'Fetching quote...' : 'Get Quote'}
                        </button>

                        <button
                            onClick={() => executeShift(s, i)}
                            className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                            disabled={executing}
                        >
                            {executing ? 'Executing...' : 'Rebalance Now'}
                        </button>

                        <div className="ml-auto text-xs text-gray-500">
                            {quotes[i] && (quotes[i].error ? <span className="text-red-500">Quote error</span> : <span>Quoted rate available</span>)}
                        </div>
                    </div>

                    {quotes[i] && !quotes[i].error && (
                        <pre className="mt-3 text-xs bg-white p-2 border rounded overflow-auto">{JSON.stringify(quotes[i], null, 2)}</pre>
                    )}
                </div>
            ))}
        </section>
    )
}