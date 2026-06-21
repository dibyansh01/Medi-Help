import { auditLogRepository } from '@/repositories'

/**
 * Audit Service — tracks user actions for compliance and security.
 * Every significant mutation should be logged via this service.
 */

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT'

export type AuditEntity =
  | 'Patient'
  | 'Visit'
  | 'FollowUp'
  | 'User'
  | 'Tenant'
  | 'Settings'

/**
 * Log an audit event.
 * Fire-and-forget — audit logging should never block the main flow.
 */
export async function logAuditEvent(params: {
  tenantId: string
  userId: string
  action: AuditAction
  entity: AuditEntity
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}): Promise<void> {
  try {
    await auditLogRepository.create({
      tenantId: params.tenantId,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata as any,
      ipAddress: params.ipAddress,
    })
  } catch (error) {
    // Audit logging should never throw — log and continue
    console.error('AUDIT_LOG_ERROR:', error)
  }
}

/**
 * Get audit logs for a specific entity.
 */
export async function getAuditLogsForEntity(entity: string, entityId: string) {
  return auditLogRepository.findByEntity(entity, entityId)
}

/**
 * Get audit logs for a tenant with pagination.
 */
export async function getAuditLogs(tenantId: string, params?: {
  skip?: number
  take?: number
}) {
  return auditLogRepository.findByTenant(tenantId, params)
}
