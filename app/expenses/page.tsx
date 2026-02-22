import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Pagination } from '@/app/components/ui/Pagination'
import { Badge } from '@/app/components/ui/Badge'
import { Search } from '@/app/components/ui/Search'
// import { getNextNDays, getDateRangeFromPreset } from '@/lib/utils/date' // Assuming these exist from invoices page
function getDateRangeFromPreset(preset: string) {
  const now = new Date()
  const today = new Date(now.setHours(0, 0, 0, 0))

  if (preset === 'this_month') {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }
  }
  if (preset === 'last_month') {
    return {
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0)
    }
  }
  return null
}

import { Filter } from '@/app/components/ui/Filter'
// import { ExportButton } from '@/app/components/ui/ExportButton' // If available
import { FilterPopover } from '@/app/components/ui/FilterPopover'
import { ActiveFilters } from '@/app/components/ui/ActiveFilters'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    expenseDateRange?: string;
    paymentMode?: string;
  }>
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const { page, q, expenseDateRange, paymentMode } = await searchParams
  const currentPage = Number(page || '1')
  const pageSize = 10
  const query = q || ''
  const filterDate = expenseDateRange || ''
  const filterMode = paymentMode || ''

  const whereClause: any = {
    AND: [],
  }

  if (query) {
    whereClause.AND.push({
      OR: [
        { category: { name: { contains: query, mode: 'insensitive' } } },
        { vendor: { name: { contains: query, mode: 'insensitive' } } },
        { notes: { contains: query, mode: 'insensitive' } },
      ],
    })
  }

  if (filterDate) {
    const range = getDateRangeFromPreset(filterDate)
    if (range) {
      whereClause.AND.push({
        expenseDate: {
          gte: range.startDate,
          lte: range.endDate
        }
      })
    }
  }

  if (filterMode) {
    whereClause.AND.push({
      paymentMode: filterMode
    })
  }

  const [expenses, totalCount] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      include: { category: true, vendor: true },
      orderBy: { expenseDate: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Search placeholder="Search category, vendor..." />
          <FilterPopover filterKeys={['expenseDateRange', 'paymentMode']}>
            <Filter
              paramName="paymentMode"
              label="Mode"
              options={[
                { label: 'Cash', value: 'CASH' },
                { label: 'Bank', value: 'BANK' },
                { label: 'UPI', value: 'UPI' },
              ]}
              className="w-full"
            />
            <Filter
              paramName="expenseDateRange"
              label="Date"
              options={[
                { label: 'This Month', value: 'this_month' },
                { label: 'Last Month', value: 'last_month' },
              ]}
              className="w-full"
            />
          </FilterPopover>
          <Link
            href="/expenses/new"
            className="flex-shrink-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <ActiveFilters
          filters={[
            { key: 'paymentMode', label: 'Mode' },
            { key: 'expenseDateRange', label: 'Date' },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Vendor</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Notes</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Mode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.map((e: any) => (
              <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-3">
                  {new Date(e.expenseDate).toLocaleDateString()}
                </td>
                <td className="p-3 font-medium">{e.category.name}</td>
                <td className="p-3">
                  {e.vendor ? (
                    <Link href={`/vendors?q=${encodeURIComponent(e.vendor.name)}`} className="text-primary hover:underline">
                      {e.vendor.name}
                    </Link>
                  ) : '-'}
                </td>
                <td className="p-3 text-muted-foreground truncate max-w-[200px]">{e.notes || '-'}</td>
                <td className="p-3 font-medium">₹{e.amount.toLocaleString()}</td>
                <td className="p-3">
                  <Badge variant="secondary">{e.paymentMode}</Badge>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td className="p-8 text-center text-muted-foreground" colSpan={6}>
                  No expenses found
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