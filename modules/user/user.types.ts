/**
 * User Module — Type Definitions
 */

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  tenantId?: string
  createdAt: Date
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: string
  tenantId?: string
}
