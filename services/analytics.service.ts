import {
  patientRepository,
  visitRepository,
  followUpRepository,
  patientTypeRepository,
} from '@/repositories'

/**
 * Analytics Service — provides deep clinic performance insights.
 * Refactored from lib/services/analyticsService.ts to use repositories.
 */

/**
 * Patient growth: monthly new patient registrations for the last 12 months.
 */
export async function getPatientGrowth() {
  const months: { month: string; count: number }[] = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const count = await patientRepository.count({
      createdAt: { gte: start, lt: end },
    })

    months.push({
      month: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count,
    })
  }

  return months
}

/**
 * Disease category distribution: patient count per patient type.
 */
export async function getDiseaseDistribution() {
  return patientTypeRepository.getDiseaseDistribution()
}

/**
 * Visit frequency distribution: how many patients have 1, 2, 3, 4, 5+ visits.
 */
export async function getVisitFrequencyDistribution() {
  return visitRepository.getVisitFrequencyDistribution()
}

/**
 * Follow-up compliance rate: percentage of follow-ups that resulted in a visit.
 */
export async function getFollowUpCompliance() {
  return followUpRepository.getComplianceStats()
}

/**
 * Revenue trend: monthly revenue for the last 12 months.
 */
export async function getRevenueTrend() {
  return visitRepository.getMonthlyRevenue(12)
}

/**
 * Revenue by patient type breakdown.
 */
export async function getRevenueByPatientType() {
  return visitRepository.getRevenueByPatientType()
}
