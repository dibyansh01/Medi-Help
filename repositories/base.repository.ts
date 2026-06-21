import { prisma } from '@/lib/db/prisma'
import type { PrismaClient } from '@prisma/client'

/**
 * Base Repository — provides the Prisma client instance to all repositories.
 * All database access MUST go through repository classes that extend this base.
 * No file outside repositories/ should import prisma directly.
 */
export abstract class BaseRepository {
  protected readonly db: PrismaClient

  constructor() {
    this.db = prisma
  }
}
