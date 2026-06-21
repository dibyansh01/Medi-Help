import { BaseRepository } from './base.repository'
import type { Prisma } from '@prisma/client'

/**
 * Visit Repository — encapsulates all Visit-related database operations.
 * Covers visit creation, aggregation, trend queries, and payment analytics.
 */
export class VisitRepository extends BaseRepository {
  /**
   * Create a new visit record.
   */
  async create(data: Prisma.VisitCreateInput) {
    return this.db.visit.create({ data })
  }

  /**
   * Find a visit by ID with patient details.
   */
  async findByIdWithPatient(id: string) {
    return this.db.visit.findUnique({
      where: { id },
      include: {
        patient: {
          include: { patientType: true },
        },
        followUps: true,
      },
    })
  }

  /**
   * Find many visits with optional filtering.
   */
  async findMany(params: {
    where?: Prisma.VisitWhereInput
    include?: Prisma.VisitInclude
    orderBy?: Prisma.VisitOrderByWithRelationInput
    take?: number
    skip?: number
  }) {
    return this.db.visit.findMany({
      where: params.where,
      include: params.include,
      orderBy: params.orderBy ?? { visitDate: 'desc' },
      take: params.take,
      skip: params.skip,
    })
  }

  /**
   * Count visits matching a filter.
   */
  async count(where?: Prisma.VisitWhereInput) {
    return this.db.visit.count({ where })
  }

  /**
   * Aggregate visit data (sums, counts, etc.).
   */
  async aggregate(params: {
    where?: Prisma.VisitWhereInput
    _sum?: Prisma.VisitSumAggregateInputType
    _count?: true
  }) {
    return this.db.visit.aggregate({
      where: params.where,
      ...(params._sum !== undefined && { _sum: params._sum }),
      ...(params._count !== undefined && { _count: params._count }),
    })
  }

  /**
   * Get monthly visit counts for a given number of past months.
   */
  async getMonthlyVisitCounts(monthsBack: number = 6) {
    const months: { month: string; count: number }[] = []
    const now = new Date()

    for (let i = monthsBack - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const count = await this.db.visit.count({
        where: { visitDate: { gte: start, lt: end } },
      })

      months.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count,
      })
    }

    return months
  }

  /**
   * Get monthly revenue sums for a given number of past months.
   */
  async getMonthlyRevenue(monthsBack: number = 6) {
    const months: { month: string; revenue: number }[] = []
    const now = new Date()

    for (let i = monthsBack - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const result = await this.db.visit.aggregate({
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
   * Get revenue breakdown by payment mode since a given date.
   */
  async getRevenueByPaymentMode(sinceDate: Date) {
    const visits = await this.db.visit.findMany({
      where: {
        visitDate: { gte: sinceDate },
        fee: { not: null },
        paymentMode: { not: null },
      },
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

  /**
   * Get visit frequency distribution (how many patients have 1, 2, 3, 4, 5+ visits).
   */
  async getVisitFrequencyDistribution() {
    const raw = await this.db.$queryRawUnsafe<{ visit_count: bigint; patient_count: bigint }[]>(`
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
   * Get revenue by patient type (including uncategorized).
   */
  async getRevenueByPatientType() {
    const types = await this.db.patientType.findMany({
      select: { id: true, name: true },
    })

    const result: { name: string; revenue: number }[] = []

    for (const type of types) {
      const aggregate = await this.db.visit.aggregate({
        where: {
          patient: { patientTypeId: type.id },
          fee: { not: null },
        },
        _sum: { fee: true },
      })
      if (aggregate._sum.fee) {
        result.push({ name: type.name, revenue: aggregate._sum.fee || 0 })
      }
    }

    // Uncategorized
    const uncategorized = await this.db.visit.aggregate({
      where: {
        patient: { patientTypeId: null },
        fee: { not: null },
      },
      _sum: { fee: true },
    })
    if (uncategorized._sum.fee) {
      result.push({ name: 'General', revenue: uncategorized._sum.fee || 0 })
    }

    return result
  }
}

export const visitRepository = new VisitRepository()
