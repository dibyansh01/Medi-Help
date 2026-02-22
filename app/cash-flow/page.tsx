import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Card } from '../components/ui/Card'
import { DashboardFilter } from '../components/ui/DashboardFilter'
import { getDashboardData } from '@/lib/services/dashboardService'

export default async function CashFlowPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string; preset?: string }>
}) {
    const session = await getServerSession()

    if (!session) {
        redirect('/login')
    }

    const resolvedSearchParams = await searchParams

    // Resolve Date Range or use Default
    let range = undefined;
    if (resolvedSearchParams.from && resolvedSearchParams.to) {
        range = {
            from: new Date(resolvedSearchParams.from),
            to: new Date(resolvedSearchParams.to)
        }
    }

    const data = await getDashboardData(range)

    // Determine period label
    const presetLabelMap: Record<string, string> = {
        next_30: 'Next 30 Days',
        next_7: 'Next 7 Days',
        this_month: 'This Month',
        last_month: 'Last Month',
        last_3_months: 'Last 3 Months',
        custom: 'Custom Range'
    }
    const periodLabel = presetLabelMap[resolvedSearchParams.preset || 'next_30'] || 'Selected Period'

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-200">
                        Cash Flow Analysis
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Detailed breakdown of your inflows and outflows
                    </p>
                </div>
            </div>

            <Card className="">
                <div className="p-4 border-b border-border bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold">Analysis Overview</h3>
                        <p className="text-sm text-muted-foreground">{periodLabel}</p>
                    </div>
                    <DashboardFilter />
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* VISUAL / SUMMARY */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900">
                                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase mb-1">Total Inflow</p>
                                <p className="text-2xl font-bold">₹{data.cashFlow.totalInflows.toLocaleString()}</p>
                                <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                                    <span>Actual: {data.cashFlow.pastInflows.toLocaleString()}</span>
                                    <span>•</span>
                                    <span>Projected: {data.cashFlow.futureInflows.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900">
                                <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-1">Total Outflow</p>
                                <p className="text-2xl font-bold">₹{data.cashFlow.totalOutflows.toLocaleString()}</p>
                                <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                                    <span>Actual: {data.cashFlow.pastOutflows.toLocaleString()}</span>
                                    <span>•</span>
                                    <span>Projected: {data.cashFlow.futureOutflows.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Net Change</span>
                                <span className={`text-2xl font-bold ${data.cashFlow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.cashFlow.net >= 0 ? '+' : ''}₹{data.cashFlow.net.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                {/* Visual progress bar could go here, simply decorative for now */}
                            </div>
                        </div>
                    </div>

                    {/* DETAILED TABLE */}
                    <div className="lg:col-span-2">
                        <table className="w-full text-sm">
                            <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium rounded-l-md">Type</th>
                                    <th className="px-4 py-2 text-right font-medium">Actual (Past)</th>
                                    <th className="px-4 py-2 text-right font-medium">Projected (Future)</th>
                                    <th className="px-4 py-2 text-right font-medium rounded-r-md">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                <tr>
                                    <td className="px-4 py-3 font-medium text-green-600">Inflows (Collections)</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">₹{data.cashFlow.pastInflows.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">₹{data.cashFlow.futureInflows.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-bold">₹{data.cashFlow.totalInflows.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-red-600">Outflows (Exps + Payables)</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">₹{data.cashFlow.pastOutflows.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">₹{data.cashFlow.futureOutflows.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-bold">₹{data.cashFlow.totalOutflows.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-secondary/10">
                                    <td className="px-4 py-3 font-bold">Net Flow</td>
                                    <td className="px-4 py-3 text-right font-medium">₹{(data.cashFlow.pastInflows - data.cashFlow.pastOutflows).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right font-medium">₹{(data.cashFlow.futureInflows - data.cashFlow.futureOutflows).toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${data.cashFlow.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {data.cashFlow.net >= 0 ? '+' : ''}₹{data.cashFlow.net.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    )
}
