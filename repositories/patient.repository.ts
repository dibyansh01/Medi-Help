import { BaseRepository } from './base.repository'
import type { Prisma } from '@prisma/client'

/**
 * Patient Repository — encapsulates all Patient-related database operations.
 * Single source of truth for patient data access.
 */
export class PatientRepository extends BaseRepository {
  /**
   * Find a patient by ID with basic fields only (for API lookups).
   */
  async findByIdBasic(id: string) {
    return this.db.patient.findUnique({
      where: { id },
      select: { id: true, name: true, phone: true, patientNumber: true },
    })
  }

  /**
   * Find a patient by ID with full details including type, visits, and follow-ups.
   */
  async findByIdWithDetails(id: string) {
    return this.db.patient.findUnique({
      where: { id },
      include: {
        patientType: true,
        visits: {
          orderBy: { visitDate: 'desc' },
          include: {
            followUps: true,
          },
        },
        followUps: {
          orderBy: { followUpDate: 'desc' },
          take: 5,
        },
      },
    })
  }

  /**
   * Find many patients with filtering, pagination, and type/visit counts.
   */
  async findMany(params: {
    where?: Prisma.PatientWhereInput
    orderBy?: Prisma.PatientOrderByWithRelationInput
    skip?: number
    take?: number
  }) {
    return this.db.patient.findMany({
      where: params.where,
      include: {
        patientType: true,
        _count: { select: { visits: true } },
      },
      orderBy: params.orderBy ?? { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    })
  }

  /**
   * Count patients matching a filter.
   */
  async count(where?: Prisma.PatientWhereInput) {
    return this.db.patient.count({ where })
  }

  /**
   * Create a new patient record.
   */
  async create(data: Prisma.PatientCreateInput) {
    return this.db.patient.create({ data })
  }

  /**
   * Update an existing patient record.
   */
  async update(id: string, data: Prisma.PatientUpdateInput) {
    return this.db.patient.update({
      where: { id },
      data,
    })
  }

  /**
   * Get the next sequential patient number (CLINIC-XXXXX).
   */
  async getNextPatientNumber(): Promise<string> {
    const count = await this.db.patient.count()
    const nextNum = count + 1
    return `CLINIC-${String(nextNum).padStart(5, '0')}`
  }

  /**
   * Count patients that have at least one visit.
   */
  async countWithVisits() {
    return this.db.patient.count({
      where: { visits: { some: {} } },
    })
  }

  /**
   * Count patients with more than one visit (repeat patients) using raw query.
   */
  async countRepeatPatients(): Promise<number> {
    const result = await this.db.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM (SELECT "patientId" FROM "Visit" GROUP BY "patientId" HAVING COUNT(*) > 1) sub`
    )
    return Number(result[0]?.count || 0)
  }
}

export const patientRepository = new PatientRepository()
