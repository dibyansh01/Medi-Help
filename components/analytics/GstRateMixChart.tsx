'use client'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useTheme } from 'next-themes';
import { CHART_PALETTE_MAIN } from '@/lib/constants/colors';

interface GstRateMixChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

export function GstRateMixChart({ data }: GstRateMixChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tooltipBg = isDark ? '#1e293b' : '#ffffff';
    const tooltipBorder = isDark ? '#334155' : '#E2E8F0';

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <p>No rate data available</p>
            </div>
        );
    }
    return (
        <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_PALETTE_MAIN[index % CHART_PALETTE_MAIN.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, 'Amount']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 600 }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
