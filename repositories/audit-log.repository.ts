import { BaseRepository } from './base.repository'
import type { Prisma } from '@prisma/client'

/**
 * AuditLog Repository — encapsulates all audit logging database operations.
 * Tracks user actions for compliance and security audit trails.
 */
export class AuditLogRepository extends BaseRepository {
  /**
   * Create a new audit log entry.
   */
  async create(data: Prisma.AuditLogCreateInput) {
    return this.db.auditLog.create({ data })
  }

  /**
   * Find audit logs with filtering and pagination.
   */
  async findMany(params: {
    where?: Prisma.AuditLogWhereInput
    orderBy?: Prisma.AuditLogOrderByWithRelationInput
    skip?: number
    take?: number
  }) {
    return this.db.auditLog.findMany({
      where: params.where,
      orderBy: params.orderBy ?? { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    })
  }

  /**
   * Count audit logs matching a filter.
   */
  async count(where?: Prisma.AuditLogWhereInput) {
    return this.db.auditLog.count({ where })
  }

  /**
   * Find audit logs for a specific entity.
   */
  async findByEntity(entity: string, entityId: string) {
    return this.db.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find audit logs for a specific tenant.
   */
  async findByTenant(tenantId: string, params?: {
    skip?: number
    take?: number
  }) {
    return this.db.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      skip: params?.skip,
      take: params?.take,
    })
  }
}

export const auditLogRepository = new AuditLogRepository()
