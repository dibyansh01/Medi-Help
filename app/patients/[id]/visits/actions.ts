'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export type VisitFormState = {
    error?: string
    success?: boolean
}

/**
 * Creates a new clinical visit record.
 * Business logic:
 * - Visit records are immutable (no update/delete exposed)
 * - If nextVisitDate is provided, auto-creates a follow-up entry
 * - Fee is optional (consultation may be free)
 */
export async function createVisit(
    prevState: VisitFormState,
    formData: FormData
): Promise<VisitFormState> {
    const patientId = formData.get('patientId') as string
    const bp = (formData.get('bp') as string) || undefined
    const temperatureStr = formData.get('temperature') as string
    const pulseStr = formData.get('pulse') as string
    const weightStr = formData.get('weight') as string
    const symptoms = (formData.get('symptoms') as string) || undefined
    const diagnosis = (formData.get('diagnosis') as string) || undefined
    const prescription = (formData.get('prescription') as string) || undefined
    const labTests = (formData.get('labTests') as string) || undefined
    const nextVisitDateStr = formData.get('nextVisitDate') as string
    const feeStr = formData.get('fee') as string
    const paymentMode = (formData.get('paymentMode') as string) || undefined
    const notes = (formData.get('notes') as string) || undefined

    if (!patientId) {
        return { error: 'Patient is required' }
    }

    try {
        const temperature = temperatureStr ? parseFloat(temperatureStr) : undefined
        const pulse = pulseStr ? parseInt(pulseStr, 10) : undefined
        const weight = weightStr ? parseFloat(weightStr) : undefined
        const fee = feeStr ? parseFloat(feeStr) : undefined
        const nextVisitDate = nextVisitDateStr ? new Date(nextVisitDateStr) : undefined

        // Create the visit record
        const visit = await prisma.visit.create({
            data: {
                patientId,
                bp,
                temperature,
                pulse,
                weight,
                symptoms,
                diagnosis,
                prescription,
                labTests,
                nextVisitDate,
                fee,
                paymentMode,
                notes,
            },
        })

        // Auto-create follow-up if nextVisitDate is set
        if (nextVisitDate) {
            await prisma.followUp.create({
                data: {
                    patientId,
                    visitId: visit.id,
                    followUpDate: nextVisitDate,
                    method: 'WHATSAPP',
                    status: 'CONFIRMED',
                    notes: `Auto-scheduled from visit on ${new Date().toLocaleDateString()}`,
                },
            })
        }

        revalidatePath(`/patients/${patientId}`)
        revalidatePath('/patients')
        revalidatePath('/followups')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (e) {
        console.error('CREATE_VISIT_ERROR:', e)
        return { error: 'Failed to create visit record.' }
    }
}
