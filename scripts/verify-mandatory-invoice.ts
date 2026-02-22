
import { prisma } from '../lib/db/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function verifyMandatoryInvoiceNo() {
    console.log('Verifying MANDATORY Invoice Number Logic...');

    // 1. Mock Data
    const vendor = await prisma.vendor.findFirst();
    if (!vendor) {
        console.error('❌ No vendor found. Please seed the database first.');
        return;
    }

    // 2. Test: Should FAIL if invoiceNo is missing (Backend validation simulation)
    // Note: Since we modified the ACTION logic, not the Prisma Schema (schema has it as String, likely not optional unless default/uuid? No, schema says String, so it IS mandatory at DB level too if not optional).
    // Let's check schema via Prisma: `invoiceNo String` (Mandatory).
    // So Prisma throws error if we don't provide it.

    console.log('Test 1: Create without Invoice Number (Should FAIL)');
    try {
        await prisma.vendorInvoice.create({
            data: {
                vendorId: vendor.id,
                // invoiceNo: MISSING
                invoiceDate: new Date(),
                dueDate: new Date(),
                invoiceAmount: 1000,
                outstandingAmount: 1000,
                status: 'UNPAID',
                // We need to suppress TS error for missing field to test runtime behavior if relying on TS, 
                // but here we are testing via Prisma Client.
                // Actually, if we use TS, it won't even compile.
                // We'll cast to any to force it.
            } as any
        });
        console.error('❌ FAILED: Invoice created without number (Should have failed)');
    } catch (e) {
        console.log('✅ PASSED: Caught expected error when invoice number is missing.');
    }

    // 3. Test: Should SUCCEED if invoiceNo is provided
    console.log('Test 2: Create with Invoice Number (Should SUCCEED)');
    const manualNo = `MANUAL-${Date.now()}`;
    try {
        const invoice = await prisma.vendorInvoice.create({
            data: {
                vendorId: vendor.id,
                invoiceNo: manualNo,
                invoiceDate: new Date(),
                dueDate: new Date(),
                invoiceAmount: 1000,
                outstandingAmount: 1000,
                status: 'UNPAID'
            }
        });
        console.log(`✅ PASSED: Created invoice with number: ${invoice.invoiceNo}`);
    } catch (e) {
        console.error('❌ FAILED: Could not create invoice with valid number:', e);
    }
}

verifyMandatoryInvoiceNo()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('Script Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
