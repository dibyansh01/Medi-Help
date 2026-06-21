/**
 * Visit Module — Validation Functions
 */

import { VITALS_RANGES } from './visit.constants'

export function validateVitals(data: {
  height?: number
  weight?: number
  temperature?: number
  pulse?: number
}): string | null {
  if (data.height !== undefined) {
    const { min, max } = VITALS_RANGES.height
    if (data.height < min || data.height > max) {
      return `Height must be between ${min} and ${max} ${VITALS_RANGES.height.unit}`
    }
  }

  if (data.weight !== undefined) {
    const { min, max } = VITALS_RANGES.weight
    if (data.weight < min || data.weight > max) {
      return `Weight must be between ${min} and ${max} ${VITALS_RANGES.weight.unit}`
    }
  }

  if (data.temperature !== undefined) {
    const { min, max } = VITALS_RANGES.temperature
    if (data.temperature < min || data.temperature > max) {
      return `Temperature must be between ${min} and ${max} ${VITALS_RANGES.temperature.unit}`
    }
  }

  if (data.pulse !== undefined) {
    const { min, max } = VITALS_RANGES.pulse
    if (data.pulse < min || data.pulse > max) {
      return `Pulse must be between ${min} and ${max} ${VITALS_RANGES.pulse.unit}`
    }
  }

  return null
}

export function validateVisitInput(data: { patientId?: string }): string | null {
  if (!data.patientId) return 'Patient is required'
  return null
}
