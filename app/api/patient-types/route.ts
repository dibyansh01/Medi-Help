import { getPatientTypes } from '@/services'
import { NextResponse } from 'next/server'

export async function GET() {
    const patientTypes = await getPatientTypes()
    return NextResponse.json(patientTypes)
}
