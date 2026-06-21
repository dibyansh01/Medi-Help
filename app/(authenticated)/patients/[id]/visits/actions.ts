'use server'

/**
 * Visit Server Actions — thin wrapper delegating to the service layer.
 */

import { createVisit as createVisitService } from '@/services'
import type { VisitFormState } from '@/services'

/**
 * Creates a new clinical visit record.
 * Business logic (validation, auto follow-up) handled by visit service.
 */
export async function createVisit(
  prevState: VisitFormState,
  formData: FormData
): Promise<VisitFormState> {
  return createVisitService(prevState, formData)
}
