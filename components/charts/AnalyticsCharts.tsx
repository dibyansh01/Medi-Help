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

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#a78bfa', '#f472b6', '#fbbf24', '#34d399']

type Props = {
    patientGrowth: { month: string; count: number }[]
    diseaseDistribution: { name: string; value: number }[]
    visitFrequency: { visits: string; count: number }[]
    revenueTrend: { month: string; revenue: number }[]
    revenueByType: { name: string; revenue: number }[]
}

export function AnalyticsCharts({
    patientGrowth,
    diseaseDistribution,
    visitFrequency,
    revenueTrend,
    revenueByType,
}: Props) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Growth */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Patient Growth (12 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={patientGrowth}>
                            <defs>
                                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--foreground)" />
                            <YAxis tick={{ fontSize: 11 }} stroke="var(--foreground)" />
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
                                fill="url(#growthGradient)"
                                strokeWidth={2}
                                name="New Patients"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Disease Category Distribution */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Disease Category Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={diseaseDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={55}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }: { name?: string; percent?: number }) =>
                                    `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {diseaseDistribution.map((_, index) => (
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

                {/* Visit Frequency Distribution */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Visit Frequency Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={visitFrequency}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="visits"
                                tick={{ fontSize: 11 }}
                                stroke="var(--foreground)"
                                label={{ value: 'Number of Visits', position: 'insideBottom', offset: -5, fontSize: 11 }}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                stroke="var(--foreground)"
                                label={{ value: 'Patients', angle: -90, position: 'insideLeft', fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Patients" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Revenue Trend (12 Months)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--foreground)" />
                            <YAxis tick={{ fontSize: 11 }} stroke="var(--foreground)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue by Patient Type */}
            {revenueByType.length > 0 && (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Revenue by Patient Type
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueByType} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--foreground)" />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="var(--foreground)" width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="#2dd4bf" radius={[0, 4, 4, 0]} name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
