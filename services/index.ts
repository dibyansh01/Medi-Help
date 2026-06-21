/**
 * Service Layer — Barrel Export
 * All business logic in the application goes through these services.
 * Services use repositories for data access and implement domain rules.
 */

// Auth
export {
  validateCredentials,
  getUserById,
  createUser,
} from './auth.service'

// Patient
export {
  createPatient,
  updatePatient,
  getPatientProfile,
  getPatientBasicInfo,
  listPatients,
  getPatientTypes,
} from './patient.service'
export type { PatientFormState } from './patient.service'

// Visit
export {
  createVisit,
  getVisitDetail,
} from './visit.service'
export type { VisitFormState } from './visit.service'

// Follow-up
export {
  rescheduleFollowUp,
  markAsVisited,
  updateFollowUpStatus,
  listFollowUps,
  getFollowUpTabCounts,
} from './followup.service'
export type { FollowUpActionState } from './followup.service'

// Billing
export { getBillingOverview } from './billing.service'

// Dashboard
export { getDashboardData } from './dashboard.service'

// Analytics
export {
  getPatientGrowth,
  getDiseaseDistribution,
  getVisitFrequencyDistribution,
  getFollowUpCompliance,
  getRevenueTrend,
  getRevenueByPatientType,
} from './analytics.service'

// Subscription
export {
  getPlanFeatures,
  canAccessFeature,
  hasReachedPatientLimit,
  hasReachedUserLimit,
} from './subscription.service'
export type { SubscriptionPlan, PlanFeatures } from './subscription.service'

// Audit
export {
  logAuditEvent,
  getAuditLogsForEntity,
  getAuditLogs,
} from './audit.service'
export type { AuditAction, AuditEntity } from './audit.service'
