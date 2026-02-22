import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Pagination } from '@/app/components/ui/Pagination'
import { Search } from '@/app/components/ui/Search'
import { Badge } from '@/app/components/ui/Badge'
import { ExportButton } from '@/app/components/ui/ExportButton'
import { FilterPopover } from '@/app/components/ui/FilterPopover'
import { Filter } from '@/app/components/ui/Filter'
import { ActiveFilters } from '@/app/components/ui/ActiveFilters'

/**
 * Customers List Page.
 * Displays a list of all customers with contact details.
 * Supports server-side pagination, search, and filtering.
 */
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    location?: string;
    creditTerms?: string;
    status?: string;
  }>
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const { page, q, location, creditTerms, status } = await searchParams
  const currentPage = Number(page || '1')
  const pageSize = 10
  const query = q || ''

  // Build Where Clause
  const whereClause: any = {
    AND: [],
  }

  if (query) {
    whereClause.AND.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ],
    })
  }

  if (location) {
    whereClause.AND.push({
      location: { equals: location, mode: 'insensitive' }
    })
  }

  if (creditTerms) {
    whereClause.AND.push({
      creditTerms: Number(creditTerms)
    })
  }

  // Status Filter Logic
  // Status is derived, so we filter based on invoice conditions
  if (status) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (status === 'OVERDUE') {
      // Has at least one overdue invoice
      whereClause.AND.push({
        invoices: {
          some: {
            outstandingAmount: { gt: 0 },
            dueDate: { lt: today }
          }
        }
      })
    } else if (status === 'PENDING') {
      // Has outstanding invoices
      // Note: This includes Overdue as well usually, but if we want strict "Pending but not Overdue" it's complex.
      // For now, "Pending" = Has active debt.
      whereClause.AND.push({
        invoices: {
          some: {
            outstandingAmount: { gt: 0 }
          }
        }
      })
    } else if (status === 'PAID') {
      // Has invoices, and ALL are paid
      whereClause.AND.push({
        invoices: {
          some: {}, // Must have at least one invoice (otherwise they are 'New')
          every: {
            outstandingAmount: 0
          }
        }
      })
    } else if (status === 'NEW') {
      // No invoices yet
      whereClause.AND.push({
        invoices: {
          none: {}
        }
      })
    }
  }

  // Parallel fetch: data + count + distinct options for filters
  const [customers, totalCount, locationsData, creditTermsData] = await Promise.all([
    prisma.customer.findMany({
      where: whereClause,
      include: {
        invoices: {
          select: {
            dueDate: true,
            outstandingAmount: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where: whereClause }),
    // Fetch distinct locations for filter options
    prisma.customer.findMany({
      select: { location: true },
      where: { location: { not: null } },
      distinct: ['location'],
      orderBy: { location: 'asc' }
    }),
    // Fetch distinct credit terms for filter options
    prisma.customer.findMany({
      select: { creditTerms: true },
      where: { creditTerms: { not: null } },
      distinct: ['creditTerms'],
      orderBy: { creditTerms: 'asc' }
    })
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  // Map distinct data to filter options
  const locationOptions = locationsData
    .map((c: { location: string | null }) => c.location)
    .filter((loc: string | null): loc is string => !!loc)
    .map((loc: string) => ({ label: loc, value: loc }))

  const creditTermsOptions = creditTermsData
    .map((c: { creditTerms: number | null }) => c.creditTerms)
    .filter((ct: number | null): ct is number => ct !== null)
    .map((ct: number) => ({ label: `${ct} Days`, value: ct.toString() }))

  const statusOptions = [
    { label: 'Overdue', value: 'OVERDUE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'New', value: 'NEW' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Search placeholder="Search customers..." />

          <FilterPopover filterKeys={['status', 'location', 'creditTerms']}>
            <Filter
              paramName="status"
              label="Status"
              options={statusOptions}
            />
            {locationOptions.length > 0 && (
              <Filter
                paramName="location"
                label="Location"
                options={locationOptions}
              />
            )}
            {creditTermsOptions.length > 0 && (
              <Filter
                paramName="creditTerms"
                label="Credit Terms"
                options={creditTermsOptions}
              />
            )}
          </FilterPopover>

          <ExportButton entity="customers" />
          <Link
            href="/customers/new"
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
            { key: 'location', label: 'Location' },
            { key: 'creditTerms', label: 'Credit Terms' }
          ]}
        />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Payment Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Credit Terms</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c: any) => (
              <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">
                  <Link
                    href={`/invoices?q=${encodeURIComponent(c.name)}`}
                    className="text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="p-3">
                  {(() => {
                    const invoices = c.invoices || []
                    const hasInvoices = invoices.length > 0

                    if (!hasInvoices) {
                      return <Badge variant="secondary">New</Badge>
                    }

                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    const hasOverdue = invoices.some(
                      (inv: any) => inv.outstandingAmount > 0 && new Date(inv.dueDate) < today
                    )

                    if (hasOverdue) {
                      return <Badge variant="danger">Overdue</Badge>
                    }

                    const totalOutstanding = invoices.reduce((sum: number, inv: any) => sum + inv.outstandingAmount, 0)

                    if (totalOutstanding > 0) {
                      return <Badge variant="warning">Pending</Badge>
                    }

                    return <Badge variant="success">Paid</Badge>
                  })()}
                </td>
                <td className="p-3">{c.phone || '-'}</td>
                <td className="p-3">{c.location || '-'}</td>
                <td className="p-3">{c.email || '-'}</td>
                <td className="p-3">
                  {c.creditTerms ? `${c.creditTerms} days` : '-'}
                </td>
                <td className="p-3">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td className="p-8 text-center text-muted-foreground" colSpan={7}>
                  No customers found
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
