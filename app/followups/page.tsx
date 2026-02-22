import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'

type FollowUpWithInvoice = Prisma.FollowUpGetPayload<{
  include: {
    invoice: {
      include: { customer: true }
    }
  }
}>
import { getNextNDays } from '@/lib/utils/date'
import { getReminderMessage } from '@/lib/collections/messageTemplates'
import WhatsAppActions from '@/components/WhatsAppActions'
import { Pagination } from '@/app/components/ui/Pagination'
import { Badge } from '@/app/components/ui/Badge'
import { Search } from '@/app/components/ui/Search'
import { Filter } from '@/app/components/ui/Filter'
import { DateRangeFilter } from '@/app/components/ui/DateRangeFilter'
import { ExportButton } from '@/app/components/ui/ExportButton'
import { FilterPopover } from '@/app/components/ui/FilterPopover'
import { ActiveFilters } from '@/app/components/ui/ActiveFilters'

/**
 * Follow-ups Queue Page ("Collections").
 * Displays a prioritized list of invoices requiring attention.
 * Implements server-side pagination, search, and date filtering.
 */
export default async function FollowupsQueuePage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    status?: string
    nextFollowUpStart?: string
    nextFollowUpEnd?: string
    dueDateStart?: string
    dueDateEnd?: string
  }>
}) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const resolvedParams = await searchParams
  const { page, q, status } = resolvedParams
  const { nextFollowUpStart, nextFollowUpEnd, dueDateStart, dueDateEnd } = resolvedParams

  const currentPage = Number(page || '1')
  const pageSize = 10
  const query = q || ''
  const filterStatus = status || ''

  // --- PURE DATES ---
  const today = getNextNDays(7).now
  today.setHours(0, 0, 0, 0)
  const next7Days = getNextNDays(7).future

  // --- PAGINATED QUERY ---
  const whereClause: any = {
    AND: [
      {
        invoice: {
          outstandingAmount: { gt: 0 },
        },
      },
    ],
  }

  // --- DATE FILTERS LOGIC ---
  const hasDateFilters = nextFollowUpStart || nextFollowUpEnd || dueDateStart || dueDateEnd

  if (hasDateFilters) {
    if (nextFollowUpStart || nextFollowUpEnd) {
      // If sorting/filtering by "Follow Up Date", we check the followUpDate column itself
      // because the items in the queue ARE the follow-ups.
      const dateFilter: any = {}
      if (nextFollowUpStart) dateFilter.gte = new Date(nextFollowUpStart)
      if (nextFollowUpEnd) dateFilter.lte = new Date(nextFollowUpEnd)
      whereClause.AND.push({ followUpDate: dateFilter })
    }
    if (dueDateStart || dueDateEnd) {
      const dateFilter: any = {}
      if (dueDateStart) dateFilter.gte = new Date(dueDateStart)
      if (dueDateEnd) dateFilter.lte = new Date(dueDateEnd)
      whereClause.AND.push({ invoice: { dueDate: dateFilter } })
    }
  } else {
    // Default View: Show Overdue OR Upcoming Follow-ups (Next 7 days)
    // We check `followUpDate` for the upcoming tasks.
    whereClause.AND.push({
      OR: [
        { followUpDate: { lte: next7Days } },
        {
          invoice: {
            dueDate: { lt: today },
          },
        },
      ],
    })
  }

  // Apply Search
  if (query) {
    whereClause.AND.push({
      invoice: {
        customer: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
          ]
        }
      }
    })
  }

  // Apply Filter
  if (filterStatus) {
    whereClause.AND.push({
      status: { equals: filterStatus, mode: 'insensitive' }
    })
  }

  const [followUps, totalCount] = await Promise.all([
    prisma.followUp.findMany({
      where: whereClause,
      include: {
        invoice: {
          include: { customer: true },
        },
      },
      orderBy: [
        { followUpDate: 'asc' }, // Order by the actual scheduled date of the task
        { createdAt: 'desc' }
      ],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.followUp.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold whitespace-nowrap shrink-0">Collections Queue</h1>
          <div className="flex flex-wrap items-end gap-3 w-full md:w-auto justify-start md:justify-end">
            <Search placeholder="Search customer..." />
            <FilterPopover filterKeys={['status', 'nextFollowUpStart', 'nextFollowUpEnd', 'dueDateStart', 'dueDateEnd']}>
              <Filter
                paramName="status"
                label="Last Status"
                options={[
                  { label: 'Scheduled', value: 'SCHEDULED' },
                  { label: 'Promised', value: 'PROMISED' },
                  { label: 'No Response', value: 'NO_RESPONSE' },
                  { label: 'Disputed', value: 'DISPUTED' },
                ]}
                className="w-full"
              />
              <DateRangeFilter label="Next Follow-up" paramPrefix="nextFollowUp" />
              <DateRangeFilter label="Due Date" paramPrefix="dueDate" />
            </FilterPopover>
            <ExportButton entity="collection" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ActiveFilters
          filters={[
            { key: 'status', label: 'Last Status' },
            { key: 'nextFollowUpStart', label: 'Follow-up Start' },
            { key: 'nextFollowUpEnd', label: 'Follow-up End' },
            { key: 'dueDateStart', label: 'Due Date Start' },
            { key: 'dueDateEnd', label: 'Due Date End' },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground">Customer</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Location</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Invoice</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Outstanding</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Due Date</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Method</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Next Follow-up</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Reminder Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {followUps.map((fu: FollowUpWithInvoice) => {
              const inv = fu.invoice
              const overdue = inv.dueDate < today

              // Display Logic: 
              // If status is SCHEDULED, this row IS the next follow up.
              // If status is historical (e.g. CALL), check nextFollowUpOn.
              const displayDate = fu.status === 'SCHEDULED' ? fu.followUpDate : fu.nextFollowUpOn

              return (
                <tr key={fu.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium whitespace-nowrap">
                    {inv.customer.name}
                  </td>
                  <td className="p-3">
                    {inv.customer.location || '-'}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-primary hover:underline"
                    >
                      {inv.invoiceNo}
                    </Link>
                  </td>

                  <td className="p-3 font-medium">
                    ₹{inv.outstandingAmount.toLocaleString()}
                  </td>

                  <td className="p-3">
                    <span className={overdue ? 'text-red-500 font-medium' : ''}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </td>

                  <td className="p-3">{fu.method}</td>
                  <td className="p-3">
                    {(() => {
                      const status = fu.status
                      const variant =
                        status === 'PAID'
                          ? 'success'
                          : status === 'DISPUTED'
                            ? 'danger'
                            : status === 'NO_RESPONSE'
                              ? 'warning'
                              : 'default'

                      return <Badge variant={variant}>{status}</Badge>
                    })()}
                  </td>

                  <td className="p-3 font-medium">
                    {displayDate
                      ? new Date(displayDate).toLocaleDateString()
                      : '-'}
                  </td>
                  {/* increase the size of the action column */}

                  <td className="p-3 w-20"> {/* Adjust the width as needed */}
                    <div className="flex flex-col gap-2 items-start">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/invoices/${inv.id}/followup`}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        Follow-up
                      </Link>
                      <Link
                        href={`/invoices/${inv.id}/payment`}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        Payment
                      </Link>
                    </div>
                  </td>
                  <td className="p-3">
                    {(() => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(inv.dueDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )

                      const message = getReminderMessage({
                        customerName: inv.customer.name,
                        invoiceNo: inv.invoiceNo,
                        amount: inv.outstandingAmount,
                        dueDate: new Date(inv.dueDate),
                        daysOverdue,
                      })

                      return (
                        <div className="space-y-2 min-w-[250px]">
                          <textarea
                            readOnly
                            value={message}
                            className="w-full text-xs p-2 rounded border bg-muted/50 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
                          />
                          <WhatsAppActions message={message} />
                        </div>
                      )
                    })()}
                  </td>

                </tr>
              )
            })}

            {followUps.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-muted-foreground">
                  🎉 No pending collections — you’re all clear!
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
