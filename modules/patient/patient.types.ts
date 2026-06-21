/**
 * Patient Module — Type Definitions
 */

export interface PatientListFilters {
  query?: string
  typeFilter?: string
  page?: number
  pageSize?: number
}

export interface PatientWithDetails {
  id: string
  patientNumber: string
  name: string
  phone: string
  email?: string | null
  gender?: string | null
  dateOfBirth?: Date | null
  bloodGroup?: string | null
  allergies?: string | null
  chronicConditions?: string | null
  address?: string | null
  patientTypeId?: string | null
  createdAt: Date
  updatedAt: Date
}
