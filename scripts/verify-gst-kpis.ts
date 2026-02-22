// @ts-nocheck
import { prisma } from '../lib/db/prisma';

async function getDashboardDataSimulated(range: { from: Date, to: Date }) {
    const fromStartOfDay = range.from;
    const toEndOfDay = range.to;

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

    return {
        gstStats: {
            gstCollected,
            gstPaidClaimable,
            gstPaidNonClaimable,
            netGstPayable
        }
    };
}

async function verifyGstKpis() {
    console.log('--- Starting GST KPI Verification (Self-Contained) ---');

    // Setup: Date Range (Tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Start of Tomorrow
    const from = new Date(tomorrow);
    from.setHours(0, 0, 0, 0);

    // End of Tomorrow
    const to = new Date(tomorrow);
    to.setHours(23, 59, 59, 999);

    console.log(`Test Range: ${from.toISOString()} - ${to.toISOString()}`);

    // Future Date for Due Date (Tomorrow + 30 days)
    const futureDueDate = new Date(tomorrow);
    futureDueDate.setDate(tomorrow.getDate() + 30);

    // 1. Create Customer
    const customer = await prisma.customer.create({
        data: { name: 'Test GST Customer ' + Date.now() }
    });

    // 2. Create Vendor
    const vendor = await prisma.vendor.create({
        data: { name: 'Test GST Vendor ' + Date.now() }
    });

    // 3. Create Expense Category
    const category = await prisma.expenseCategory.create({
        data: { name: 'Test GST Category ' + Date.now() }
    });

    try {
        // --- DATA INJECTION ---

        // A. Sales Invoice (GST Collected)
        // Amount: 1000, GST: 180 (18%)
        await prisma.invoice.create({
            data: {
                invoiceNo: 'TEST-INV-GST-1',
                customerId: customer.id,
                invoiceDate: tomorrow,
                dueDate: futureDueDate,
                invoiceAmount: 1000,
                gstAmount: 180,
                isGstInclusive: false,
                outstandingAmount: 1180,
                status: 'UNPAID',
                paidAmount: 0
            }
        });

        // B. Vendor Invoice (GST Paid - Claimable)
        // Amount: 500, GST: 90 (18%), Eligible: true
        await prisma.vendorInvoice.create({
            data: {
                invoiceNo: 'TEST-V-INV-GST-1',
                vendorId: vendor.id,
                invoiceDate: tomorrow,
                dueDate: futureDueDate,
                invoiceAmount: 500,
                gstAmount: 90,
                isGstEligible: true,
                outstandingAmount: 590,
                status: 'UNPAID'
            }
        });

        // C. Expense (GST Paid - Not Claimable)
        // Amount: 200, GST: 10 (5%), Eligible: false
        await prisma.expense.create({
            data: {
                categoryId: category.id,
                expenseDate: tomorrow,
                amount: 200,
                gstAmount: 10,
                isGstEligible: false,
                paymentMode: 'CASH'
            }
        });

        // D. Expense (GST Paid - Claimable)
        // Amount: 100, GST: 18 (18%), Eligible: true
        await prisma.expense.create({
            data: {
                categoryId: category.id,
                expenseDate: tomorrow,
                amount: 100,
                gstAmount: 18,
                isGstEligible: true,
                paymentMode: 'CASH'
            }
        });


        // --- EXPECTED RESULTS ---
        // GST Collected: 180
        // GST Claimable: 90 (Vendor) + 18 (Expense) = 108
        // GST Non-Claimable: 10 (Expense)
        // Net Payable: 180 - 108 = 72

        console.log('Data inserted. calculating stats...');

        const result = await getDashboardDataSimulated({ from, to });
        const stats = result.gstStats;

        console.log('--- ACTUAL RESULTS ---');
        console.log(JSON.stringify(stats, null, 2));

        console.log('--- VERIFICATION ---');

        const checks = [
            { label: 'GST Collected', actual: stats.gstCollected, expected: 180 },
            { label: 'GST Claimable', actual: stats.gstPaidClaimable, expected: 108 },
            { label: 'GST Non-Claimable', actual: stats.gstPaidNonClaimable, expected: 10 },
            { label: 'Net GST Payable', actual: stats.netGstPayable, expected: 72 },
        ];

        let allPass = true;
        checks.forEach(check => {
            const pass = Math.abs(check.actual - check.expected) < 0.01;
            console.log(`${check.label}: ${pass ? 'PASS' : 'FAIL'} (Expected: ${check.expected}, Actual: ${check.actual})`);
            if (!pass) allPass = false;
        });

        if (allPass) {
            console.log('>>> VERIFICATION SUCCESSFUL <<<');
        } else {
            console.error('>>> VERIFICATION FAILED <<<');
            process.exit(1);
        }

    } catch (e) {
        console.error('Error during verification:', e);
        process.exit(1);
    } finally {
        // Cleanup
        console.log('Cleaning up test data...');
        await prisma.invoice.deleteMany({ where: { invoiceNo: 'TEST-INV-GST-1' } });
        await prisma.vendorInvoice.deleteMany({ where: { invoiceNo: 'TEST-V-INV-GST-1' } });
        await prisma.expense.deleteMany({
            where: {
                categoryId: category.id,
                expenseDate: { gte: from, lte: to }
            }
        });

        await prisma.customer.delete({ where: { id: customer.id } });
        await prisma.vendor.delete({ where: { id: vendor.id } });
        await prisma.expenseCategory.delete({ where: { id: category.id } });

        await prisma.$disconnect();
    }
}

verifyGstKpis();
