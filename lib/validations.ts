/**
 * Shared Validation Utilities
 * Used across all module validations for common checks.
 */

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    throw new Error(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
  // Indian phone numbers: 10 digits, optionally prefixed with +91 or 91
  return /^(\+?91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''))
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`)
  }
}

export function validateUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function sanitizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  return value.trim()
}

export function sanitizeStringOrNull(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null
  return value.trim()
}
