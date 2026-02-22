
import { prisma } from '../lib/db/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function verifyOptionalInvoiceNo() {
    console.log('Verifying Optional Invoice Number Logic...');

    // 1. Mock Data
    const vendor = await prisma.vendor.findFirst();
    if (!vendor) {
        console.error('❌ No vendor found. Please seed the database first.');
        return;
    }

    // 2. Simulate Action Logic (Since we can't call server action directly easily, we test the logic principle or reuse the logic if extracted, 
    // but here we just verify that Prisma ALLOWS creation if we generate the ID).
    // Actually, the main logic IS in the action. We can't verify the ACTION itself without a full e2e or unit test of the action.
    // However, we can verify that creating a VendorInvoice via Prisma works with our generated ID format.

    const generatedNo = `VINV-${Date.now()}`;
    console.log(`Testing with generated Invoice No: ${generatedNo}`);

    try {
        const invoice = await prisma.vendorInvoice.create({
            data: {
                vendorId: vendor.id,
                invoiceNo: generatedNo,
                invoiceDate: new Date(),
                dueDate: new Date(),
                invoiceAmount: 1000,
                outstandingAmount: 1000,
                status: 'UNPAID'
            }
        });
        console.log('✅ Successfully created Vendor Invoice with generated number:', invoice.invoiceNo);
    } catch (e) {
        console.error('❌ Failed to create invoice:', e);
    }
}

verifyOptionalInvoiceNo()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error('Error Name:', e.name);
        console.error('Error Message:', e.message);
        if (e.meta) console.error('Error Meta:', e.meta);
        await prisma.$disconnect();
        process.exit(1);
    });
