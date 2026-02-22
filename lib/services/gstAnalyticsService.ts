
import { prisma } from '@/lib/db/prisma';
import { getNextNDays } from '@/lib/utils/date';

export interface DateRange {
    from: Date;
    to: Date;
}

export type Period = 'week' | 'month' | 'year';

export interface GstTrendItem {
    collected: number;
    paidClaimable: number;
    label: string;
}

export interface GstRateMixItem {
    name: string;
    value: number;
}

export interface LeakageItem {
    name: string;
    value: number;
    percentage: number;
}

export interface GstAnalyticsData {
    trendChartData: GstTrendItem[];
    rateMixChartData: GstRateMixItem[];
    leakage: {
        totalLeakage: number;
        byCategory: LeakageItem[];
        byVendor: LeakageItem[];
    };
}

export async function getGstAnalyticsData(range?: DateRange, period: Period = 'month'): Promise<GstAnalyticsData> {
    // Default to Last 6 Months if no range provided
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setMonth(today.getMonth() - 6);

    const from = range?.from || defaultFrom;
    const to = range?.to || today;

    // Ensure 'to' is end of day for inclusive filtering
    const toEndOfDay = new Date(to);
    toEndOfDay.setHours(23, 59, 59, 999);

    const fromStartOfDay = new Date(from);
    fromStartOfDay.setHours(0, 0, 0, 0);

    // ============================================
    // 1. GST COLLECTED vs PAID TREND
    // ============================================

    // We need to group by week/month/year. Prisma doesn't support complex date grouping natively 
    // without raw SQL or post-processing. Post-processing is safer for cross-db compatibility 
    // and easier to maintain for this scale.

    const trendData: Record<string, { collected: number; paidClaimable: number; label: string }> = {};

    // --- Collected (Output GST) ---
    const invoices = await prisma.invoice.findMany({
        where: {
            invoiceDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            },
            gstAmount: { not: null } // Only considering invoices with GST
        },
        select: {
            invoiceDate: true,
            gstAmount: true
        }
    });

    // --- Paid (Input GST - Vendor Invoices) ---
    const vendorInvoices = await prisma.vendorInvoice.findMany({
        where: {
            invoiceDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            },
            gstAmount: { not: null },
            isGstEligible: true
        },
        select: {
            invoiceDate: true,
            gstAmount: true
        }
    });

    // --- Paid (Input GST - Expenses) ---
    const expenses = await prisma.expense.findMany({
        where: {
            expenseDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            },
            gstAmount: { not: null },
            isGstEligible: true
        },
        select: {
            expenseDate: true,
            gstAmount: true
        }
    });

    // Helper to format date key
    const getDateKey = (date: Date, p: Period) => {
        const d = new Date(date);
        if (p === 'year') return `${d.getFullYear()}`;
        if (p === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        // Week: ISO Week? Or just start of week? Let's do Start of Week (Monday)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    };

    // Helper for Label
    const getLabel = (key: string, p: Period) => {
        if (p === 'year') return key;
        const [y, m, d] = key.split('-').map(Number);
        const date = new Date(y, m - 1, d || 1);
        if (p === 'month') return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
        return `Week of ${date.toLocaleDateString('default', { day: 'numeric', month: 'short' })}`;
    };

    // Aggregate Output GST
    invoices.forEach(inv => {
        const key = getDateKey(inv.invoiceDate, period);
        if (!trendData[key]) trendData[key] = { collected: 0, paidClaimable: 0, label: getLabel(key, period) };
        trendData[key].collected += (inv.gstAmount || 0);
    });

    // Aggregate Input GST (Vendor)
    vendorInvoices.forEach(inv => {
        const key = getDateKey(inv.invoiceDate, period);
        if (!trendData[key]) trendData[key] = { collected: 0, paidClaimable: 0, label: getLabel(key, period) };
        trendData[key].paidClaimable += (inv.gstAmount || 0);
    });

    // Aggregate Input GST (Expense)
    expenses.forEach(exp => {
        const key = getDateKey(exp.expenseDate, period);
        if (!trendData[key]) trendData[key] = { collected: 0, paidClaimable: 0, label: getLabel(key, period) };
        trendData[key].paidClaimable += (exp.gstAmount || 0);
    });

    // Convert to Array and Sort
    const trendChartData = Object.entries(trendData)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([_, val]) => val);


    // ============================================
    // 2. GST RATE MIX ANALYSIS
    // ============================================

    // We need to sum gstAmount for each rate
    // Sources: Invoice (Collected), VendorInvoice (Paid), Expense (Paid)
    // "Am I mostly operating in high-GST or low-GST categories?" -> Usually implies *volume* of tax handled.
    // So we sum magnitude of GST involved? Or just Collected? 
    // Requirement says: SUM(Invoice) + SUM(VendorInvoice) + SUM(Expense) Group By Rate.

    // We can run aggregations for this.
    const mixData: Record<string, number> = {};

    // Helper
    const addToMix = (rate: number | null, amount: number | null) => {
        if (rate === null || amount === null) return;
        const rKey = `${rate}%`;
        mixData[rKey] = (mixData[rKey] || 0) + amount;
    };

    await Promise.all([
        prisma.invoice.findMany({
            where: {
                invoiceDate: { gte: fromStartOfDay, lte: toEndOfDay },
                gstRate: { not: null }
            },
            select: { gstRate: true, gstAmount: true }
        }).then(res => res.forEach(r => addToMix(r.gstRate, r.gstAmount))),

        prisma.vendorInvoice.findMany({
            where: {
                invoiceDate: { gte: fromStartOfDay, lte: toEndOfDay },
                gstRate: { not: null }
            },
            select: { gstRate: true, gstAmount: true }
        }).then(res => res.forEach(r => addToMix(r.gstRate, r.gstAmount))),

        prisma.expense.findMany({
            where: {
                expenseDate: { gte: fromStartOfDay, lte: toEndOfDay },
                gstRate: { not: null }
            },
            select: { gstRate: true, gstAmount: true }
        }).then(res => res.forEach(r => addToMix(r.gstRate, r.gstAmount))),
    ]);

    const rateMixChartData = Object.entries(mixData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => parseFloat(b.name) - parseFloat(a.name)); // Sort descending by rate? Or value? Rate makes sense logically (18, 12, 5)


    // ============================================
    // 3. GST LEAKAGE ANALYSIS (Non-Claimable)
    // ============================================

    // A. By Expense Category
    const expenseLeakage = await prisma.expense.findMany({
        where: {
            expenseDate: { gte: fromStartOfDay, lte: toEndOfDay },
            isGstEligible: false,
            gstAmount: { gt: 0 }
        },
        include: { category: true }
    });

    const leakageByCategoryMap: Record<string, number> = {};
    let totalLeakage = 0;

    expenseLeakage.forEach(exp => {
        const catName = exp.category.name;
        leakageByCategoryMap[catName] = (leakageByCategoryMap[catName] || 0) + (exp.gstAmount || 0);
        totalLeakage += (exp.gstAmount || 0);
    });

    // B. By Vendor (from VendorInvoice AND Expense if linked to vendor?)
    // Requirement: SUM(VendorInvoice where !eligible) Group By Vendor
    const vendorLeakage = await prisma.vendorInvoice.findMany({
        where: {
            invoiceDate: { gte: fromStartOfDay, lte: toEndOfDay },
            isGstEligible: false,
            gstAmount: { gt: 0 }
        },
        include: { vendor: true }
    });

    // Also expenses linked to vendors?
    // Requirement says "By Vendor: SUM(VendorInvoice...)". Let's stick to that for now to match spec, 
    // but often expenses are also vendor driven. 
    // Let's strictly follow "SUM(VendorInvoice.gstAmount) WHERE isGstEligible = false".

    const leakageByVendorMap: Record<string, number> = {};

    vendorLeakage.forEach(inv => {
        const vName = inv.vendor.name;
        leakageByVendorMap[vName] = (leakageByVendorMap[vName] || 0) + (inv.gstAmount || 0);
        totalLeakage += (inv.gstAmount || 0); // Add to grand total leakage
    });

    // Add Expense Leakage that is linked to a Vendor? 
    // "Section B: By Vendor". If an expense has a vendorId and is leakage, should it show here?
    // Probably yes for completeness, but the spec separated them. 
    // Valid interpretation: 
    // View A: Breakdown by Category (using Expenses table)
    // View B: Breakdown by Vendor (using VendorInvoices table)

    // Convert to arrays
    const leakageByCategory = Object.entries(leakageByCategoryMap)
        .map(([name, value]) => ({ name, value, percentage: 0 }))
        .sort((a, b) => b.value - a.value);

    // Calc percentages
    leakageByCategory.forEach(item => {
        item.percentage = totalLeakage > 0 ? (item.value / totalLeakage) * 100 : 0;
    });

    const leakageByVendor = Object.entries(leakageByVendorMap)
        .map(([name, value]) => ({ name, value, percentage: 0 }))
        .sort((a, b) => b.value - a.value);

    // Note: totalLeakage is sum of ALL leakage (Expenses + VendorInvoices). 
    // So the percentage basis is the same global leakage? Or local to the view?
    // "Show % of total non-claimable GST". Implies global total.
    leakageByVendor.forEach(item => {
        item.percentage = totalLeakage > 0 ? (item.value / totalLeakage) * 100 : 0;
    });

    return {
        trendChartData,
        rateMixChartData,
        leakage: {
            totalLeakage,
            byCategory: leakageByCategory,
            byVendor: leakageByVendor
        }
    };
}
