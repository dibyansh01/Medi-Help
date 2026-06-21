/**
 * FollowUp Module — Constants
 */

export const FOLLOWUP_STATUSES = [
  'CONFIRMED',
  'NO_RESPONSE',
  'RESCHEDULED',
  'VISITED',
  'MISSED',
] as const
export type FollowUpStatus = (typeof FOLLOWUP_STATUSES)[number]

export const FOLLOWUP_METHODS = ['CALL', 'WHATSAPP', 'SMS', 'VISIT'] as const
export type FollowUpMethod = (typeof FOLLOWUP_METHODS)[number]

export const FOLLOWUP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  CONFIRMED: 'Confirmed',
  NO_RESPONSE: 'No Response',
  RESCHEDULED: 'Rescheduled',
  VISITED: 'Visited',
  MISSED: 'Missed',
}

export const FOLLOWUP_TABS = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'missed', label: 'Missed' },
  { key: 'completed', label: 'Completed' },
] as const
