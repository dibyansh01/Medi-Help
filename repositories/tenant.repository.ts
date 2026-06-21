import { BaseRepository } from './base.repository'
import type { Prisma } from '@prisma/client'

/**
 * Tenant Repository — encapsulates all Tenant-related database operations.
 * Foundation for multi-tenancy support. Tenant.slug is the canonical identifier
 * used in URL routing (/[tenant]/dashboard).
 */
export class TenantRepository extends BaseRepository {
  /**
   * Find a tenant by its unique slug.
   * Slugs are auto-generated from clinic names during signup.
   */
  async findBySlug(slug: string) {
    return this.db.tenant.findUnique({
      where: { slug },
    })
  }

  /**
   * Find a tenant by ID.
   */
  async findById(id: string) {
    return this.db.tenant.findUnique({
      where: { id },
    })
  }

  /**
   * Create a new tenant.
   */
  async create(data: Prisma.TenantCreateInput) {
    return this.db.tenant.create({ data })
  }

  /**
   * Update tenant settings or plan.
   */
  async update(id: string, data: Prisma.TenantUpdateInput) {
    return this.db.tenant.update({
      where: { id },
      data,
    })
  }

  /**
   * Find all tenants (admin use).
   */
  async findMany(params?: {
    where?: Prisma.TenantWhereInput
    orderBy?: Prisma.TenantOrderByWithRelationInput
  }) {
    return this.db.tenant.findMany({
      where: params?.where,
      orderBy: params?.orderBy ?? { createdAt: 'desc' },
    })
  }

  /**
   * Check if a slug is already taken.
   */
  async isSlugTaken(slug: string): Promise<boolean> {
    const count = await this.db.tenant.count({ where: { slug } })
    return count > 0
  }

  /**
   * Generate a unique slug from a clinic name.
   * Converts "Apollo Clinic" → "apollo-clinic", appends suffix if taken.
   */
  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1

    while (await this.isSlugTaken(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }
}

export const tenantRepository = new TenantRepository()
