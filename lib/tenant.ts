/**
 * Tenant Resolution — Multi-tenancy infrastructure.
 * Resolves tenant from URL slug, validates tenant access, and provides context.
 */

import { tenantRepository } from '@/repositories'
import { DEFAULT_TENANT_SLUG } from '@/modules/tenant'

/**
 * Resolve a tenant by its URL slug.
 * Returns null if tenant not found or inactive.
 */
export async function resolveTenant(slug: string) {
  const tenant = await tenantRepository.findBySlug(slug)
  if (!tenant || !tenant.isActive) return null
  return tenant
}

/**
 * Require a valid tenant — throws if not found or inactive.
 * Use in server components and API routes.
 */
export async function requireTenant(slug: string) {
  const tenant = await resolveTenant(slug)
  if (!tenant) {
    throw new Error(`Tenant not found: ${slug}`)
  }
  return tenant
}

/**
 * Get the default tenant (used during migration period).
 */
export async function getDefaultTenant() {
  return tenantRepository.findBySlug(DEFAULT_TENANT_SLUG)
}

/**
 * Generate a tenant slug from a clinic name.
 * "Apollo Clinic" → "apollo-clinic"
 */
export async function generateTenantSlug(name: string): Promise<string> {
  return tenantRepository.generateUniqueSlug(name)
}
