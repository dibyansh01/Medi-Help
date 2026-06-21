/**
 * Auth Module — Validation Functions
 */

export function validateLoginInput(email: string, password: string): string | null {
  if (!email || !email.trim()) return 'Email is required'
  if (!password || !password.trim()) return 'Password is required'
  if (!isValidEmail(email)) return 'Invalid email format'
  return null
}

export function validateSignupInput(data: {
  name: string
  email: string
  password: string
  clinicName: string
}): string | null {
  if (!data.name || !data.name.trim()) return 'Name is required'
  if (!data.email || !data.email.trim()) return 'Email is required'
  if (!isValidEmail(data.email)) return 'Invalid email format'
  if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters'
  if (!data.clinicName || !data.clinicName.trim()) return 'Clinic name is required'
  return null
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
