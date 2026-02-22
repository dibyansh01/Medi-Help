import { prisma } from '@/lib/db/prisma'

/**
 * Dashboard Intelligence Service for DPMS.
 * Returns all KPIs and chart data for the clinic dashboard.
 * Optimized with Prisma aggregations — no N+1 queries.
 */
export async function getDashboardData() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const next7Days = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Run all dashboard queries in parallel for performance
    const [
        totalPatients,
        newPatientsThisMonth,
        todaysFollowUps,
        upcomingFollowUps,
        missedFollowUps,
        monthlyRevenue,
        patientTypeDistribution,
        visitTrend,
        revenueTrend,
        patientsWithMultipleVisits,
        recentVisits,
        todaysVisits,
    ] = await Promise.all([
        // 1. Total patients
        prisma.patient.count(),

        // 2. New patients this month
        prisma.patient.count({
            where: { createdAt: { gte: startOfMonth } },
        }),

        // 3. Today's appointments (follow-ups scheduled for today)
        prisma.followUp.count({
            where: {
                followUpDate: { gte: startOfDay, lt: endOfDay },
                status: { not: 'VISITED' },
            },
        }),

        // 4. Upcoming follow-ups (next 7 days)
        prisma.followUp.count({
            where: {
                followUpDate: { gte: startOfDay, lt: next7Days },
                status: { in: ['CONFIRMED', 'RESCHEDULED'] },
            },
        }),

        // 5. Missed follow-ups (past date, not visited)
        prisma.followUp.count({
            where: {
                followUpDate: { lt: startOfDay },
                status: { notIn: ['VISITED', 'RESCHEDULED'] },
            },
        }),

        // 6. Monthly revenue (sum of visit fees this month)
        prisma.visit.aggregate({
            where: {
                visitDate: { gte: startOfMonth },
                fee: { not: null },
            },
            _sum: { fee: true },
        }),

        // 7. Patient type distribution
        prisma.patientType.findMany({
            select: {
                name: true,
                _count: { select: { patients: true } },
            },
            orderBy: { patients: { _count: 'desc' } },
        }),

        // 8. Visit trend — monthly counts for last 6 months
        getVisitTrend(),

        // 9. Revenue trend — monthly sums for last 6 months
        getRevenueTrend(),

        // 10. Repeat patients (with > 1 visit)
        prisma.patient.count({
            where: {
                visits: { some: {} },
            },
        }),

        // 11. Recent visits for quick view
        prisma.visit.findMany({
            take: 5,
            orderBy: { visitDate: 'desc' },
            include: {
                patient: { select: { name: true, patientNumber: true } },
            },
        }),

        // 12. Today's visits count
        prisma.visit.count({
            where: {
                visitDate: { gte: startOfDay, lt: endOfDay },
            },
        }),
    ])

    // Calculate repeat patient percentage
    const totalPatientsWithVisits = patientsWithMultipleVisits
    const repeatPatients = totalPatients > 0
        ? await prisma.patient.count({
            where: {
                visits: { some: {} },
            },
        }).then(async (withVisits) => {
            const withMultiple = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
                `SELECT COUNT(*) as count FROM (SELECT "patientId" FROM "Visit" GROUP BY "patientId" HAVING COUNT(*) > 1) sub`
            )
            return {
                withVisits,
                withMultiple: Number(withMultiple[0]?.count || 0),
            }
        })
        : { withVisits: 0, withMultiple: 0 }

    const repeatPatientPct = repeatPatients.withVisits > 0
        ? Math.round((repeatPatients.withMultiple / repeatPatients.withVisits) * 100)
        : 0

    // Determine most common patient type
    const mostCommonType = patientTypeDistribution.length > 0
        ? patientTypeDistribution[0]
        : null

    return {
        totalPatients,
        newPatientsThisMonth,
        todaysAppointments: todaysFollowUps,
        todaysVisits,
        upcomingFollowUps,
        missedFollowUps,
        monthlyRevenue: monthlyRevenue._sum.fee || 0,
        repeatPatientPct,
        mostCommonType: mostCommonType
            ? { name: mostCommonType.name, count: mostCommonType._count.patients }
            : null,
        patientTypeDistribution: patientTypeDistribution.map((pt) => ({
            name: pt.name,
            count: pt._count.patients,
        })),
        visitTrend,
        revenueTrend,
        recentVisits,
    }
}

/**
 * Get monthly visit counts for the last 6 months.
 */
async function getVisitTrend() {
    const months: { month: string; count: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

        const count = await prisma.visit.count({
            where: {
                visitDate: { gte: start, lt: end },
            },
        })

        months.push({
            month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            count,
        })
    }

    return months
}

/**
 * Get monthly revenue sums for the last 6 months.
 */
async function getRevenueTrend() {
    const months: { month: string; revenue: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

        const result = await prisma.visit.aggregate({
            where: {
                visitDate: { gte: start, lt: end },
                fee: { not: null },
            },
            _sum: { fee: true },
        })

        months.push({
            month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            revenue: result._sum.fee || 0,
        })
    }

    return months
}
