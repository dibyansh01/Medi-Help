import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Pagination } from '@/components/ui/Pagination'
import { Search } from '@/components/ui/Search'
import { Badge } from '@/components/ui/Badge'

/**
 * Patients List Page.
 * Displays all patients with search by name/phone/patientNumber.
 * Implements server-side pagination and indexed search.
 */
export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string
        q?: string
        type?: string
    }>
}) {
    const session = await getServerSession()
    if (!session) redirect('/login')

    const resolvedParams = await searchParams
    const currentPage = Number(resolvedParams.page || '1')
    const pageSize = 15
    const query = resolvedParams.q || ''
    const typeFilter = resolvedParams.type || ''

    // Build where clause with indexed search
    const whereClause: Record<string, unknown> = {}
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

    if (andConditions.length > 0) {
        whereClause.AND = andConditions
    }

    const [patients, totalCount, patientTypes] = await Promise.all([
        prisma.patient.findMany({
            where: whereClause,
            include: {
                patientType: true,
                _count: { select: { visits: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        }),
        prisma.patient.count({ where: whereClause }),
        prisma.patientType.findMany({ orderBy: { name: 'asc' } }),
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Patients</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalCount} patient{totalCount !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3 w-full md:w-auto justify-start md:justify-end">
                        <Search placeholder="Search name, phone, ID..." />
                        <Link
                            href="/patients/new"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                        >
                            + New Patient
                        </Link>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-secondary/50 border-b">
                        <tr>
                            <th className="p-3 text-left font-medium text-muted-foreground">Patient ID</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Name</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Phone</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Gender</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Visits</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Registered</th>
                            <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-3 font-mono text-xs">
                                    <Badge variant="default">{patient.patientNumber}</Badge>
                                </td>
                                <td className="p-3 font-medium">{patient.name}</td>
                                <td className="p-3">{patient.phone}</td>
                                <td className="p-3">
                                    {patient.patientType ? (
                                        <Badge variant="secondary">{patient.patientType.name}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </td>
                                <td className="p-3">{patient.gender || '—'}</td>
                                <td className="p-3 font-medium">{patient._count.visits}</td>
                                <td className="p-3 text-muted-foreground">
                                    {new Date(patient.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    <Link
                                        href={`/patients/${patient.id}`}
                                        className="text-primary hover:underline text-xs font-medium"
                                    >
                                        View Profile →
                                    </Link>
                                </td>
                            </tr>
                        ))}

                        {patients.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl">🩺</span>
                                        <p className="font-medium">No patients found</p>
                                        <p className="text-sm">
                                            {query ? 'Try a different search term' : 'Register your first patient to get started'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
    )
}
