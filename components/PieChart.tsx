'use client'

import React from 'react'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Allocation } from '../types'

Chart.register(ArcElement, Tooltip, Legend)

export default function PieChart({ data }: { data: Allocation[] }) {
    const chartData = {
        labels: data.map((d) => d.symbol),
        datasets: [
            {
                data: data.map((d) => d.usdValue),
                backgroundColor: ['#f97316', '#6366f1', '#10b981', '#f43f5e', '#06b6d4'],
                hoverOffset: 8
            }
        ]
    }

    return <Doughnut data={chartData} />
}