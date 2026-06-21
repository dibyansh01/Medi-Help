/**
 * User Module — Constants
 */

import { ROLES } from '@/modules/auth'

export const USER_ROLES = ROLES

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  ADMIN: 'Administrator',
}

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  DOCTOR: 'Full access to all modules including clinical features',
  RECEPTIONIST: 'Patient management, follow-ups, limited clinical access',
  ADMIN: 'System administration, user management, settings',
}
