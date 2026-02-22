import { prisma } from '@/lib/db/prisma';
import { getNextNDays } from '@/lib/utils/date';
import { getCustomerRiskSummary } from '@/lib/analytics/customerRisk';
import { getDaysOverdue, getAgingBucket } from '@/lib/utils/aging';

export interface DateRange {
    from: Date;
    to: Date;
}

export async function getDashboardData(range?: DateRange) {
    // Default to Next 30 Days if no range provided
    const defaultRange = getNextNDays(30);
    const from = range?.from || new Date(); // Today
    const to = range?.to || defaultRange.future;

    // Ensure 'to' is end of day for inclusive filtering
    const toEndOfDay = new Date(to);
    toEndOfDay.setHours(23, 59, 59, 999);

    const fromStartOfDay = new Date(from);
    fromStartOfDay.setHours(0, 0, 0, 0);

    // ============================================
    // 1. CASH-IN SNAPSHOT (FILTERED BY DATE)
    // ============================================

    // Filter Invoices by Date Range
    const invoices = await prisma.invoice.findMany({
        where: {
            invoiceDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            }
        },
        include: { customer: true },
    });

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    const agingBuckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const customerOverdueMap: Record<string, { customerName: string; amount: number }> = {};

    for (const inv of invoices) {
        totalInvoiced += inv.invoiceAmount;
        // Logic Note: Paid Amount usually checked against Payment Entries for *when* it was paid.
        // However, standard dashboard "Invoiced vs Collected" in a date range often means:
        // "Invoices created in this range" and "How much of THOSE is collected".
        // OR "Total Collections received in this range" (regardless of invoice date).
        // Given the user wants "Global Applicability", the standard accounting interaction is:
        // - Invoiced: Sum of invoices created in period.
        // - Collected: Sum of payments received in period. << This requires a separate query on PaymentEntry
        // - Outstanding: Sum of outstanding on invoices created in period? OR Current Total Outstanding?
        // Let's stick to "Invoices Created In Period" for now for simplicity of "Snapshot of Business Generated".

        totalCollected += inv.paidAmount; // This is collected *for these invoices*
        totalOutstanding += inv.outstandingAmount;

        if (inv.outstandingAmount > 0) {
            const daysOverdue = getDaysOverdue(inv.dueDate);

            if (daysOverdue > 0) {
                totalOverdue += inv.outstandingAmount;

                const bucket = getAgingBucket(daysOverdue);
                if (bucket !== 'CURRENT') {
                    agingBuckets[bucket] += inv.outstandingAmount;
                }

                if (!customerOverdueMap[inv.customerId]) {
                    customerOverdueMap[inv.customerId] = {
                        customerName: inv.customer.name,
                        amount: 0,
                    };
                }
                customerOverdueMap[inv.customerId].amount += inv.outstandingAmount;
            }
        }
    }

    // Overwrite Total Collected with ACTUAL Collections in this period? 
    // If we want "Cash Flow", yes. "Payment Collected" tile usually implies cash in hand during period.
    const actualCollections = await prisma.paymentEntry.aggregate({
        _sum: { amount: true },
        where: {
            paymentDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            }
        }
    });
    totalCollected = actualCollections._sum.amount || 0;


    const topDefaulters = Object.values(customerOverdueMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    const overdueCustomersCount = Object.keys(customerOverdueMap).length;


    // ============================================
    // 2. CASH-OUT & NET CASH (FILTERED BY DATE)
    // ============================================

    const expenses = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
            expenseDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            }
        }
    });
    const totalExpenseAmount = expenses._sum.amount || 0;

    const vendorPayments = await prisma.vendorPayment.aggregate({
        _sum: { amount: true },
        where: {
            paymentDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            }
        }
    });
    const totalVendorPaymentAmount = vendorPayments._sum.amount || 0;

    const totalCashOut = totalExpenseAmount + totalVendorPaymentAmount;
    const netCashPosition = totalCollected - totalCashOut; // Cash In (Period) - Cash Out (Period)


    // ============================================
    // 3. VENDOR PAYABLES (FILTERED BY DATE - Invoices generated)
    // ============================================
    const vendorInvoices = await prisma.vendorInvoice.findMany({
        where: {
            invoiceDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            }
        }
    });

    let totalVendorOutstanding = 0;
    let totalVendorOverdue = 0;

    for (const vinv of vendorInvoices) {
        totalVendorOutstanding += vinv.outstandingAmount;
        if (vinv.outstandingAmount > 0) {
            const isOverdue = new Date() > vinv.dueDate;
            if (isOverdue) {
                totalVendorOverdue += vinv.outstandingAmount;
            }
        }
    }

    // ============================================
    // 4. SMART CASH FLOW (ACTUALS + PROJECTIONS)
    // ============================================

    // Split range into Past (< Today) and Future (>= Today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let pastInflows = 0;
    let pastOutflows = 0;
    let futureInflows = 0;
    let futureOutflows = 0;

    // --- PAST: ACTUALS ---
    if (fromStartOfDay < todayStart) {
        const pastEnd = toEndOfDay < todayStart ? toEndOfDay : new Date(todayStart.getTime() - 1);

        // Collections (In)
        const collections = await prisma.paymentEntry.aggregate({
            _sum: { amount: true },
            where: {
                paymentDate: {
                    gte: fromStartOfDay,
                    lte: pastEnd
                }
            }
        });
        pastInflows = collections._sum.amount || 0;

        // Expenses + VendorPayments (Out)
        const expenseSum = await prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
                expenseDate: {
                    gte: fromStartOfDay,
                    lte: pastEnd
                }
            }
        });
        const vendorPaymentSum = await prisma.vendorPayment.aggregate({
            _sum: { amount: true },
            where: {
                paymentDate: {
                    gte: fromStartOfDay,
                    lte: pastEnd
                }
            }
        });
        pastOutflows = (expenseSum._sum.amount || 0) + (vendorPaymentSum._sum.amount || 0);
    }

    // --- FUTURE: PROJECTIONS ---
    if (toEndOfDay >= todayStart) {
        const futureStart = fromStartOfDay > todayStart ? fromStartOfDay : todayStart;

        // Expected Inflows (Customer Invoices Due)
        const expectedIn = await prisma.invoice.aggregate({
            _sum: { outstandingAmount: true },
            where: {
                outstandingAmount: { gt: 0 },
                dueDate: {
                    gte: futureStart,
                    lte: toEndOfDay
                }
            }
        });
        futureInflows = expectedIn._sum.outstandingAmount || 0;

        // Expected Outflows (Vendor Invoices Due)
        const expectedOut = await prisma.vendorInvoice.aggregate({
            _sum: { outstandingAmount: true },
            where: {
                outstandingAmount: { gt: 0 },
                dueDate: {
                    gte: futureStart,
                    lte: toEndOfDay
                }
            }
        });
        futureOutflows = expectedOut._sum.outstandingAmount || 0;
    }

    const totalInflows = pastInflows + futureInflows;
    const totalOutflows = pastOutflows + futureOutflows;
    const netCashFlow = totalInflows - totalOutflows;

    // ============================================
    // 5. OPERATIONAL (Follow-ups & Risk)
    // ============================================

    // Follow-ups falling in the requested range
    const upcomingFollowups = await prisma.followUp.findMany({
        where: {
            nextFollowUpOn: {
                not: null,
                gte: fromStartOfDay,
                lte: toEndOfDay,
            },
            invoice: {
                outstandingAmount: { gt: 0 },
            },
        },
        include: {
            invoice: {
                include: { customer: true },
            },
        },
        orderBy: { nextFollowUpOn: 'asc' },
        take: 10,
    });

    const latestByInvoice = new Map<string, typeof upcomingFollowups[0]>()
    for (const fu of upcomingFollowups) {
        if (!latestByInvoice.has(fu.invoiceId)) {
            latestByInvoice.set(fu.invoiceId, fu)
        }
    }
    const upcomingUnique = Array.from(latestByInvoice.values());

    const riskSummary = await getCustomerRiskSummary();
    const highRiskCustomers = riskSummary.filter((c) => c.risk === 'HIGH');

    // ============================================
    // 6. GST INSIGHTS (NEW)
    // ============================================

    // 1. GST Collected (Output GST) -> From Sales Invoices
    const gstCollectedAgg = await prisma.invoice.aggregate({
        _sum: { gstAmount: true },
        where: {
            invoiceDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            },
            gstAmount: { not: null }
        }
    });
    const gstCollected = gstCollectedAgg._sum.gstAmount || 0;

    // 2. GST Paid (Input GST) -> Vendor Invoices + Expenses

    // Vendor Invoices
    // fetching all to aggregate in JS to avoid TS groupBy issues with optional fields
    const vendorInvoicesGst = await prisma.vendorInvoice.findMany({
        where: {
            invoiceDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            },
            gstAmount: { not: null }
        },
        select: {
            gstAmount: true,
            isGstEligible: true
        }
    });

    // Expenses
    const expensesGst = await prisma.expense.findMany({
        where: {
            expenseDate: {
                gte: fromStartOfDay,
                lte: toEndOfDay
            },
            gstAmount: { not: null }
        },
        select: {
            gstAmount: true,
            isGstEligible: true
        }
    });

    let gstPaidClaimable = 0;
    let gstPaidNonClaimable = 0;

    // Process Vendor Invoices
    for (const inv of vendorInvoicesGst) {
        if (inv.isGstEligible) {
            gstPaidClaimable += (inv.gstAmount || 0);
        } else {
            gstPaidNonClaimable += (inv.gstAmount || 0);
        }
    }

    // Process Expenses
    for (const exp of expensesGst) {
        if (exp.isGstEligible) {
            gstPaidClaimable += (exp.gstAmount || 0);
        } else {
            gstPaidNonClaimable += (exp.gstAmount || 0);
        }
    }

    // 4. Net GST Payable
    const netGstPayable = gstCollected - gstPaidClaimable;

    // ============================================
    // 7. GST CASHFLOW INSIGHTS (PHASE 2)
    // ============================================

    // 5. GST Cash Blocked (From Customer Invoices)
    // Logic: (gstAmount / (invoiceAmount + gstAmount)) * outstandingAmount
    let gstCashBlocked = 0;
    for (const inv of invoices) {
        // Only consider invoices with GST and Outstanding > 0
        if (inv.gstAmount && inv.gstAmount > 0 && inv.outstandingAmount > 0) {
            const totalInvAmount = inv.invoiceAmount + inv.gstAmount;
            if (totalInvAmount > 0) {
                const gstRatio = inv.gstAmount / totalInvAmount;
                gstCashBlocked += (gstRatio * inv.outstandingAmount);
            }
        }
    }

    // 6. GST Credit Pending (From Vendor Invoices)
    // Logic: SUM(gstAmount) where outstanding > 0 and eligible
    // We need to iterate over 'vendorInvoices' fetched earlier (Variable 'vendorInvoices' from Section 3)
    // Check if 'vendorInvoices' from Section 3 SELECTS gstAmount!
    // In Section 3, we did: const vendorInvoices = await prisma.vendorInvoice.findMany(...) without select, so it has all fields.
    // However, Prisma types might be tricky if we don't ensure it references the model correctly.
    // Let's assume 'vendorInvoices' has gstAmount.

    let gstCreditPending = 0;
    for (const vinv of vendorInvoices) {
        if (vinv.outstandingAmount > 0 && vinv.isGstEligible && vinv.gstAmount && vinv.gstAmount > 0) {
            gstCreditPending += vinv.gstAmount;
        }
    }


    return {
        snapshot: {
            totalInvoiced,
            totalCollected,
            totalOutstanding,
            totalOverdue,
            overdueCustomersCount
        },
        cashOut: {
            totalCashOut,
            netCashPosition,
            vendorPayables: totalVendorOutstanding,
            vendorOverdue: totalVendorOverdue
        },
        cashFlow: {
            pastInflows,
            pastOutflows,
            futureInflows,
            futureOutflows,
            totalInflows,
            totalOutflows,
            net: netCashFlow,
        },
        operational: {
            upcomingFollowups: upcomingUnique,
            highRiskCustomers,
            agingBuckets,
            topDefaulters
        },
        gstStats: {
            gstCollected,
            gstPaidClaimable,
            gstPaidNonClaimable,
            netGstPayable,
            // Phase 2
            gstCashBlocked,
            gstCreditPending
        }
    };
}
