/**
 * Audit Module — Type Definitions
 */

export interface AuditLogEntry {
  id: string
  tenantId: string
  userId: string
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  createdAt: Date
}
