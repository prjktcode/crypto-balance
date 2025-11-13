'use client'

import React, { useState } from 'react'

type AIResponse = {
    text: string
    raw?: any
}

export default function AISuggestions() {
    const [prompt, setPrompt] = useState<string>(
        'Given a portfolio of 50% BTC, 30% ETH, 20% USDC and current prices, recommend a rebalancing strategy and suggest swaps. Explain rationale and estimated gas considerations.'
    )
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AIResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function fetchAISuggestion() {
        setError(null)
        setResult(null)
        setLoading(true)
        try {
            const resp = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })
            const json = await resp.json()
            if (!resp.ok) {
                setError(json?.error || 'AI request failed')
            } else {
                setResult({ text: json?.data?.text ?? json?.data ?? 'No response', raw: json?.data })
            }
        } catch (err: any) {
            setError(String(err?.message ?? err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Ask the AI</label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="w-full rounded border p-3 text-sm"
            />
            <div className="flex gap-3">
                <button
                    onClick={fetchAISuggestion}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
                >
                    {loading ? 'Thinking...' : 'Get AI Suggestion'}
                </button>

                <button
                    onClick={() =>
                        setPrompt(
                            'Provide a short, plain-language summary (3–4 bullets) explaining why one might rebalance from ETH to USDC.'
                        )
                    }
                    className="px-3 py-1 border rounded text gray 800 text-sm"
                >
                    Quick prompt
                </button>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {result && (
                <div className="mt-4 bg-slate-800 p-4 rounded border">
                    <h4 className="text-sm font-medium mb-2">AI response</h4>
                    <div className="prose max-w-none text-sm whitespace-pre-wrap">{result.text}</div>

                    <details className="mt-3 text-xs text-slate-800">
                        <summary>Raw response</summary>
                        <pre className="mt-2 max-h-48 overflow-auto text-xs">{JSON.stringify(result.raw, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    )
}