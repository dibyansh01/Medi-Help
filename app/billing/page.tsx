import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { StatCard } from '@/app/components/ui/StatCard'
import { BillingCharts } from './BillingCharts'

/**
 * Billing Module — Revenue tracking and payment overview.
 * No GST logic — simple fee-based billing.
 */
export default async function BillingPage() {
    const session = await getServerSession()
    if (!session) redirect('/login')

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallel queries for billing data
    const [
        todayRevenue,
        monthlyRevenue,
        totalRevenue,
        todayVisitsWithFee,
        paymentModeBreakdown,
        monthlyRevenueTrend,
        revenueByType,
    ] = await Promise.all([
        // Today's revenue
        prisma.visit.aggregate({
            where: { visitDate: { gte: startOfDay, lt: endOfDay }, fee: { not: null } },
            _sum: { fee: true },
            _count: true,
        }),

        // Monthly revenue
        prisma.visit.aggregate({
            where: { visitDate: { gte: startOfMonth }, fee: { not: null } },
            _sum: { fee: true },
            _count: true,
        }),

        // Total revenue
        prisma.visit.aggregate({
            where: { fee: { not: null } },
            _sum: { fee: true },
            _count: true,
        }),

        // Today's visits with fees detailed
        prisma.visit.findMany({
            where: { visitDate: { gte: startOfDay, lt: endOfDay }, fee: { not: null } },
            include: { patient: { select: { name: true, patientNumber: true } } },
            orderBy: { visitDate: 'desc' },
        }),

        // Payment mode breakdown this month
        getPaymentModeBreakdown(startOfMonth),

        // Monthly revenue trend (last 6 months)
        getMonthlyRevenueTrend(),

        // Revenue by patient type
        getRevenueByPatientType(),
    ])

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
                    value={`₹${(todayRevenue._sum.fee || 0).toLocaleString()}`}
                    subtitle={`${todayRevenue._count} visits`}
                    icon="💰"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${(monthlyRevenue._sum.fee || 0).toLocaleString()}`}
                    subtitle={`${monthlyRevenue._count} visits`}
                    icon="📊"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${(totalRevenue._sum.fee || 0).toLocaleString()}`}
                    subtitle={`${totalRevenue._count} visits`}
                    icon="🏦"
                />
                <StatCard
                    title="Avg Fee/Visit"
                    value={`₹${totalRevenue._count > 0 ? Math.round((totalRevenue._sum.fee || 0) / totalRevenue._count) : 0}`}
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

async function getPaymentModeBreakdown(sinceDate: Date) {
    const visits = await prisma.visit.findMany({
        where: { visitDate: { gte: sinceDate }, fee: { not: null }, paymentMode: { not: null } },
        select: { paymentMode: true, fee: true },
    })

    const breakdown: Record<string, { count: number; total: number }> = {}
    for (const v of visits) {
        const mode = v.paymentMode || 'OTHER'
        if (!breakdown[mode]) breakdown[mode] = { count: 0, total: 0 }
        breakdown[mode].count++
        breakdown[mode].total += v.fee || 0
    }

    return Object.entries(breakdown).map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total,
    }))
}

async function getMonthlyRevenueTrend() {
    const months: { month: string; revenue: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

        const result = await prisma.visit.aggregate({
            where: { visitDate: { gte: start, lt: end }, fee: { not: null } },
            _sum: { fee: true },
        })

        months.push({
            month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            revenue: result._sum.fee || 0,
        })
    }

    return months
}

async function getRevenueByPatientType() {
    const types = await prisma.patientType.findMany({
        select: { id: true, name: true },
    })

    const result: { name: string; revenue: number }[] = []

    for (const type of types) {
        const agg = await prisma.visit.aggregate({
            where: { patient: { patientTypeId: type.id }, fee: { not: null } },
            _sum: { fee: true },
        })
        if (agg._sum.fee) {
            result.push({ name: type.name, revenue: agg._sum.fee || 0 })
        }
    }

    const uncategorized = await prisma.visit.aggregate({
        where: { patient: { patientTypeId: null }, fee: { not: null } },
        _sum: { fee: true },
    })
    if (uncategorized._sum.fee) {
        result.push({ name: 'General', revenue: uncategorized._sum.fee || 0 })
    }

    return result
}
