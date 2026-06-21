/**
 * Analytics Module — Type Definitions
 */

export interface ChartDataPoint {
  name: string
  value: number
}

export interface TimeSeriesPoint {
  month: string
  count?: number
  revenue?: number
}

export interface FollowUpComplianceData {
  total: number
  visited: number
  missed: number
  complianceRate: number
}

export interface VisitFrequencyData {
  visits: string
  count: number
}

export interface DiseaseDistributionData {
  name: string
  value: number
}
