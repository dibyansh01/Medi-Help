/**
 * Audit Module — Constants
 */

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'VIEW',
  'EXPORT',
] as const

export const AUDIT_ENTITIES = [
  'Patient',
  'Visit',
  'FollowUp',
  'User',
  'Tenant',
  'Settings',
] as const
