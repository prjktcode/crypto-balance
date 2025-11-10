'use client';

import { useState } from 'react';
import { suggestRebalance } from '../lib/rebalance';
import { getQuote } from '../lib/sideshift';

export default function HomePage() {
    const [current, setCurrent] = useState({ BTC: 40, ETH: 40, USDC: 20 });
    const [target, setTarget] = useState({ BTC: 50, ETH: 30, USDC: 20 });
    const [suggestions, setSuggestions] = useState([]);

    const handleRebalance = async () => {
        const rebalance = suggestRebalance(current, target);
        const quotes = await Promise.all(
            rebalance.map(s => getQuote(s.from, 'BTC', s.amount))
        );
        setSuggestions(quotes);
    };

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold">Portfolio Rebalancer</h1>
            <button onClick={handleRebalance} className="mt-4 px-4 py-2 bg-blue-500 text-white">
                Suggest Rebalance
            </button>
            <ul className="mt-6">
                {suggestions.map((q, i) => (
                    <li key={i}>
                        Swap {q.depositCoin} → {q.settleCoin} at rate {q.rate}
                    </li>
                ))}
            </ul>
        </main>
    );
}