import { getPatientBasicInfo } from '@/services'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const patient = await getPatientBasicInfo(id)

    if (!patient) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(patient)
}
