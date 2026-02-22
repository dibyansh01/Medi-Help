import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Badge } from '@/app/components/ui/Badge'

export default async function PayablesQueuePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Fetch overdue invoices
  const overdueInvoices = await prisma.vendorInvoice.findMany({
    where: {
      outstandingAmount: { gt: 0 },
      dueDate: { lt: today },
    },
    include: { vendor: true },
    orderBy: { dueDate: 'asc' },
  })

  // Fetch upcoming invoices (next 7 days)
  const next7Days = new Date(today)
  next7Days.setDate(today.getDate() + 7)

  const upcomingInvoices = await prisma.vendorInvoice.findMany({
    where: {
      outstandingAmount: { gt: 0 },
      dueDate: { gte: today, lte: next7Days },
    },
    include: { vendor: true },
    orderBy: { dueDate: 'asc' },
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Payables Queue</h1>
        <p className="text-gray-500">
          Prioritize payments for overdue and upcoming bills.
        </p>
      </div>

      {/* OVERDUE SECTION */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          Overdue Payments ({overdueInvoices.length})
        </h2>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-red-50 border-b border-red-100">
              <tr>
                <th className="text-left p-3 font-medium text-red-800">Due Date</th>
                <th className="text-left p-3 font-medium text-red-800">Vendor</th>
                <th className="text-left p-3 font-medium text-red-800">Invoice #</th>
                <th className="text-left p-3 font-medium text-red-800">Outstanding</th>
                <th className="text-left p-3 font-medium text-red-800">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {overdueInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-3 font-medium text-red-600">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/vendors?q=${encodeURIComponent(inv.vendor.name)}`}
                      className="hover:underline"
                    >
                      {inv.vendor.name}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/vendor-invoices/${inv.id}`}
                      className="text-primary hover:underline"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>
                  <td className="p-3 font-semibold">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/vendor-invoices/${inv.id}/payment`}
                      className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
                    >
                      Pay Now
                    </Link>
                  </td>
                </tr>
              ))}
              {overdueInvoices.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                    No overdue payments! 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* UPCOMING SECTION */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          Due Soon (Next 7 Days)
        </h2>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Vendor</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Invoice #</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Outstanding</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {upcomingInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/vendors?q=${encodeURIComponent(inv.vendor.name)}`}
                      className="hover:underline"
                    >
                      {inv.vendor.name}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/vendor-invoices/${inv.id}`}
                      className="text-primary hover:underline"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>
                  <td className="p-3 font-medium">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/vendor-invoices/${inv.id}/payment`}
                      className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
                    >
                      Pay Now
                    </Link>
                  </td>
                </tr>
              ))}
              {upcomingInvoices.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-muted-foreground" colSpan={5}>
                    No upcoming payments in the next 7 days.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}