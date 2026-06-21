import { visitRepository, patientTypeRepository } from '@/repositories'

/**
 * Billing Service — orchestrates billing and revenue analytics.
 * Extracts business logic from billing/page.tsx into a testable service.
 */

/**
 * Get complete billing overview for the billing page.
 */
export async function getBillingOverview() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    todayRevenueRaw,
    monthlyRevenueRaw,
    totalRevenueRaw,
    todayVisitsWithFeeRaw,
    paymentModeBreakdown,
    monthlyRevenueTrend,
    revenueByType,
  ] = await Promise.all([
    // Today's revenue
    visitRepository.aggregate({
      where: { visitDate: { gte: startOfDay, lt: endOfDay }, fee: { not: null } },
      _sum: { fee: true },
      _count: true,
    }),

    // Monthly revenue
    visitRepository.aggregate({
      where: { visitDate: { gte: startOfMonth }, fee: { not: null } },
      _sum: { fee: true },
      _count: true,
    }),

    // Total revenue
    visitRepository.aggregate({
      where: { fee: { not: null } },
      _sum: { fee: true },
      _count: true,
    }),

    // Today's visits with fees (detailed)
    visitRepository.findMany({
      where: { visitDate: { gte: startOfDay, lt: endOfDay }, fee: { not: null } },
      include: { patient: { select: { name: true, patientNumber: true } } },
      orderBy: { visitDate: 'desc' },
    }),

    // Payment mode breakdown this month
    visitRepository.getRevenueByPaymentMode(startOfMonth),

    // Monthly revenue trend (last 6 months)
    visitRepository.getMonthlyRevenue(6),

    // Revenue by patient type
    visitRepository.getRevenueByPatientType(),
  ])

  const todayRevenue = todayRevenueRaw as unknown as { _sum: { fee: number | null }, _count: number }
  const monthlyRevenue = monthlyRevenueRaw as unknown as { _sum: { fee: number | null }, _count: number }
  const totalRevenue = totalRevenueRaw as unknown as { _sum: { fee: number | null }, _count: number }
  const todayVisitsWithFee = todayVisitsWithFeeRaw as unknown as Array<{
    id: string
    visitDate: Date
    fee: number | null
    paymentMode: string | null
    patient: {
      name: string
      patientNumber: string
    }
  }>

  return {
    todayRevenue,
    monthlyRevenue,
    totalRevenue,
    todayVisitsWithFee,
    paymentModeBreakdown,
    monthlyRevenueTrend,
    revenueByType,
  }
}
