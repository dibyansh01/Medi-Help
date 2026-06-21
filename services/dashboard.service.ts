import {
  patientRepository,
  visitRepository,
  followUpRepository,
  patientTypeRepository,
} from '@/repositories'

/**
 * Dashboard Service — returns all KPIs and chart data for the clinic dashboard.
 * Refactored from lib/services/dashboardService.ts to use repositories.
 * Optimized with parallel queries — no N+1.
 */
export async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const next7Days = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Run all dashboard queries in parallel for performance
  const [
    totalPatients,
    newPatientsThisMonth,
    todaysFollowUps,
    upcomingFollowUps,
    missedFollowUps,
    monthlyRevenue,
    patientTypeDistribution,
    visitTrend,
    revenueTrend,
    recentVisitsRaw,
    todaysVisits,
  ] = await Promise.all([
    // 1. Total patients
    patientRepository.count(),

    // 2. New patients this month
    patientRepository.count({ createdAt: { gte: startOfMonth } }),

    // 3. Today's appointments
    followUpRepository.count({
      followUpDate: { gte: startOfDay, lt: endOfDay },
      status: { not: 'VISITED' },
    }),

    // 4. Upcoming follow-ups (next 7 days)
    followUpRepository.count({
      followUpDate: { gte: startOfDay, lt: next7Days },
      status: { in: ['CONFIRMED', 'RESCHEDULED'] },
    }),

    // 5. Missed follow-ups
    followUpRepository.count({
      followUpDate: { lt: startOfDay },
      status: { notIn: ['VISITED', 'RESCHEDULED'] },
    }),

    // 6. Monthly revenue
    visitRepository.aggregate({
      where: { visitDate: { gte: startOfMonth }, fee: { not: null } },
      _sum: { fee: true },
    }),

    // 7. Patient type distribution
    patientTypeRepository.findWithPatientCounts(),

    // 8. Visit trend (6 months)
    visitRepository.getMonthlyVisitCounts(6),

    // 9. Revenue trend (6 months)
    visitRepository.getMonthlyRevenue(6),

    // 10. Recent visits
    visitRepository.findMany({
      take: 5,
      orderBy: { visitDate: 'desc' },
      include: {
        patient: { select: { name: true, patientNumber: true } },
      },
    }),

    // 11. Today's visits count
    visitRepository.count({
      visitDate: { gte: startOfDay, lt: endOfDay },
    }),
  ])

  const recentVisits = recentVisitsRaw as unknown as Array<{
    id: string
    visitDate: Date
    fee: number | null
    diagnosis: string | null
    patient: {
      name: string
      patientNumber: string
    }
  }>

  // Calculate repeat patient percentage
  const totalPatientsNum = totalPatients
  let repeatPatientPct = 0
  if (totalPatientsNum > 0) {
    const withVisits = await patientRepository.countWithVisits()
    const withMultiple = await patientRepository.countRepeatPatients()
    repeatPatientPct = withVisits > 0
      ? Math.round((withMultiple / withVisits) * 100)
      : 0
  }

  // Determine most common patient type
  const mostCommonType = patientTypeDistribution.length > 0
    ? patientTypeDistribution[0]
    : null

  return {
    totalPatients,
    newPatientsThisMonth,
    todaysAppointments: todaysFollowUps,
    todaysVisits,
    upcomingFollowUps,
    missedFollowUps,
    monthlyRevenue: monthlyRevenue._sum?.fee || 0,
    repeatPatientPct,
    mostCommonType: mostCommonType
      ? { name: mostCommonType.name, count: mostCommonType._count.patients }
      : null,
    patientTypeDistribution: patientTypeDistribution.map((pt) => ({
      name: pt.name,
      count: pt._count.patients,
    })),
    visitTrend,
    revenueTrend,
    recentVisits,
  }
}
