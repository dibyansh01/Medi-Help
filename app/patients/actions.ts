'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export type PatientFormState = {
  error?: string
  success?: boolean
  patientId?: string
}

/**
 * Generates the next patient number in CLINIC-XXXXX format.
 * Uses the count of existing patients + 1 to ensure uniqueness.
 */
async function generatePatientNumber(): Promise<string> {
  const count = await prisma.patient.count()
  const nextNum = count + 1
  return `CLINIC-${String(nextNum).padStart(5, '0')}`
}

/**
 * Creates a new patient record with auto-generated patient number.
 * Business logic: patientNumber is system-generated and immutable.
 */
export async function createPatient(
  prevState: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = (formData.get('email') as string) || undefined
  const gender = (formData.get('gender') as string) || undefined
  const dateOfBirthStr = formData.get('dateOfBirth') as string
  const bloodGroup = (formData.get('bloodGroup') as string) || undefined
  const allergies = (formData.get('allergies') as string) || undefined
  const chronicConditions = (formData.get('chronicConditions') as string) || undefined
  const address = (formData.get('address') as string) || undefined
  const patientTypeId = (formData.get('patientTypeId') as string) || undefined

  if (!name || !phone) {
    return { error: 'Name and phone are required' }
  }

  try {
    const patientNumber = await generatePatientNumber()
    const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : undefined

    const patient = await prisma.patient.create({
      data: {
        patientNumber,
        name,
        phone,
        email,
        gender,
        dateOfBirth,
        bloodGroup,
        allergies,
        chronicConditions,
        address,
        patientTypeId: patientTypeId || undefined,
      },
    })

    revalidatePath('/patients')
    return { success: true, patientId: patient.id }
  } catch (e) {
    console.error('CREATE_PATIENT_ERROR:', e)
    return { error: 'Failed to create patient. Please try again.' }
  }
}

/**
 * Updates an existing patient's demographic information.
 */
export async function updatePatient(
  patientId: string,
  prevState: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = (formData.get('email') as string) || null
  const gender = (formData.get('gender') as string) || null
  const dateOfBirthStr = formData.get('dateOfBirth') as string
  const bloodGroup = (formData.get('bloodGroup') as string) || null
  const allergies = (formData.get('allergies') as string) || null
  const chronicConditions = (formData.get('chronicConditions') as string) || null
  const address = (formData.get('address') as string) || null
  const patientTypeId = (formData.get('patientTypeId') as string) || null

  if (!name || !phone) {
    return { error: 'Name and phone are required' }
  }

  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        name,
        phone,
        email,
        gender,
        dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
        bloodGroup,
        allergies,
        chronicConditions,
        address,
        patientTypeId,
      },
    })

    revalidatePath('/patients')
    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (e) {
    console.error('UPDATE_PATIENT_ERROR:', e)
    return { error: 'Failed to update patient.' }
  }
}

/**
 * Fetches all patient types for dropdowns.
 */
export async function getPatientTypes() {
  return prisma.patientType.findMany({
    orderBy: { name: 'asc' },
  })
}
