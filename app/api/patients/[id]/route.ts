import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const patient = await prisma.patient.findUnique({
        where: { id },
        select: { id: true, name: true, phone: true, patientNumber: true },
    })

    if (!patient) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(patient)
}
