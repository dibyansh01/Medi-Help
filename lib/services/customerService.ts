import { prisma } from '@/lib/db/prisma'

/**
 * Fetches all customers from the database, ordered by creation date (newest first).
 * @returns {Promise<Customer[]>} List of customers
 */
export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
