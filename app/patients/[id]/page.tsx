import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Badge } from '@/app/components/ui/Badge'

/**
 * Patient Profile Page.
 * Shows demographics, visit timeline with vitals, and quick actions.
 */
export default async function PatientProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession()
    if (!session) redirect('/login')

    const { id } = await params

    const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
            patientType: true,
            visits: {
                orderBy: { visitDate: 'desc' },
                include: {
                    followUps: true,
                },
            },
            followUps: {
                orderBy: { followUpDate: 'desc' },
                take: 5,
            },
        },
    })

    if (!patient) notFound()

    // Calculate age from DOB
    const age = patient.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(patient.dateOfBirth).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
        : null

    const totalVisits = patient.visits.length
    const lastVisit = patient.visits[0]
    const upcomingFollowUps = patient.followUps.filter(
        (f) => new Date(f.followUpDate) >= new Date() && f.status !== 'VISITED'
    )

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold">{patient.name}</h1>
                        <Badge variant="default">{patient.patientNumber}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {patient.patientType?.name || 'General'} Patient
                        {age !== null && ` • ${age} years old`}
                        {patient.gender && ` • ${patient.gender}`}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/patients/${patient.id}/visits/new`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                    >
                        + New Visit
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Demographics */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact & Demographics Card */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Demographics
                        </h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Phone" value={patient.phone} />
                            {patient.email && <InfoRow label="Email" value={patient.email} />}
                            {patient.dateOfBirth && (
                                <InfoRow
                                    label="Date of Birth"
                                    value={new Date(patient.dateOfBirth).toLocaleDateString()}
                                />
                            )}
                            {patient.bloodGroup && <InfoRow label="Blood Group" value={patient.bloodGroup} />}
                            {patient.address && <InfoRow label="Address" value={patient.address} />}
                        </div>
                    </div>

                    {/* Medical Info Card */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Medical Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            {patient.allergies ? (
                                <InfoRow label="Allergies" value={patient.allergies} highlight />
                            ) : (
                                <InfoRow label="Allergies" value="None reported" />
                            )}
                            {patient.chronicConditions ? (
                                <InfoRow label="Chronic Conditions" value={patient.chronicConditions} highlight />
                            ) : (
                                <InfoRow label="Chronic Conditions" value="None reported" />
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-secondary/50 rounded-lg">
                                <p className="text-2xl font-bold">{totalVisits}</p>
                                <p className="text-xs text-muted-foreground">Total Visits</p>
                            </div>
                            <div className="text-center p-3 bg-secondary/50 rounded-lg">
                                <p className="text-2xl font-bold">{upcomingFollowUps.length}</p>
                                <p className="text-xs text-muted-foreground">Upcoming</p>
                            </div>
                        </div>
                        {lastVisit && (
                            <p className="text-xs text-muted-foreground mt-3">
                                Last visit: {new Date(lastVisit.visitDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Visit Timeline */}
                <div className="lg:col-span-2">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-5 border-b">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Visit History
                            </h3>
                        </div>

                        {patient.visits.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <span className="text-4xl block mb-2">📋</span>
                                <p className="font-medium">No visits recorded yet</p>
                                <Link
                                    href={`/patients/${patient.id}/visits/new`}
                                    className="text-primary hover:underline text-sm mt-2 inline-block"
                                >
                                    Record first visit →
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {patient.visits.map((visit, index) => (
                                    <div key={visit.id} className="p-5 hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                    {totalVisits - index}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {new Date(visit.visitDate).toLocaleDateString('en-IN', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                    {visit.fee && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Fee: ₹{visit.fee} {visit.paymentMode && `• ${visit.paymentMode}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {visit.nextVisitDate && (
                                                <Badge variant="secondary">
                                                    Next: {new Date(visit.nextVisitDate).toLocaleDateString()}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Vitals */}
                                        {(visit.bp || visit.temperature || visit.pulse || visit.weight) && (
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {visit.bp && (
                                                    <span className="px-2.5 py-1 bg-secondary rounded text-xs font-medium">
                                                        BP: {visit.bp}
                                                    </span>
                                                )}
                                                {visit.temperature && (
                                                    <span className="px-2.5 py-1 bg-secondary rounded text-xs font-medium">
                                                        Temp: {visit.temperature}°F
                                                    </span>
                                                )}
                                                {visit.pulse && (
                                                    <span className="px-2.5 py-1 bg-secondary rounded text-xs font-medium">
                                                        Pulse: {visit.pulse} bpm
                                                    </span>
                                                )}
                                                {visit.weight && (
                                                    <span className="px-2.5 py-1 bg-secondary rounded text-xs font-medium">
                                                        Weight: {visit.weight} kg
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Clinical Notes */}
                                        <div className="space-y-2 text-sm">
                                            {visit.symptoms && (
                                                <div>
                                                    <span className="text-muted-foreground font-medium">Symptoms: </span>
                                                    {visit.symptoms}
                                                </div>
                                            )}
                                            {visit.diagnosis && (
                                                <div>
                                                    <span className="text-muted-foreground font-medium">Diagnosis: </span>
                                                    {visit.diagnosis}
                                                </div>
                                            )}
                                            {visit.prescription && (
                                                <div>
                                                    <span className="text-muted-foreground font-medium">Rx: </span>
                                                    {visit.prescription}
                                                </div>
                                            )}
                                            {visit.labTests && (
                                                <div>
                                                    <span className="text-muted-foreground font-medium">Labs: </span>
                                                    {visit.labTests}
                                                </div>
                                            )}
                                            {visit.notes && (
                                                <div className="text-muted-foreground italic">
                                                    Note: {visit.notes}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4">
                                            <Link
                                                href={`/patients/${patient.id}/visits/${visit.id}`}
                                                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoRow({
    label,
    value,
    highlight = false,
}: {
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-medium ${highlight ? 'text-warning' : ''}`}>{value}</span>
        </div>
    )
}
