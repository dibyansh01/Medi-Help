import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/ui/StatCard'
import { BillingCharts } from './BillingCharts'
import { getBillingOverview } from '@/services'

/**
 * Billing Module — Revenue tracking and payment overview.
 * Now delegates all data fetching to the billing service.
 */
export default async function BillingPage() {
    const session = await getServerSession()
    if (!session) redirect('/login')

    const {
        todayRevenue,
        monthlyRevenue,
        totalRevenue,
        todayVisitsWithFee,
        paymentModeBreakdown,
        monthlyRevenueTrend,
        revenueByType,
    } = await getBillingOverview()

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Billing</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Revenue tracking and payment overview
                </p>
            </div>

            {/* Revenue KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Today's Revenue"
                    value={`₹${(todayRevenue._sum?.fee || 0).toLocaleString()}`}
                    subtitle={`${todayRevenue._count ?? 0} visits`}
                    icon="💰"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${(monthlyRevenue._sum?.fee || 0).toLocaleString()}`}
                    subtitle={`${monthlyRevenue._count ?? 0} visits`}
                    icon="📊"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(totalRevenue._sum?.fee || 0).toLocaleString()}`}
                    subtitle={`${totalRevenue._count ?? 0} visits`}
                    icon="🏦"
                />
                <StatCard
                    title="Avg Fee/Visit"
                    value={`₹${(totalRevenue._count ?? 0) > 0 ? Math.round((totalRevenue._sum?.fee || 0) / (totalRevenue._count ?? 1)) : 0}`}
                    icon="📈"
                />
            </div>

            {/* Charts */}
            <BillingCharts
                monthlyRevenueTrend={monthlyRevenueTrend}
                paymentModeBreakdown={paymentModeBreakdown}
                revenueByType={revenueByType}
            />

            {/* Today's Visits Detail */}
            <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-5 border-b">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Today&apos;s Revenue Detail
                    </h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-secondary/50 border-b">
                        <tr>
                            <th className="p-3 text-left font-medium text-muted-foreground">Patient</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Patient ID</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Time</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Fee</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Payment Mode</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {todayVisitsWithFee.map((visit) => (
                            <tr key={visit.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-3 font-medium">{visit.patient.name}</td>
                                <td className="p-3 text-muted-foreground">{visit.patient.patientNumber}</td>
                                <td className="p-3">
                                    {new Date(visit.visitDate).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="p-3 font-medium">₹{visit.fee?.toLocaleString()}</td>
                                <td className="p-3">{visit.paymentMode || '—'}</td>
                            </tr>
                        ))}
                        {todayVisitsWithFee.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No billable visits today yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
