import './globals.css'
import ConnectHero from '../components/ConnectHero'
import AISuggestions from '../components/AISuggestions'

export const metadata = {
    title: 'Crypto Balance — Intelligent Rebalancer',
    description: 'Non-custodial portfolio rebalancer with AI suggestions and one-click SideShift swaps'
}

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
            <header className="py-12">
                <div className="container mx-auto px-6">
                    <nav className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Crypto Balance
                            </h1>
                            <p className="mt-1 text-slate-600 max-w-xl">Swap smarter, not harder — non-custodial rebalancer.</p>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {/* Compact connect UI in header */}
                            <ConnectHero compact redirectOnConnect />
                        </div>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-6 space-y-12 pb-24">
                <section className="bg-white rounded-2xl shadow-lg p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                            Rebalance your portfolio. Non-custodial. Intelligent.
                        </h2>
                        <p className="mt-4 text-slate-600 max-w-2xl">
                            Connect your wallet to view real on-chain balances, define target allocations, and get swap
                            suggestions powered by SideShift.ai. Use AI to explain strategy and improve swap ordering.
                        </p>

                        <ul className="mt-6 grid gap-3">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 text-indigo-600">●</div>
                                <div className="text-slate-700">Real on‑chain balances & USD prices (CoinGecko)</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 text-indigo-600">●</div>
                                <div className="text-slate-700">Secure SideShift quote & shift proxy (server-side secrets)</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 text-indigo-600">●</div>
                                <div className="text-slate-700">AI-driven strategy suggestions and rationale</div>
                            </li>
                        </ul>

                        <div className="mt-8 flex gap-3 items-center">
                            <ConnectHero />
                            <a
                                href="/dashboard"
                                className="px-4 py-2 inline-flex items-center gap-2 rounded-md border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                View dashboard (demo)
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        {/* Simple, modern illustration — keep inline SVG to avoid extra assets */}
                        <div className="bg-gradient-to-br from-indigo-50 to-sky-50 rounded-xl p-6 shadow-inner">
                            <svg width="420" height="280" viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="10" y="20" width="400" height="240" rx="16" fill="#fff" stroke="#eef2ff" strokeWidth="2" />
                                <g transform="translate(40,40)">
                                    <rect width="120" height="24" rx="6" fill="#eef2ff" />
                                    <rect y="44" width="160" height="110" rx="10" fill="#f8fafc" stroke="#eef2ff" />
                                    <rect x="180" width="120" height="110" rx="10" fill="#fff" stroke="#e6f2ff" />
                                    <circle cx="260" cy="75" r="28" fill="#eef2ff" />
                                    <path d="M10 80 C 40 30, 120 120, 150 40" stroke="#c7d2fe" strokeWidth="6" fill="none" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-4">AI Suggestions</h3>
                        <AISuggestions />
                    </div>

                    <aside className="bg-white rounded-lg shadow p-6">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">How AI helps</h4>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>- Explain why assets are overweight / underweight</li>
                            <li>- Recommend swap ordering to save gas and reduce slippage</li>
                            <li>- Provide a plain-language rationale for allocations</li>
                        </ul>

                        <div className="mt-6 text-xs text-slate-500">
                            AI suggestions are informational only. Always validate quotes, addresses and slippage before executing swaps.
                        </div>
                    </aside>
                </section>

                <section className="bg-white rounded-lg shadow p-8">
                    <h3 className="text-lg font-medium">Get started</h3>
                    <div className="mt-4 text-slate-600">
                        Connect your wallet, set target allocations on the dashboard, and request swap quotes. Use "Rebalance Now" to
                        create SideShift shifts (affiliate monetization supported).
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-slate-100">
                <div className="container mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
                    <div>© {new Date().getFullYear()} Crypto Balance</div>
                    <div>
                        <a href="https://sideshift.ai" target="_blank" rel="noreferrer" className="hover:underline">Powered by SideShift</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}