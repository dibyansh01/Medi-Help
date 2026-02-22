
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card } from '@/app/components/ui/Card';
import { DashboardFilter } from '@/app/components/ui/DashboardFilter';
import { GstTrendChart } from '@/components/analytics/GstTrendChart';
import { GstRateMixChart } from '@/components/analytics/GstRateMixChart';
import { GstLeakageList } from '@/components/analytics/GstLeakageList';
import { getGstAnalyticsData, Period, GstTrendItem, GstRateMixItem } from '@/lib/services/gstAnalyticsService';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { SEMANTIC_STYLES, CHART_PALETTE_MAIN } from '@/lib/constants/colors';

export default async function GstAnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string; period?: string }>
}) {
    const session = await getServerSession();
    if (!session) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;

    // Parse Period
    const period = (resolvedSearchParams.period || 'month') as Period;

    // Parse Date Range
    let range = undefined;
    if (resolvedSearchParams.from && resolvedSearchParams.to) {
        range = {
            from: new Date(resolvedSearchParams.from),
            to: new Date(resolvedSearchParams.to)
        };
    }

    const data = await getGstAnalyticsData(range, period);

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <span className="text-sm">Back to Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        GST Trends & Insights
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visualize your GST liability, credits, and cost leakage
                    </p>
                </div>

                {/* Simple Filters (For Prototype/Phase 1) - Can be enhanced to full DatePicker later if needed */}
                <div className="flex items-center gap-4">
                    {/* Date Range Picker */}
                    <DashboardFilter resetPath="/gst-analytics" />
                </div>
            </div>

            {/* 1. TREND ANALYSIS */}
            <Card
                title="GST Collected vs Paid Trend"
                tooltip="Track how your GST Liability (Collected) compares to your Input Tax Credit (Paid). If Blue > Green consistently, you likely have net payable GST."
            >
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${SEMANTIC_STYLES.info.wrapper}`}>
                        <p className="text-sm font-medium mb-1 !text-blue-900 dark:!text-blue-200">Total Collected (Liability)</p>
                        <p className="text-2xl font-bold !text-blue-700 dark:!text-blue-300">
                            ₹{data.trendChartData.reduce((acc: number, curr: GstTrendItem) => acc + curr.collected, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className={`p-4 rounded-xl ${SEMANTIC_STYLES.success.wrapper}`}>
                        <p className="text-sm font-medium mb-1 !text-green-900 dark:!text-green-200">Total Paid (Asset/Credit)</p>
                        <p className="text-2xl font-bold !text-green-700 dark:!text-green-300">
                            ₹{data.trendChartData.reduce((acc: number, curr: GstTrendItem) => acc + curr.paidClaimable, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
                <GstTrendChart data={data.trendChartData} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. RATE MIX ANALYSIS */}
                <Card
                    title="GST Rate Mix"
                    className="lg:col-span-1"
                    tooltip="Breakdown of GST amounts by tax rate. Helps you understand if you operate mostly in high-tax or low-tax categories."
                >
                    <GstRateMixChart data={data.rateMixChartData} />
                    <div className="mt-6 space-y-3">
                        {data.rateMixChartData.map((item: GstRateMixItem, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: CHART_PALETTE_MAIN[idx % CHART_PALETTE_MAIN.length] }}
                                    />
                                    <span className="font-semibold !text-slate-900 dark:!text-slate-100">{item.name} Rate</span>
                                </div>
                                <span className="font-bold !text-slate-900 dark:!text-slate-100">₹{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 3. LEAKAGE ANALYSIS */}
                <Card
                    title="GST Leakage (Non-Claimable)"
                    className="lg:col-span-2"
                    tooltip="GST paid on expenses/vendors where Input Tax Credit is NOT available. This is a direct cost to your business."
                >
                    <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${SEMANTIC_STYLES.danger.wrapper}`}>
                        <div>
                            <h3 className="font-semibold !text-red-900 dark:!text-red-200">Total GST Leakage</h3>
                            <p className="text-xs !text-red-800 dark:!text-red-300">Direct impact on profit</p>
                        </div>
                        <p className="text-2xl font-bold !text-red-600 dark:!text-red-400">
                            ₹{data.leakage.totalLeakage.toLocaleString()}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">By Category</h4>
                            <GstLeakageList items={data.leakage.byCategory} type="Category" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">By Vendor</h4>
                            <GstLeakageList items={data.leakage.byVendor} type="Vendor" />
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
