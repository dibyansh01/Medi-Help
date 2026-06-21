'use server'

/**
 * Patient Server Actions — thin wrappers delegating to the service layer.
 * Preserves the existing Server Action interface for form components.
 */

import {
  createPatient as createPatientService,
  updatePatient as updatePatientService,
  getPatientTypes as getPatientTypesService,
} from '@/services'
import type { PatientFormState } from '@/services'


/**
 * Creates a new patient record with auto-generated patient number.
 */
export async function createPatient(
  prevState: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  return createPatientService(prevState, formData)
}

/**
 * Updates an existing patient's demographic information.
 */
export async function updatePatient(
  patientId: string,
  prevState: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  return updatePatientService(patientId, prevState, formData)
}

/**
 * Fetches all patient types for dropdowns.
 */
export async function getPatientTypes() {
  return getPatientTypesService()
}
