/**
 * FollowUp Module — Type Definitions
 */

export interface FollowUpWithPatient {
  id: string
  patientId: string
  visitId?: string | null
  followUpDate: Date
  method: string
  status: string
  notes?: string | null
  patient: {
    id: string
    name: string
    phone: string
    patientNumber: string
  }
  visit?: {
    id: string
    diagnosis?: string | null
    visitDate: Date
  } | null
}

export interface FollowUpTabCounts {
  todayCount: number
  upcomingCount: number
  missedCount: number
  completedCount: number
}
