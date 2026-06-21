/**
 * Visit Module — Constants
 */

export const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'INSURANCE'] as const
export type PaymentMode = (typeof PAYMENT_MODES)[number]

export const VISIT_FORM_SECTIONS = [
  'vitals',
  'riskFactors',
  'clinicalNotes',
  'scheduling',
  'billing',
] as const

export const VITALS_RANGES = {
  height: { min: 0.5, max: 2.5, unit: 'meters' },
  weight: { min: 1, max: 300, unit: 'kg' },
  temperature: { min: 90, max: 110, unit: '°F' },
  pulse: { min: 30, max: 250, unit: 'bpm' },
} as const
