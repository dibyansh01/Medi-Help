/**
 * AI Module — Type Definitions
 * Foundation for AI-powered clinical features.
 */

export type AIFeature =
  | 'DIAGNOSIS_SUGGESTION'
  | 'PRESCRIPTION_ASSIST'
  | 'PATIENT_RISK_SCORE'
  | 'VISIT_SUMMARY'
  | 'TREND_ANALYSIS'

export interface AIRequest {
  feature: AIFeature
  context: Record<string, unknown>
  tenantId: string
  userId: string
}

export interface AIResponse {
  feature: AIFeature
  result: unknown
  confidence?: number
  timestamp: Date
}
