/**
 * Patient Module — Constants
 */

export const PATIENT_NUMBER_PREFIX = 'CLINIC'
export const PATIENT_NUMBER_PAD_LENGTH = 5

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const
export type BloodGroup = (typeof BLOOD_GROUPS)[number]

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const
export type Gender = (typeof GENDERS)[number]
