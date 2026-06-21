/**
 * Patient Module — Validation Functions
 */

export function validatePatientInput(data: {
  name?: string
  phone?: string
}): string | null {
  if (!data.name || !data.name.trim()) return 'Name is required'
  if (!data.phone || !data.phone.trim()) return 'Phone is required'
  return null
}

export function validatePhone(phone: string): boolean {
  // Indian phone: 10 digits, optionally prefixed with +91 or 91
  return /^(\+?91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))
}
