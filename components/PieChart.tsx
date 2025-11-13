// .components/PieChart.tsx

'use client'

import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Allocation } from '../types'

// Register required elements/controllers once at module scope
ChartJS.register(ArcElement, Tooltip, Legend)

export default function PieChart({ data }: { data?: Allocation[] }) {
    const hasData = Array.isArray(data) && data.length > 0

    const labels = hasData ? data!.map((d) => d.symbol) : ['']
    const datasetValues = hasData ? data!.map((d) => d.usdValue) : [1]
    const colors = hasData
        ? ['#f97316', '#6366f1', '#10b981', '#f43f5e', '#06b6d4']
        : ['rgba(148, 163, 184, 0.15)'] // subtle gray placeholder

    const chartData = {
        labels,
        datasets: [
            {
                data: datasetValues,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: hasData ? 8 : 0,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { display: hasData },
            tooltip: { enabled: hasData },
        },
    }

    // Always render a chart; when no data we show a neutral placeholder donut
    return <Doughnut data={chartData} options={options} />
}
