import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { getDashboardData } from '@/lib/services/dashboardService'
import { DashboardCharts } from './DashboardCharts'

/**
 * Clinic Dashboard — Intelligence Hub.
 * Shows KPIs, charts, and recent activity for the doctor.
 */
export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const data = await getDashboardData()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clinic Intelligence Overview
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Patients"
          value={data.totalPatients}
          icon="👥"
          href="/patients"
        />
        <StatCard
          title="New This Month"
          value={data.newPatientsThisMonth}
          icon="🆕"
          href="/patients"
        />
        <StatCard
          title="Repeat Patient %"
          value={`${data.repeatPatientPct}%`}
          icon="🔄"
          href="/analytics"
        />
        <StatCard
          title="Today's Appointments"
          value={data.todaysAppointments}
          icon="📅"
          href="/followups?tab=today"
        />
        <StatCard
          title="Today's Visits"
          value={data.todaysVisits}
          icon="🩺"
          href="/patients"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Upcoming Follow-ups"
          value={data.upcomingFollowUps}
          icon="📋"
          href="/followups?tab=upcoming"
        />
        <StatCard
          title="Missed Follow-ups"
          value={data.missedFollowUps}
          icon="⚠️"
          variant={data.missedFollowUps > 0 ? 'danger' : 'default'}
          href="/followups?tab=missed"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${data.monthlyRevenue.toLocaleString()}`}
          icon="💰"
          href="/billing"
        />
        <StatCard
          title="Top Patient Type"
          value={data.mostCommonType?.name || 'N/A'}
          subtitle={data.mostCommonType ? `${data.mostCommonType.count} patients` : undefined}
          icon="🏥"
          href="/analytics"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        visitTrend={data.visitTrend}
        revenueTrend={data.revenueTrend}
        patientTypeDistribution={data.patientTypeDistribution}
      />

      {/* Recent Visits */}
      <div className="mt-6 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Visits
          </h3>
          <Link href="/patients" className="text-primary text-xs hover:underline">
            View all patients →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {data.recentVisits.map((visit) => (
            <div key={visit.id} className="p-4 flex justify-between items-center hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-medium text-sm">{visit.patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {visit.patient.patientNumber} • {new Date(visit.visitDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {visit.fee && (
                  <p className="text-sm font-medium">₹{visit.fee}</p>
                )}
                {visit.diagnosis && (
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {visit.diagnosis}
                  </p>
                )}
              </div>
            </div>
          ))}
          {data.recentVisits.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <span className="text-3xl block mb-2">📊</span>
              <p className="text-sm">No visits recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
