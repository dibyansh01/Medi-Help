/**
 * Auth Module — Type Definitions
 */

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  tenantId?: string
}

export interface AuthSession {
  user: AuthUser
  expires: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  clinicName: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}
