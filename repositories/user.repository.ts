import { BaseRepository } from './base.repository'
import type { Prisma } from '@prisma/client'

/**
 * User Repository — encapsulates all User-related database operations.
 * Used by auth service for credential validation and user management.
 */
export class UserRepository extends BaseRepository {
  /**
   * Find a user by email address (for authentication).
   */
  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    })
  }

  /**
   * Find a user by ID.
   */
  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
    })
  }

  /**
   * Create a new user record.
   */
  async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({ data })
  }

  /**
   * Update an existing user record.
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
    })
  }

  /**
   * Find all users (for admin user management).
   */
  async findMany(params?: {
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
    skip?: number
    take?: number
  }) {
    return this.db.user.findMany({
      where: params?.where,
      orderBy: params?.orderBy ?? { createdAt: 'desc' },
      skip: params?.skip,
      take: params?.take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
  }

  /**
   * Count users matching a filter.
   */
  async count(where?: Prisma.UserWhereInput) {
    return this.db.user.count({ where })
  }
}

export const userRepository = new UserRepository()
