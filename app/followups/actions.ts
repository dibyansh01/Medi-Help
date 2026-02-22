'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

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
        await prisma.followUp.update({
            where: { id: followUpId },
            data: {
                followUpDate: new Date(newDate),
                status: 'RESCHEDULED',
            },
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
        await prisma.followUp.update({
            where: { id: followUpId },
            data: { status: 'VISITED' },
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
 * Update follow-up status and add notes.
 */
export async function updateFollowUpStatus(
    followUpId: string,
    status: string,
    notes?: string
): Promise<FollowUpActionState> {
    try {
        await prisma.followUp.update({
            where: { id: followUpId },
            data: {
                status,
                notes: notes || undefined,
            },
        })
        revalidatePath('/followups')
        return { success: true }
    } catch (e) {
        console.error('UPDATE_FOLLOWUP_ERROR:', e)
        return { error: 'Failed to update follow-up' }
    }
}
