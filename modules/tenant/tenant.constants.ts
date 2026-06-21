/**
 * Tenant Module — Constants
 */

export const DEFAULT_TENANT_SLUG = 'default-clinic'
export const DEFAULT_TENANT_NAME = 'Default Clinic'

export const TENANT_PLANS = {
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const

export type TenantPlan = (typeof TENANT_PLANS)[keyof typeof TENANT_PLANS]

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const MAX_SLUG_LENGTH = 63
export const MIN_SLUG_LENGTH = 3
