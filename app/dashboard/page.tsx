import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { DashboardFilter } from '../components/ui/DashboardFilter'
import { getDashboardData } from '@/lib/services/dashboardService'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; preset?: string }>
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams

  // Resolve Date Range or use Default
  let range = undefined;
  if (resolvedSearchParams.from && resolvedSearchParams.to) {
    range = {
      from: new Date(resolvedSearchParams.from),
      to: new Date(resolvedSearchParams.to)
    }
  }

  const data = await getDashboardData(range)

  // Determine period label
  const presetLabelMap: Record<string, string> = {
    next_30: 'Next 30 Days',
    next_7: 'Next 7 Days',
    this_month: 'This Month',
    last_month: 'Last Month',
    last_3_months: 'Last 3 Months',
    custom: 'Custom Range'
  }
  const periodLabel = presetLabelMap[resolvedSearchParams.preset || 'next_30'] || 'Selected Period'

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-200">
            Owner Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your cash flow and customer risks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DashboardFilter />
          <ThemeToggle />
        </div>
      </div>

      {/* SECTION 1: BUSINESS & CASH SNAPSHOT */}
      {/* SECTION 1: BUSINESS & CASH SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Invoiced"
          value={`₹${data.snapshot.totalInvoiced.toLocaleString()}`}
          subtext="Total business generated"
          href="/invoices"
        />
        <StatCard
          title="Payment Collected"
          value={`₹${data.snapshot.totalCollected.toLocaleString()}`}
          color="success"
          subtext="Total cash received"
          href="/invoices?status=PAID"
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${data.snapshot.totalOutstanding.toLocaleString()}`}
          subtext="Total pending collection"
          href="/invoices?status=UNPAID"
        />
        <StatCard
          title="Total Overdue"
          value={`₹${data.snapshot.totalOverdue.toLocaleString()}`}
          color="danger"
          subtext="Requires immediate attention"
          href="/invoices?status=OVERDUE"
        />
        <StatCard
          title="Overdue Customers"
          value={data.snapshot.overdueCustomersCount}
          color="warning"
          subtext="Customers with overdue invoices"
          href="/customers?status=OVERDUE"
        />
      </div>

      {/* SECTION 2: CASH-OUT & NET CASH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Cash Out"
          value={`₹${data.cashOut.totalCashOut.toLocaleString()}`}
          subtext="Expenses + Vendor Payments"
          href="/expenses"
        />
        <div className="md:col-span-2">
          <Card className={`h-full flex flex-col justify-center ${data.cashOut.netCashPosition >= 0 ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Net Cash Position
            </p>
            <div className={`text-4xl font-bold mt-1 ${data.cashOut.netCashPosition >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {data.cashOut.netCashPosition >= 0 ? '+' : ''}₹{data.cashOut.netCashPosition.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Real cash position (Collected - Out)</p>
          </Card>
        </div>
        <div className="space-y-4">
          <StatCard
            title="Vendor Payables"
            value={`₹${data.cashOut.vendorPayables.toLocaleString()}`}
            subtext="Outstanding to Vendors"
            href="/vendor-invoices"
          />
        </div>
      </div>

      {/* SECTION 3: GST SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. GST Collected */}
        <StatCard
          title="GST Collected"
          value={`₹${data.gstStats.gstCollected.toLocaleString()}`}
          color="info"
          tooltip="GST charged to your customers on sales invoices during the selected period. This amount may need to be paid to the government."
          subtext="From Sales Invoices"
        />

        {/* 2. GST Paid (Claimable) */}
        <StatCard
          title="GST Paid (Claimable)"
          value={`₹${data.gstStats.gstPaidClaimable.toLocaleString()}`}
          color="success"
          tooltip="GST you paid on purchases and expenses that can be claimed back while filing GST."
          subtext="Input Tax Credit (ITC)"
        />

        {/* 3. GST Paid (Not Claimable) */}
        <StatCard
          title="GST Paid (Block)"
          value={`₹${data.gstStats.gstPaidNonClaimable.toLocaleString()}`}
          color="gray"
          tooltip="GST paid on expenses where credit is not allowed. This becomes part of your business cost."
          subtext="Non-recoverable cost"
        />

        {/* 4. Net GST Payable */}
        <StatCard
          title="Net GST Payable"
          value={data.gstStats.netGstPayable > 0 ? `₹${data.gstStats.netGstPayable.toLocaleString()}` : "No GST due"}
          color={data.gstStats.netGstPayable > 0 ? "warning" : "success"}
          tooltip="Estimated GST amount you may need to pay after adjusting eligible GST credits."
          subtext={data.gstStats.netGstPayable > 0 ? "Liability" : "Credit Balance"}
        />
      </div>

      {/* GST CASHFLOW INSIGHTS */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          GST Cashflow Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 5. GST Cash Blocked */}
          <StatCard
            title="GST Cash Blocked"
            value={`₹${Math.round(data.gstStats.gstCashBlocked).toLocaleString()}`}
            color="danger"
            tooltip="GST charged on invoices where customers have not paid yet. This GST is stuck until you receive the payment."
            subtext="Linked to unpaid customer invoices"
          />

          {/* 6. GST Credit Pending */}
          <StatCard
            title="GST Credit Pending"
            value={`₹${data.gstStats.gstCreditPending.toLocaleString()}`}
            color="warning"
            tooltip="GST you can claim only after paying pending vendor bills. Clearing vendor dues may unlock this GST credit."
            subtext="Linked to unpaid vendor invoices"
          />
        </div>
      </div>



      {/* SECTION 5: OPERATIONAL INTELLIGENCE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Follow-ups */}
        <div className="xl:col-span-1">
          <Card title="Upcoming Follow-ups (In Selected Range)" className="h-full">
            {data.operational.upcomingFollowups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <p>No upcoming follow-ups 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.operational.upcomingFollowups.map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-secondary">
                    <div>
                      <p className="font-semibold text-sm">
                        <Link href={`/invoices?q=${encodeURIComponent(f.invoice.customer.name)}`} className="hover:underline text-primary">
                          {f.invoice.customer.name}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(f.nextFollowUpOn!).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Link href={`/followups`} className="text-xs text-primary hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* High Risk Customers */}
        <div className="xl:col-span-2">
          <Card title="High Risk Customers" className="h-full">
            {data.operational.highRiskCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <p>🎉 No high risk customers</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-secondary/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Customer</th>
                      <th className="px-4 py-3">Outstanding</th>
                      <th className="px-4 py-3">Oldest Due</th>
                      <th className="px-4 py-3">Broken Promises</th>
                      <th className="px-4 py-3 rounded-r-lg">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.operational.highRiskCustomers.map((c: any) => (
                      <tr key={c.customerId} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/invoices?q=${encodeURIComponent(c.customerName)}`} className="hover:underline text-primary">
                            {c.customerName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">₹{c.totalOutstanding.toLocaleString()}</td>
                        <td className="px-4 py-3">{c.oldestDueDays} days</td>
                        <td className="px-4 py-3 text-center">{c.brokenPromises}</td>
                        <td className="px-4 py-3">
                          <Badge variant="danger">HIGH</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aging Summary */}
        <Card title="Aging Summary (Overdue Only)">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-500">Bucket</th>
                  <th className="p-3 text-right font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(data.operational.agingBuckets).map(([bucket, amount]: [string, any]) => (
                  <tr key={bucket} className="hover:bg-secondary/20">
                    <td className="p-3 font-medium">{bucket} Days</td>
                    <td className="p-3 text-right">₹{amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Defaulters */}
        <Card title="Top Overdue Customers">
          <div className="space-y-3">
            {data.operational.topDefaulters.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No overdue customers 🎉</p>
            ) : (
              data.operational.topDefaulters.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-transparent hover:border-secondary transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                    <span className="font-medium">
                      <Link href={`/invoices?q=${encodeURIComponent(c.customerName)}`} className="hover:underline text-primary">
                        {c.customerName}
                      </Link>
                    </span>
                  </div>
                  <span className="font-bold text-danger">₹{c.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
