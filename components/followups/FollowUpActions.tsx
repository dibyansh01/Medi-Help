'use client'

import { useState, useTransition } from 'react'
import { rescheduleFollowUp, markAsVisited, updateFollowUpStatus } from '@/app/(authenticated)/followups/actions'

type Props = {
    followUpId: string
    currentStatus: string
}

/**
 * Follow-up action buttons — client component for interactivity.
 * Allows reschedule, mark as visited, and log interaction.
 */
export function FollowUpActions({ followUpId, currentStatus }: Props) {
    const [isPending, startTransition] = useTransition()
    const [showReschedule, setShowReschedule] = useState(false)
    const [newDate, setNewDate] = useState('')

    const handleMarkVisited = () => {
        startTransition(async () => {
            await markAsVisited(followUpId)
        })
    }

    const handleReschedule = () => {
        if (!newDate) return
        startTransition(async () => {
            await rescheduleFollowUp(followUpId, newDate)
            setShowReschedule(false)
            setNewDate('')
        })
    }

    const handleMarkNoResponse = () => {
        startTransition(async () => {
            await updateFollowUpStatus(followUpId, 'NO_RESPONSE')
        })
    }

    if (currentStatus === 'VISITED') {
        return (
            <span className="text-xs text-green-600 font-medium">✓ Completed</span>
        )
    }

    return (
        <div className="flex flex-col gap-1.5">
            <button
                onClick={handleMarkVisited}
                disabled={isPending}
                className="text-xs text-green-600 hover:underline font-medium disabled:opacity-50 text-left"
            >
                ✓ Mark Visited
            </button>

            {!showReschedule ? (
                <button
                    onClick={() => setShowReschedule(true)}
                    disabled={isPending}
                    className="text-xs text-primary hover:underline font-medium disabled:opacity-50 text-left"
                >
                    📅 Reschedule
                </button>
            ) : (
                <div className="flex gap-1">
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="text-xs px-1.5 py-1 border rounded bg-background w-28"
                    />
                    <button
                        onClick={handleReschedule}
                        disabled={isPending || !newDate}
                        className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
                    >
                        OK
                    </button>
                    <button
                        onClick={() => setShowReschedule(false)}
                        className="text-xs text-muted-foreground hover:underline"
                    >
                        ✕
                    </button>
                </div>
            )}

            <button
                onClick={handleMarkNoResponse}
                disabled={isPending}
                className="text-xs text-yellow-600 hover:underline font-medium disabled:opacity-50 text-left"
            >
                📵 No Response
            </button>
        </div>
    )
}
