import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/app/components/ui/Badge'
import { VisitDownloadButton } from './VisitDownloadButton'

/**
 * Visit Detail Page — Full view of a single visit record.
 * Includes vitals, clinical notes, prescription, labs, and download option.
 */
export default async function VisitDetailPage({
    params,
}: {
    params: Promise<{ id: string; visitId: string }>
}) {
    const session = await getServerSession()
    if (!session) redirect('/login')

    const { id: patientId, visitId } = await params

    const visit = await prisma.visit.findUnique({
        where: { id: visitId },
        include: {
            patient: {
                include: { patientType: true },
            },
            followUps: true,
        },
    })

    if (!visit || visit.patientId !== patientId) notFound()

    const patient = visit.patient
    const age = patient.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(patient.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
        : null

    // Serialize visit data for the client-side download button
    const visitData = {
        id: visit.id,
        visitDate: visit.visitDate.toISOString(),
        bp: visit.bp,
        temperature: visit.temperature,
        pulse: visit.pulse,
        weight: visit.weight,
        symptoms: visit.symptoms,
        diagnosis: visit.diagnosis,
        prescription: visit.prescription,
        labTests: visit.labTests,
        nextVisitDate: visit.nextVisitDate?.toISOString() || null,
        fee: visit.fee,
        paymentMode: visit.paymentMode,
        notes: visit.notes,
    }

    const patientData = {
        name: patient.name,
        patientNumber: patient.patientNumber,
        phone: patient.phone,
        gender: patient.gender,
        age,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        patientType: patient.patientType?.name || 'General',
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <Link
                        href={`/patients/${patientId}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors mb-2 inline-block"
                    >
                        ← Back to {patient.name}
                    </Link>
                    <h1 className="text-2xl font-bold">Visit Record</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {new Date(visit.visitDate).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <VisitDownloadButton visit={visitData} patient={patientData} />
            </div>

            {/* Patient Summary Bar */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{patient.name}</span>
                        <Badge variant="default">{patient.patientNumber}</Badge>
                    </div>
                    {age !== null && <span className="text-muted-foreground">{age} yrs</span>}
                    {patient.gender && <span className="text-muted-foreground">{patient.gender}</span>}
                    {patient.bloodGroup && (
                        <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                            {patient.bloodGroup}
                        </span>
                    )}
                    {patient.allergies && (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded text-xs font-medium">
                            ⚠ {patient.allergies}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vitals Section */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <VitalItem label="Blood Pressure" value={visit.bp} unit="" />
                        <VitalItem label="Temperature" value={visit.temperature ? `${visit.temperature}` : null} unit="°F" />
                        <VitalItem label="Pulse" value={visit.pulse ? `${visit.pulse}` : null} unit="bpm" />
                        <VitalItem label="Weight" value={visit.weight ? `${visit.weight}` : null} unit="kg" />
                    </div>
                </div>

                {/* Billing Section */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Billing & Schedule
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Consultation Fee</span>
                            <span className="font-bold text-lg">{visit.fee ? `₹${visit.fee}` : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Mode</span>
                            <span className="font-medium">{visit.paymentMode || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Visit</span>
                            <span className="font-medium">
                                {visit.nextVisitDate
                                    ? new Date(visit.nextVisitDate).toLocaleDateString('en-IN', {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                    })
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clinical Notes — Full Width */}
            <div className="mt-6 space-y-6">
                {visit.symptoms && (
                    <ClinicalSection title="Symptoms" icon="🩺" content={visit.symptoms} />
                )}
                {visit.diagnosis && (
                    <ClinicalSection title="Diagnosis" icon="🔬" content={visit.diagnosis} />
                )}
                {visit.prescription && (
                    <ClinicalSection title="Prescription (Rx)" icon="💊" content={visit.prescription} highlight />
                )}
                {visit.labTests && (
                    <ClinicalSection title="Lab Tests Recommended" icon="🧪" content={visit.labTests} />
                )}
                {visit.notes && (
                    <ClinicalSection title="Additional Notes" icon="📝" content={visit.notes} muted />
                )}
            </div>
        </div>
    )
}

function VitalItem({ label, value, unit }: { label: string; value: string | null; unit: string }) {
    return (
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-xl font-bold">
                {value ? (
                    <>
                        {value}
                        <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
                    </>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                )}
            </p>
        </div>
    )
}

function ClinicalSection({
    title,
    icon,
    content,
    highlight = false,
    muted = false,
}: {
    title: string
    icon: string
    content: string
    highlight?: boolean
    muted?: boolean
}) {
    return (
        <div className={`rounded-lg border shadow-sm p-5 ${highlight
            ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800'
            : 'bg-card text-card-foreground'
            }`}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{icon}</span>
                {title}
            </h3>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${muted ? 'text-muted-foreground italic' : ''}`}>
                {content}
            </p>
        </div>
    )
}
