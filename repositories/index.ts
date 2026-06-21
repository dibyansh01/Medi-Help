/**
 * Repository Layer — Barrel Export
 * All database access in the application goes through these repositories.
 * No file outside this directory should import prisma directly.
 */

export { patientRepository, PatientRepository } from './patient.repository'
export { visitRepository, VisitRepository } from './visit.repository'
export { followUpRepository, FollowUpRepository } from './followup.repository'
export { userRepository, UserRepository } from './user.repository'
export { tenantRepository, TenantRepository } from './tenant.repository'
export { patientTypeRepository, PatientTypeRepository } from './patient-type.repository'
export { auditLogRepository, AuditLogRepository } from './audit-log.repository'
