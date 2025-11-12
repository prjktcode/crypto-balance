'use client'

import React, { useEffect, useState } from 'react'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Allocation } from '../types'

export default function PieChart({ data }: { data?: Allocation[] }) {
    const [isRegistered, setIsRegistered] = useState(false)

    useEffect(() => {
        if (!isRegistered) {
            Chart.register(ArcElement, Tooltip, Legend)
            setIsRegistered(true)
        }
    }, [isRegistered])

    // don't render until both registration and wallet data are ready
    if (!isRegistered || !data || data.length === 0) return null

    const chartData = {
        labels: data.map((d) => d.symbol),
        datasets: [
            {
                data: data.map((d) => d.usdValue),
                backgroundColor: ['#f97316', '#6366f1', '#10b981', '#f43f5e', '#06b6d4'],
                hoverOffset: 8,
            },
        ],
    }

    return <Doughnut data={chartData} />
}
