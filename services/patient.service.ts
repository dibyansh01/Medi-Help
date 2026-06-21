import { patientRepository, patientTypeRepository } from '@/repositories'
import { revalidatePath } from 'next/cache'

/**
 * Patient Service — orchestrates patient-related business logic.
 * All patient mutations and queries go through this service.
 */

export type PatientFormState = {
  error?: string
  success?: boolean
  patientId?: string
}

/**
 * Create a new patient with auto-generated patient number.
 * Business Rule: patientNumber is system-generated and immutable (CLINIC-XXXXX).
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
    const patientNumber = await patientRepository.getNextPatientNumber()
    const dateOfBirth = dateOfBirthStr ? new Date(dateOfBirthStr) : undefined

    const patient = await patientRepository.create({
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
      patientType: patientTypeId ? { connect: { id: patientTypeId } } : undefined,
    })

    revalidatePath('/patients')
    return { success: true, patientId: patient.id }
  } catch (e) {
    console.error('CREATE_PATIENT_ERROR:', e)
    return { error: 'Failed to create patient. Please try again.' }
  }
}

/**
 * Update an existing patient's demographic information.
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
    await patientRepository.update(patientId, {
      name,
      phone,
      email,
      gender,
      dateOfBirth: dateOfBirthStr ? new Date(dateOfBirthStr) : null,
      bloodGroup,
      allergies,
      chronicConditions,
      address,
      patientType: patientTypeId ? { connect: { id: patientTypeId } } : { disconnect: true },
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
 * Get patient profile with full details.
 */
export async function getPatientProfile(id: string) {
  return patientRepository.findByIdWithDetails(id)
}

/**
 * Get patient basic info (for API/form lookups).
 */
export async function getPatientBasicInfo(id: string) {
  return patientRepository.findByIdBasic(id)
}

/**
 * List patients with search, filtering, and pagination.
 */
export async function listPatients(params: {
  query?: string
  typeFilter?: string
  page?: number
  pageSize?: number
}) {
  const { query = '', typeFilter = '', page = 1, pageSize = 15 } = params

  const andConditions: Record<string, unknown>[] = []

  if (query) {
    andConditions.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { patientNumber: { contains: query, mode: 'insensitive' } },
      ],
    })
  }

  if (typeFilter) {
    andConditions.push({ patientTypeId: typeFilter })
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {}

  const [patients, totalCount] = await Promise.all([
    patientRepository.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    patientRepository.count(where),
  ])

  return {
    patients,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}

/**
 * Get all patient types for form dropdowns.
 */
export async function getPatientTypes() {
  return patientTypeRepository.findAll()
}
