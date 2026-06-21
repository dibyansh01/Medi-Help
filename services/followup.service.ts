import { followUpRepository } from '@/repositories'
import { revalidatePath } from 'next/cache'

/**
 * FollowUp Service — orchestrates follow-up business logic.
 * Manages appointment lifecycle: CONFIRMED → RESCHEDULED / VISITED / NO_RESPONSE / MISSED
 */

export type FollowUpActionState = {
  error?: string
  success?: boolean
}

/**
 * Reschedule a follow-up to a new date.
 */
export async function rescheduleFollowUp(
  followUpId: string,
  newDate: string
): Promise<FollowUpActionState> {
  try {
    await followUpRepository.update(followUpId, {
      followUpDate: new Date(newDate),
      status: 'RESCHEDULED',
    })
    revalidatePath('/followups')
    return { success: true }
  } catch (e) {
    console.error('RESCHEDULE_ERROR:', e)
    return { error: 'Failed to reschedule follow-up' }
  }
}

/**
 * Mark a follow-up as visited (patient showed up).
 */
export async function markAsVisited(
  followUpId: string
): Promise<FollowUpActionState> {
  try {
    await followUpRepository.update(followUpId, {
      status: 'VISITED',
    })
    revalidatePath('/followups')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    console.error('MARK_VISITED_ERROR:', e)
    return { error: 'Failed to update follow-up status' }
  }
}

/**
 * Update follow-up status and optionally add notes.
 */
export async function updateFollowUpStatus(
  followUpId: string,
  status: string,
  notes?: string
): Promise<FollowUpActionState> {
  try {
    await followUpRepository.update(followUpId, {
      status,
      notes: notes || undefined,
    })
    revalidatePath('/followups')
    return { success: true }
  } catch (e) {
    console.error('UPDATE_FOLLOWUP_ERROR:', e)
    return { error: 'Failed to update follow-up' }
  }
}

/**
 * List follow-ups with tab filtering, search, and pagination.
 */
export async function listFollowUps(params: {
  tab?: string
  query?: string
  page?: number
  pageSize?: number
}) {
  const { tab = 'upcoming', query = '', page = 1, pageSize = 15 } = params

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  const andConditions: Record<string, unknown>[] = []

  // Tab-based filtering
  switch (tab) {
    case 'today':
      andConditions.push({
        followUpDate: { gte: startOfDay, lt: endOfDay },
        status: { notIn: ['VISITED'] },
      })
      break
    case 'upcoming':
      andConditions.push({
        followUpDate: { gte: startOfDay },
        status: { in: ['CONFIRMED', 'RESCHEDULED'] },
      })
      break
    case 'missed':
      andConditions.push({
        followUpDate: { lt: startOfDay },
        status: { notIn: ['VISITED', 'RESCHEDULED'] },
      })
      break
    case 'completed':
      andConditions.push({ status: 'VISITED' })
      break
  }

  // Search filter
  if (query) {
    andConditions.push({
      patient: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { patientNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
    })
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {}

  const [followUps, totalCount] = await Promise.all([
    followUpRepository.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    followUpRepository.count(where),
  ])

  return {
    followUps,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}

/**
 * Get tab badge counts for the follow-ups page.
 */
export async function getFollowUpTabCounts() {
  return followUpRepository.getTabCounts()
}
