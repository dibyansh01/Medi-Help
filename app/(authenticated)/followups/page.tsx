import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { Search } from '@/components/ui/Search'
import { getFollowUpMessage } from '@/lib/collections/messageTemplates'
import WhatsAppActions from '@/components/followups/WhatsAppActions'
import { FollowUpActions } from './FollowUpActions'

/**
 * Follow-ups Page — Appointment Management.
 * Shows Today's, Upcoming, Missed, and Completed follow-ups.
 * Includes WhatsApp reminder integration for patient communication.
 */
export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    tab?: string
  }>
}) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const resolvedParams = await searchParams
  const currentPage = Number(resolvedParams.page || '1')
  const pageSize = 15
  const query = resolvedParams.q || ''
  const tab = resolvedParams.tab || 'upcoming'

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const next7Days = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Build where clause based on tab
  const whereClause: Record<string, unknown> = {}
  const andConditions: Record<string, unknown>[] = []

  switch (tab) {
    case 'today':
      andConditions.push({
        followUpDate: { gte: startOfDay, lt: endOfDay },
        status: { notIn: ['VISITED'] },
      })
      break
    case 'upcoming':
      andConditions.push({
        followUpDate: { gte: startOfDay },
        status: { in: ['CONFIRMED', 'RESCHEDULED'] },
      })
      break
    case 'missed':
      andConditions.push({
        followUpDate: { lt: startOfDay },
        status: { notIn: ['VISITED', 'RESCHEDULED'] },
      })
      break
    case 'completed':
      andConditions.push({ status: 'VISITED' })
      break
  }

  // Apply search
  if (query) {
    andConditions.push({
      patient: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { patientNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
    })
  }

  if (andConditions.length > 0) {
    whereClause.AND = andConditions
  }

  const [followUps, totalCount] = await Promise.all([
    prisma.followUp.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, phone: true, patientNumber: true },
        },
        visit: {
          select: { id: true, diagnosis: true, visitDate: true },
        },
      },
      orderBy: [{ followUpDate: 'asc' }, { createdAt: 'desc' }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.followUp.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  // Tab counts for badges
  const [todayCount, upcomingCount, missedCount, completedCount] = await Promise.all([
    prisma.followUp.count({
      where: { followUpDate: { gte: startOfDay, lt: endOfDay }, status: { notIn: ['VISITED'] } },
    }),
    prisma.followUp.count({
      where: { followUpDate: { gte: startOfDay }, status: { in: ['CONFIRMED', 'RESCHEDULED'] } },
    }),
    prisma.followUp.count({
      where: { followUpDate: { lt: startOfDay }, status: { notIn: ['VISITED', 'RESCHEDULED'] } },
    }),
    prisma.followUp.count({ where: { status: 'VISITED' } }),
  ])

  const tabs = [
    { key: 'today', label: 'Today', count: todayCount },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'missed', label: 'Missed', count: missedCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Follow-ups & Appointments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage patient appointments and reminders
            </p>
          </div>
          <Search placeholder="Search patient..." />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/followups?tab=${t.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${tab === t.key
                  ? 'bg-white/20'
                  : t.key === 'missed'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-primary/10 text-primary'
                  }`}>
                  {t.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground">Patient</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Phone</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Follow-up Date</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Method</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Reminder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {followUps.map((fu) => {
              const isMissed = new Date(fu.followUpDate) < startOfDay && fu.status !== 'VISITED'
              const message = getFollowUpMessage({
                patientName: fu.patient.name,
                followUpDate: new Date(fu.followUpDate),
                isMissed,
              })

              const statusVariant = (() => {
                switch (fu.status) {
                  case 'VISITED': return 'success' as const
                  case 'MISSED': return 'danger' as const
                  case 'NO_RESPONSE': return 'warning' as const
                  case 'RESCHEDULED': return 'secondary' as const
                  default: return 'default' as const
                }
              })()

              return (
                <tr key={fu.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <Link
                      href={`/patients/${fu.patient.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {fu.patient.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{fu.patient.patientNumber}</p>
                  </td>
                  <td className="p-3">{fu.patient.phone}</td>
                  <td className="p-3">
                    <span className={isMissed ? 'text-red-500 font-medium' : ''}>
                      {new Date(fu.followUpDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="p-3">{fu.method}</td>
                  <td className="p-3">
                    <Badge variant={statusVariant}>{fu.status}</Badge>
                  </td>
                  <td className="p-3">
                    <FollowUpActions followUpId={fu.id} currentStatus={fu.status} />
                  </td>
                  <td className="p-3">
                    <div className="space-y-2 min-w-[220px]">
                      <textarea
                        readOnly
                        value={message}
                        className="w-full text-xs p-2 rounded border bg-muted/50 text-muted-foreground focus:outline-none h-20 resize-none"
                      />
                      <WhatsAppActions message={message} phone={fu.patient.phone} />
                    </div>
                  </td>
                </tr>
              )
            })}

            {followUps.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">
                      {tab === 'completed' ? '✅' : tab === 'missed' ? '😌' : '📅'}
                    </span>
                    <p className="font-medium">
                      {tab === 'completed'
                        ? 'No completed follow-ups yet'
                        : tab === 'missed'
                          ? 'No missed follow-ups — great job!'
                          : 'No follow-ups scheduled'}
                    </p>
                  </div>
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
