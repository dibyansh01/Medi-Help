'use server'

/**
 * Follow-up Server Actions — thin wrapper delegating to the service layer.
 */

import {
  rescheduleFollowUp as rescheduleService,
  markAsVisited as markVisitedService,
  updateFollowUpStatus as updateStatusService,
} from '@/services'
import type { FollowUpActionState } from '@/services'


/**
 * Reschedule a follow-up to a new date.
 */
export async function rescheduleFollowUp(
  followUpId: string,
  newDate: string
): Promise<FollowUpActionState> {
  return rescheduleService(followUpId, newDate)
}

/**
 * Mark a follow-up as visited (patient showed up).
 */
export async function markAsVisited(
  followUpId: string
): Promise<FollowUpActionState> {
  return markVisitedService(followUpId)
}

/**
 * Update follow-up status and add notes.
 */
export async function updateFollowUpStatus(
  followUpId: string,
  status: string,
  notes?: string
): Promise<FollowUpActionState> {
  return updateStatusService(followUpId, status, notes)
}
