import { BaseRepository } from './base.repository'
import type { Prisma } from '@prisma/client'

/**
 * FollowUp Repository — encapsulates all FollowUp-related database operations.
 * Covers follow-up creation, status updates, filtering by tab/status, and counting.
 */
export class FollowUpRepository extends BaseRepository {
  /**
   * Create a new follow-up record.
   */
  async create(data: Prisma.FollowUpCreateInput) {
    return this.db.followUp.create({ data })
  }

  /**
   * Update a follow-up record by ID.
   */
  async update(id: string, data: Prisma.FollowUpUpdateInput) {
    return this.db.followUp.update({
      where: { id },
      data,
    })
  }

  /**
   * Find many follow-ups with patient and visit info.
   */
  async findMany(params: {
    where?: Prisma.FollowUpWhereInput
    orderBy?: Prisma.FollowUpOrderByWithRelationInput | Prisma.FollowUpOrderByWithRelationInput[]
    skip?: number
    take?: number
  }) {
    return this.db.followUp.findMany({
      where: params.where,
      include: {
        patient: {
          select: { id: true, name: true, phone: true, patientNumber: true },
        },
        visit: {
          select: { id: true, diagnosis: true, visitDate: true },
        },
      },
      orderBy: params.orderBy ?? [{ followUpDate: 'asc' }, { createdAt: 'desc' }],
      skip: params.skip,
      take: params.take,
    })
  }

  /**
   * Count follow-ups matching a filter.
   */
  async count(where?: Prisma.FollowUpWhereInput) {
    return this.db.followUp.count({ where })
  }

  /**
   * Get tab counts for the follow-ups page (today, upcoming, missed, completed).
   */
  async getTabCounts() {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const [todayCount, upcomingCount, missedCount, completedCount] = await Promise.all([
      this.db.followUp.count({
        where: { followUpDate: { gte: startOfDay, lt: endOfDay }, status: { notIn: ['VISITED'] } },
      }),
      this.db.followUp.count({
        where: { followUpDate: { gte: startOfDay }, status: { in: ['CONFIRMED', 'RESCHEDULED'] } },
      }),
      this.db.followUp.count({
        where: { followUpDate: { lt: startOfDay }, status: { notIn: ['VISITED', 'RESCHEDULED'] } },
      }),
      this.db.followUp.count({ where: { status: 'VISITED' } }),
    ])

    return { todayCount, upcomingCount, missedCount, completedCount }
  }

  /**
   * Get follow-up compliance stats (total vs visited).
   */
  async getComplianceStats() {
    const [total, visited] = await Promise.all([
      this.db.followUp.count(),
      this.db.followUp.count({ where: { status: 'VISITED' } }),
    ])

    return {
      total,
      visited,
      missed: total - visited,
      complianceRate: total > 0 ? Math.round((visited / total) * 100) : 0,
    }
  }
}

export const followUpRepository = new FollowUpRepository()
