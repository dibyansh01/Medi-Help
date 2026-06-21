/**
 * Tenant Module — Type Definitions
 */

export interface Tenant {
  id: string
  name: string
  slug: string
  settings: TenantSettings | null
  plan: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TenantSettings {
  clinicName?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  timezone?: string
  currency?: string
  patientNumberPrefix?: string
}

export interface CreateTenantInput {
  name: string
  slug?: string // auto-generated if not provided
  plan?: string
  settings?: TenantSettings
}
