/**
 * Billing Module — Type Definitions
 */

export interface BillingOverview {
  todayRevenue: { sum: number; count: number }
  monthlyRevenue: { sum: number; count: number }
  totalRevenue: { sum: number; count: number }
  avgFeePerVisit: number
}

export interface PaymentModeBreakdown {
  name: string
  count: number
  total: number
}

export interface RevenueByType {
  name: string
  revenue: number
}

export interface MonthlyRevenueTrend {
  month: string
  revenue: number
}
