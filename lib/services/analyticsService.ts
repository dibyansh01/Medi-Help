import { prisma } from '@/lib/db/prisma'

/**
 * Analytics Service for DPMS.
 * Provides data for the dedicated analytics page.
 */

/**
 * Patient growth: monthly new patient registrations for the last 12 months.
 */
export async function getPatientGrowth() {
    const months: { month: string; count: number }[] = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

        const count = await prisma.patient.count({
            where: { createdAt: { gte: start, lt: end } },
        })

        months.push({
            month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            count,
        })
    }

    return months
}

/**
 * Disease category distribution: patient count per patient type.
 */
export async function getDiseaseDistribution() {
    const types = await prisma.patientType.findMany({
        select: {
            name: true,
            _count: { select: { patients: true } },
        },
        orderBy: { patients: { _count: 'desc' } },
    })

    // Add uncategorized patients
    const uncategorized = await prisma.patient.count({
        where: { patientTypeId: null },
    })

    const result = types.map((t) => ({
        name: t.name,
        value: t._count.patients,
    }))

    if (uncategorized > 0) {
        result.push({ name: 'Uncategorized', value: uncategorized })
    }

    return result
}

/**
 * Visit frequency distribution: how many patients have 1, 2, 3, 4, 5+ visits.
 */
export async function getVisitFrequencyDistribution() {
    const raw = await prisma.$queryRawUnsafe<{ visit_count: bigint; patient_count: bigint }[]>(`
    SELECT 
      CASE 
        WHEN visit_count >= 5 THEN 5
        ELSE visit_count
      END as visit_count,
      COUNT(*) as patient_count
    FROM (
      SELECT "patientId", COUNT(*) as visit_count
      FROM "Visit"
      GROUP BY "patientId"
    ) sub
    GROUP BY CASE 
      WHEN visit_count >= 5 THEN 5
      ELSE visit_count
    END
    ORDER BY visit_count
  `)

    return raw.map((r) => ({
        visits: Number(r.visit_count) >= 5 ? '5+' : String(Number(r.visit_count)),
        count: Number(r.patient_count),
    }))
}

/**
 * Follow-up compliance rate: percentage of follow-ups that resulted in a visit.
 */
export async function getFollowUpCompliance() {
    const [total, visited] = await Promise.all([
        prisma.followUp.count(),
        prisma.followUp.count({ where: { status: 'VISITED' } }),
    ])

    const complianceRate = total > 0 ? Math.round((visited / total) * 100) : 0

    return {
        total,
        visited,
        missed: total - visited,
        complianceRate,
    }
}

/**
 * Revenue trend: monthly revenue for the last 12 months.
 */
export async function getRevenueTrend() {
    const months: { month: string; revenue: number }[] = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
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

/**
 * Revenue by patient type breakdown.
 */
export async function getRevenueByPatientType() {
    const types = await prisma.patientType.findMany({
        select: { id: true, name: true },
    })

    const result: { name: string; revenue: number }[] = []

    for (const type of types) {
        const aggregate = await prisma.visit.aggregate({
            where: {
                patient: { patientTypeId: type.id },
                fee: { not: null },
            },
            _sum: { fee: true },
        })
        result.push({ name: type.name, revenue: aggregate._sum.fee || 0 })
    }

    // Uncategorized
    const uncategorized = await prisma.visit.aggregate({
        where: {
            patient: { patientTypeId: null },
            fee: { not: null },
        },
        _sum: { fee: true },
    })
    if (uncategorized._sum.fee) {
        result.push({ name: 'General', revenue: uncategorized._sum.fee || 0 })
    }

    return result.filter((r) => r.revenue > 0)
}
