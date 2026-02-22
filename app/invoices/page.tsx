import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Pagination } from '@/app/components/ui/Pagination'
import { Badge } from '@/app/components/ui/Badge'
import { Search } from '@/app/components/ui/Search'
import { getNextNDays, getDateRangeFromPreset } from '@/lib/utils/date'
// ... (other imports)
import { Filter } from '@/app/components/ui/Filter'
import { ExportButton } from '@/app/components/ui/ExportButton'
import { FilterPopover } from '@/app/components/ui/FilterPopover'
import { ActiveFilters } from '@/app/components/ui/ActiveFilters'

/**
 * Invoices List Page.
 * Displays a table of all invoices with status.
 * Supports server-side pagination, search, and filtering.
 */
export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    invoiceDateRange?: string;
    dueDateRange?: string
  }>
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const { page, q, status, invoiceDateRange, dueDateRange } = await searchParams
  const currentPage = Number(page || '1')
  const pageSize = 10
  const query = q || ''
  const filterStatus = status || ''
  const filterInvoiceDate = invoiceDateRange || ''
  const filterDueDate = dueDateRange || ''

  const whereClause: any = {
    AND: [],
  }

  // Invoice Date Filter
  if (filterInvoiceDate) {
    const range = getDateRangeFromPreset(filterInvoiceDate)
    if (range) {
      whereClause.AND.push({
        invoiceDate: {
          gte: range.startDate,
          lte: range.endDate
        }
      })
    }
  }

  // Due Date Filter
  if (filterDueDate) {
    const range = getDateRangeFromPreset(filterDueDate)
    if (range) {
      whereClause.AND.push({
        dueDate: {
          gte: range.startDate,
          lte: range.endDate
        }
      })
    }
  }

  // Define today for date comparisons (used in Status Logic)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (query) {
    whereClause.AND.push({
      OR: [
        { invoiceNo: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { location: { contains: query, mode: 'insensitive' } } },
      ],
    })
  }
  // ... (rest of logic)

  // Define today for date comparisons

  today.setHours(0, 0, 0, 0) // Normalize to start of day for consistent comparison

  if (filterStatus) {
    const statusUpper = filterStatus.toUpperCase()

    if (statusUpper === 'PAID') {
      whereClause.AND.push({
        outstandingAmount: 0 // Only fully paid
      })
    } else if (statusUpper === 'OVERDUE') {
      whereClause.AND.push({
        outstandingAmount: { gt: 0 },
        dueDate: { lt: today }
      })
    } else if (statusUpper === 'PARTIAL') {
      whereClause.AND.push({
        outstandingAmount: { gt: 0 },
        paidAmount: { gt: 0 },
        dueDate: { gte: today } // Not overdue yet
      })
    } else if (statusUpper === 'UNPAID') {
      whereClause.AND.push({
        outstandingAmount: { gt: 0 },
        paidAmount: 0,
        dueDate: { gte: today } // Not overdue yet
      })
    }
  }

  // Parallel fetch: data + count
  const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where: whereClause,
      include: { customer: true },
      orderBy: { dueDate: 'asc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)
  // const today = new Date() // Already defined above for filters

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Search placeholder="Search invoice # or customer..." />
          <FilterPopover filterKeys={['status', 'invoiceDateRange', 'dueDateRange']}>
            <Filter
              paramName="status"
              label="Status"
              options={[
                { label: 'Paid', value: 'PAID' },
                { label: 'Unpaid', value: 'UNPAID' },
                { label: 'Partial', value: 'PARTIAL' },
                { label: 'Overdue', value: 'OVERDUE' },
              ]}
              className="w-full"
            />
            <Filter
              paramName="invoiceDateRange"
              label="Inv Date"
              options={[
                { label: 'This Month', value: 'this_month' },
                { label: 'Last Month', value: 'last_month' },
                { label: 'This Year', value: 'this_year' },
              ]}
              className="w-full"
            />
            <Filter
              paramName="dueDateRange"
              label="Due Date"
              options={[
                { label: 'This Month', value: 'this_month' },
                { label: 'Next Month', value: 'next_month' },
                { label: 'This Week', value: 'this_week' },
                { label: 'Last 30 Days', value: 'last_30_days' },
              ]}
              className="w-full"
            />
          </FilterPopover>
          <ExportButton entity="invoices" />
          <Link
            href="/invoices/new"
            className="flex-shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <ActiveFilters
          filters={[
            { key: 'status', label: 'Status' },
            { key: 'invoiceDateRange', label: 'Invoice Date' },
            { key: 'dueDateRange', label: 'Due Date' },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Invoice #</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Invoice Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Base Amt</th>
              <th className="text-right p-3 font-medium text-muted-foreground">GST</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Paid</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Outstanding</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {invoices.map((inv: any) => {
              const isOverdue =
                inv.outstandingAmount > 0 && inv.dueDate < today

              let displayStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' =
                'UNPAID'

              if (inv.outstandingAmount === 0) {
                displayStatus = 'PAID'
              } else if (isOverdue) {
                displayStatus = 'OVERDUE'
              } else if (inv.paidAmount > 0) {
                displayStatus = 'PARTIAL'
              } else {
                displayStatus = 'UNPAID'
              }

              const totalAmount = inv.invoiceAmount + (inv.gstAmount || 0);

              return (
                <tr key={inv.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>
                  <td className="p-3">{inv.customer.name}</td>
                  <td className="p-3">{inv.customer.location || '-'}</td>
                  <td className="p-3">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    ₹{inv.invoiceAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">
                    {inv.gstAmount ? `₹${inv.gstAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-right font-medium">
                    ₹{totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">
                    {inv.paidAmount > 0 ? `₹${inv.paidAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-right font-medium text-red-600 dark:text-red-400">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    {displayStatus === 'OVERDUE' && (
                      <Badge variant="danger">OVERDUE</Badge>
                    )}

                    {displayStatus === 'PAID' && (
                      <Badge variant="success">PAID</Badge>
                    )}

                    {displayStatus === 'PARTIAL' && (
                      <Badge variant="warning">PARTIAL</Badge>
                    )}

                    {displayStatus === 'UNPAID' && (
                      <Badge variant="unpaid">UNPAID</Badge>
                    )}
                  </td>
                </tr>
              )
            })}

            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-8 text-center text-muted-foreground"
                >
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
