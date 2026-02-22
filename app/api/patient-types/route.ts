import { prisma } from '@/lib/db/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const patientTypes = await prisma.patientType.findMany({
        orderBy: { name: 'asc' },
    })
    return NextResponse.json(patientTypes)
}
