/**
 * Permissions System — Role-Based Access Control
 * Extends the existing requireRole pattern with fine-grained permissions.
 */

/**
 * Available permissions in the system.
 */
export enum Permission {
  // Patient
  PATIENT_READ = 'PATIENT_READ',
  PATIENT_CREATE = 'PATIENT_CREATE',
  PATIENT_UPDATE = 'PATIENT_UPDATE',
  PATIENT_DELETE = 'PATIENT_DELETE',

  // Visit
  VISIT_CREATE = 'VISIT_CREATE',
  VISIT_READ = 'VISIT_READ',

  // Follow-up
  FOLLOWUP_READ = 'FOLLOWUP_READ',
  FOLLOWUP_UPDATE = 'FOLLOWUP_UPDATE',

  // Billing
  BILLING_READ = 'BILLING_READ',

  // Analytics
  ANALYTICS_READ = 'ANALYTICS_READ',

  // Settings
  SETTINGS_READ = 'SETTINGS_READ',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',

  // User Management
  USER_MANAGE = 'USER_MANAGE',

  // Audit
  AUDIT_READ = 'AUDIT_READ',
}

/**
 * Role-to-permissions mapping.
 * DOCTOR: Full access
 * RECEPTIONIST: Limited clinical access
 * ADMIN: Full administrative access
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  DOCTOR: Object.values(Permission),
  ADMIN: Object.values(Permission),
  RECEPTIONIST: [
    Permission.PATIENT_READ,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE,
    Permission.VISIT_READ,
    Permission.FOLLOWUP_READ,
    Permission.FOLLOWUP_UPDATE,
    Permission.BILLING_READ,
    Permission.SETTINGS_READ,
  ],
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}


/**
 * Get all permissions for a given role.
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}
