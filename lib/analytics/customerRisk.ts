import { prisma } from '@/lib/db/prisma'

export async function getCustomerRiskSummary() {
  const customers = await prisma.customer.findMany({
    include: {
      invoices: {
        include: {
          followUps: true,
        },
      },
    },
  })

  const today = new Date()

  return customers.map((customer) => {
    let totalOutstanding = 0
    let oldestDueDays = 0
    let brokenPromises = 0

    for (const inv of customer.invoices) {
      if (inv.outstandingAmount > 0) {
        totalOutstanding += inv.outstandingAmount

        const daysOverdue =
          Math.floor(
            (today.getTime() - new Date(inv.dueDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )

        if (daysOverdue > oldestDueDays) {
          oldestDueDays = daysOverdue
        }

        for (const fu of inv.followUps) {
          if (
            fu.status === 'PROMISED' &&
            fu.nextFollowUpOn &&
            new Date(fu.nextFollowUpOn) < today &&
            inv.outstandingAmount > 0
          ) {
            brokenPromises++
          }
        }
      }
    }

    // Risk rules
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'

    if (oldestDueDays > 60 || brokenPromises >= 2) {
      risk = 'HIGH'
    } else if (oldestDueDays > 0) {
      risk = 'MEDIUM'
    }

    return {
      customerId: customer.id,
      customerName: customer.name,
      totalOutstanding,
      oldestDueDays,
      brokenPromises,
      risk,
    }
  })
}
