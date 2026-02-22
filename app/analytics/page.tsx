import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import {
    getPatientGrowth,
    getDiseaseDistribution,
    getVisitFrequencyDistribution,
    getFollowUpCompliance,
    getRevenueTrend,
    getRevenueByPatientType,
} from '@/lib/services/analyticsService'
import { AnalyticsCharts } from './AnalyticsCharts'

/**
 * Analytics Page — Deep clinic insights.
 */
export default async function AnalyticsPage() {
    const session = await getServerSession()
    if (!session) redirect('/login')

    const [
        patientGrowth,
        diseaseDistribution,
        visitFrequency,
        followUpCompliance,
        revenueTrend,
        revenueByType,
    ] = await Promise.all([
        getPatientGrowth(),
        getDiseaseDistribution(),
        getVisitFrequencyDistribution(),
        getFollowUpCompliance(),
        getRevenueTrend(),
        getRevenueByPatientType(),
    ])

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Deep insights into your clinic performance
                </p>
            </div>

            {/* Compliance KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Follow-ups</p>
                    <p className="text-2xl font-bold mt-1">{followUpCompliance.total}</p>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Attended</p>
                    <p className="text-2xl font-bold mt-1 text-green-500">{followUpCompliance.visited}</p>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Missed</p>
                    <p className="text-2xl font-bold mt-1 text-red-500">{followUpCompliance.missed}</p>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Compliance Rate</p>
                    <p className="text-2xl font-bold mt-1">{followUpCompliance.complianceRate}%</p>
                </div>
            </div>

            <AnalyticsCharts
                patientGrowth={patientGrowth}
                diseaseDistribution={diseaseDistribution}
                visitFrequency={visitFrequency}
                revenueTrend={revenueTrend}
                revenueByType={revenueByType}
            />
        </div>
    )
}
