'use client'

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#a78bfa', '#f472b6']

type Props = {
    monthlyRevenueTrend: { month: string; revenue: number }[]
    paymentModeBreakdown: { name: string; count: number; total: number }[]
    revenueByType: { name: string; revenue: number }[]
}

export function BillingCharts({
    monthlyRevenueTrend,
    paymentModeBreakdown,
    revenueByType,
}: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Monthly Revenue
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyRevenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--foreground)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="var(--foreground)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Payment Mode Breakdown */}
            {paymentModeBreakdown.length > 0 && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Payment Mode (This Month)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={paymentModeBreakdown}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={50}
                                dataKey="total"
                                nameKey="name"
                                label={({ name, percent }: { name?: string; percent?: number }) =>
                                    `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {paymentModeBreakdown.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Amount']}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Revenue by Patient Type */}
            {revenueByType.length > 0 && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Revenue by Patient Type
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueByType} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--foreground)" />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--foreground)" width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
