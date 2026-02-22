'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface GstTrendChartProps {
    data: {
        collected: number;
        paidClaimable: number;
        label: string;
    }[];
}

import { useTheme } from 'next-themes';

export function GstTrendChart({ data }: GstTrendChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    const textColor = isDark ? '#94a3b8' : '#64748B';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#E2E8F0';
    const tooltipColor = isDark ? '#f1f5f9' : '#1E293B';

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] w-full flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <p>No trend data available for this period</p>
            </div>
        );
    }
    return (
        <div className="h-[350px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: textColor, fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: textColor, fontSize: 12 }}
                        tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any, name: any) => [
                            `₹${Number(value || 0).toLocaleString()}`,
                            name === 'collected' ? 'GST Collected' : 'GST Paid (Credit)'
                        ]}
                        labelStyle={{ color: tooltipColor, fontWeight: 600, marginBottom: '0.25rem' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                        type="monotone"
                        dataKey="collected"
                        name="GST Collected"
                        stroke="#3B82F6" // Blue
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="paidClaimable"
                        name="GST Paid (Claimable)"
                        stroke="#10B981" // Green
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
