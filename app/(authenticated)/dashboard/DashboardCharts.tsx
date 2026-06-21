'use client'

import {
    AreaChart,
    Area,
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

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#a78bfa', '#f472b6']

type DashboardChartsProps = {
    visitTrend: { month: string; count: number }[]
    revenueTrend: { month: string; revenue: number }[]
    patientTypeDistribution: { name: string; count: number }[]
}

export function DashboardCharts({
    visitTrend,
    revenueTrend,
    patientTypeDistribution,
}: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visit Trend */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Visit Trend (6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={visitTrend}>
                        <defs>
                            <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
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
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#0d9488"
                            fill="url(#visitGradient)"
                            strokeWidth={2}
                            name="Visits"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue Trend */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Revenue Trend (6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueTrend}>
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
                        <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Patient Type Distribution */}
            {patientTypeDistribution.length > 0 && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Patient Type Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={patientTypeDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                innerRadius={50}
                                dataKey="count"
                                nameKey="name"
                                label={({ name, percent }: { name?: string; percent?: number }) =>
                                    `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {patientTypeDistribution.map((_, index) => (
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
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
