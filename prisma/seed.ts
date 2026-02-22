import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// --- Helpers ---

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const getRandomFloat = (min: number, max: number, decimals: number = 2) => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
};

// --- Data Constants ---

const COMPANY_NAMES = [
    "Acme Corp", "Globex Corporation", "Soylent Corp", "Initech",
    "Umbrella Corp", "Stark Industries", "Wayne Enterprises",
    "Cyberdyne Systems", "Massive Dynamic", "Hooli",
    "Vehement Capital", "Prestige Worldwide", "Dunder Mifflin",
    "Aperture Science", "Black Mesa"
];

const VENDOR_NAMES = [
    "Office Depot", "Tech Supplies Inc", "City Properties (Rent)",
    "Power Grid Co", "Fast Logistics", "Raw Materials Ltd",
    "ABC Consultants", "Global Internet Services", "Clean & Shine Services"
];

const EXPENSE_CATEGORIES = [
    'Raw Materials / Purchases',
    'Supplier Payments',
    'Salaries & Wages',
    'Rent / Lease',
    'Utilities',
    'Transport & Logistics',
    'Packaging & Consumables',
    'Loan EMI / Interest',
    'Taxes & Statutory',
    'Maintenance & Repairs',
    'Marketing & Advertising',
    'Professional Fees',
    'Office Expenses',
    'Miscellaneous',
];

const NAMES = [
    "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown",
    "Charlie Davis", "Diana Evans", "Ethan Ford", "Fiona Green",
    "George Harris", "Hannah Ian", "Ian Jenkins", "Karen Kelly"
];

const CITIES = [
    "New York", "London", "Mumbai", "Delhi", "Bangalore",
    "Singapore", "Dubai", "Toronto", "Sydney", "Berlin",
    "San Francisco", "Tokyo", "Paris", "Chicago", "Boston"
];

const GST_RATES = [0, 5, 12, 18, 28];

// --- Main Seeding Logic ---

async function main() {
    console.log('Start seeding ...');

    // 1. Cleanup existing data (Order matters for foreign keys)


    // ... imports

    // ... existing code ...

    console.log('Cleaning up old data...');
    // Cash In
    await prisma.paymentEntry.deleteMany({});
    await prisma.followUp.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.customer.deleteMany({});

    // Cash Out
    await prisma.vendorPayment.deleteMany({});
    await prisma.vendorInvoice.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.expenseCategory.deleteMany({});
    await prisma.vendor.deleteMany({});

    // Users
    await prisma.user.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
        data: [
            {
                name: "Admin User",
                email: "test@email.com",
                password: hashedPassword,
                role: "OWNER"
            },
            {
                name: "Accounts Manager",
                email: "accounts@msme.com",
                password: hashedPassword,
                role: "ACCOUNTS"
            },
            {
                name: "Sales Executive",
                email: "sales@msme.com",
                password: hashedPassword,
                role: "SALES"
            }
        ]
    });
    console.log('Created test users.');

    const customers = [];

    // 2. Create Customers
    for (let i = 0; i < 20; i++) {
        const isCompany = Math.random() > 0.3;
        const name = isCompany ? getRandomElement(COMPANY_NAMES) + ` ${i}` : getRandomElement(NAMES) + ` ${i}`;

        customers.push(await prisma.customer.create({
            data: {
                name: name,
                email: `contact${i}@${name.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '').toLowerCase()}.com`,
                phone: `98765${getRandomInt(10000, 99999)}`,
                location: getRandomElement(CITIES),
                creditTerms: getRandomElement([15, 30, 45, 60]),
            }
        }));
    }
    console.log(`Created ${customers.length} customers.`);

    // 3. Create Invoices (Sales with GST)
    let invoiceCount = 0;
    for (const customer of customers) {
        const numInvoices = getRandomInt(3, 8);
        for (let j = 0; j < numInvoices; j++) {
            const invoiceDate = addDays(new Date(), -getRandomInt(0, 90)); // Past 3 months mainly
            const dueDate = addDays(invoiceDate, customer.creditTerms || 30);
            const today = new Date();
            const isOverdue = dueDate < today;

            // Financials
            const baseAmount = getRandomInt(1000, 50000);
            const gstRate = getRandomElement(GST_RATES);
            const gstAmount = parseFloat((baseAmount * (gstRate / 100)).toFixed(2));
            const totalAmount = baseAmount + gstAmount;

            // Status Logic
            let status = 'UNPAID';
            let paidAmount = 0;
            const scenario = Math.random();

            if (scenario < 0.3) {
                status = 'PAID';
                paidAmount = totalAmount; // User pays full including GST
            }
            else if (scenario < 0.6) {
                status = isOverdue ? 'OVERDUE' : 'UNPAID';
                paidAmount = 0;
            }
            else if (scenario < 0.7) {
                status = 'PARTIAL';
                paidAmount = getRandomInt(100, Math.floor(totalAmount - 100));
            }
            else {
                status = isOverdue ? 'OVERDUE' : 'UNPAID';
            }

            if (paidAmount >= totalAmount) status = 'PAID';
            else if (paidAmount > 0) status = 'PARTIAL';
            else if (isOverdue) status = 'OVERDUE';

            const invoice = await prisma.invoice.create({
                data: {
                    customerId: customer.id,
                    invoiceNo: `INV-${new Date().getFullYear()}-${getRandomInt(1000, 9999)}-${invoiceCount}`,
                    invoiceDate: invoiceDate,
                    dueDate: dueDate,

                    invoiceAmount: baseAmount,
                    gstAmount: gstAmount,
                    gstRate: gstRate,
                    isGstInclusive: false,

                    paidAmount: paidAmount,
                    outstandingAmount: totalAmount - paidAmount,
                    status: status,
                }
            });
            invoiceCount++;

            if (paidAmount > 0) {
                await prisma.paymentEntry.create({
                    data: {
                        invoiceId: invoice.id,
                        amount: paidAmount,
                        paymentDate: addDays(invoiceDate, getRandomInt(1, 10)),
                        method: getRandomElement(['UPI', 'BANK', 'CASH', 'CHEQUE']),
                        reference: `REF-${getRandomInt(10000, 99999)}`,
                        notes: "Seed payment"
                    }
                });
            }

            if (status === 'OVERDUE' || status === 'PARTIAL') {
                await prisma.followUp.create({
                    data: {
                        invoiceId: invoice.id,
                        followUpDate: addDays(today, getRandomInt(1, 5)),
                        method: 'CALL',
                        status: 'SCHEDULED',
                        notes: "Scheduled follow up call.",
                    }
                });
            }
        }
    }
    console.log(`Created ${invoiceCount} customer invoices.`);


    // --- CASH OUT SEEDING ---

    // 4. Create Vendors
    const vendors = [];
    for (const vName of VENDOR_NAMES) {
        vendors.push(await prisma.vendor.create({
            data: {
                name: vName,
                email: `info@${vName.split(' ')[0].toLowerCase()}.com`,
                phone: `99887${getRandomInt(10000, 99999)}`,
                creditTerms: getRandomElement([15, 30, 45]),
                notes: "Prime vendor"
            }
        }));
    }
    console.log(`Created ${vendors.length} vendors.`);

    // 5. Create Expense Categories
    const categories = [];
    for (const catName of EXPENSE_CATEGORIES) {
        categories.push(await prisma.expenseCategory.create({
            data: { name: catName }
        }));
    }
    console.log(`Created ${categories.length} expense categories.`);

    // 6. Create Expenses (Immediate Cash Out)
    let expenseCount = 0;
    for (let i = 0; i < 40; i++) {
        const cat = getRandomElement(categories);
        const relatedVendor = Math.random() > 0.5 ? getRandomElement(vendors) : null;

        // Financials
        const baseAmount = getRandomInt(500, 15000);
        const gstRate = getRandomElement(GST_RATES);
        const gstAmount = parseFloat((baseAmount * (gstRate / 100)).toFixed(2));

        // GST Eligibility (Claimable vs Blocked)
        // 80% Eligible, 20% Blocked
        const isGstEligible = Math.random() < 0.8;

        await prisma.expense.create({
            data: {
                categoryId: cat.id,
                vendorId: relatedVendor?.id,
                expenseDate: addDays(new Date(), -getRandomInt(0, 60)),
                amount: baseAmount,

                gstAmount: gstAmount,
                gstRate: gstRate,
                isGstInclusive: false,
                isGstEligible: isGstEligible,

                paymentMode: getRandomElement(['CASH', 'UPI', 'BANK']),
                notes: `Payment for ${cat.name}`
            }
        });
        expenseCount++;
    }
    console.log(`Created ${expenseCount} expenses.`);

    // 7. Create Vendor Invoices (Payables)
    let vendorInvoiceCount = 0;
    for (const vendor of vendors) {
        const numInvoices = getRandomInt(2, 6);

        for (let k = 0; k < numInvoices; k++) {
            const invoiceDate = addDays(new Date(), -getRandomInt(0, 90));
            const dueDate = addDays(invoiceDate, vendor.creditTerms || 30);
            const today = new Date();
            const isOverdue = dueDate < today;

            // Financials
            const baseAmount = getRandomInt(2000, 70000);
            const gstRate = getRandomElement(GST_RATES);
            // Vendor invoices usually have GST
            const gstAmount = parseFloat((baseAmount * (gstRate / 100)).toFixed(2));
            const totalAmount = baseAmount + gstAmount;

            const isGstEligible = Math.random() < 0.9; // 90% claimable for vendors

            // Scenario: 40% Paid, 30% Unpaid, 30% Overdue
            let status = 'UNPAID';
            let paidAmount = 0;
            const scenario = Math.random();

            if (scenario < 0.4) {
                status = 'PAID';
                paidAmount = totalAmount;
            } else if (scenario < 0.7) {
                status = isOverdue ? 'OVERDUE' : 'UNPAID';
                paidAmount = 0;
            } else {
                // Partial
                status = 'PARTIAL';
                paidAmount = getRandomInt(500, Math.floor(totalAmount - 100));
            }

            if (paidAmount >= totalAmount) status = 'PAID';
            else if (paidAmount > 0) status = 'PARTIAL';
            else if (isOverdue) status = 'OVERDUE';

            const vinv = await prisma.vendorInvoice.create({
                data: {
                    vendorId: vendor.id,
                    invoiceNo: `SUP-${vendor.name.substring(0, 3).toUpperCase()}-${getRandomInt(1000, 9999)}`,
                    invoiceDate: invoiceDate,
                    dueDate: dueDate,

                    invoiceAmount: baseAmount,
                    gstAmount: gstAmount,
                    gstRate: gstRate,
                    isGstInclusive: false,
                    isGstEligible: isGstEligible,

                    paidAmount: paidAmount,
                    outstandingAmount: totalAmount - paidAmount,
                    status: status
                }
            });
            vendorInvoiceCount++;

            if (paidAmount > 0) {
                await prisma.vendorPayment.create({
                    data: {
                        vendorInvoiceId: vinv.id,
                        amount: paidAmount,
                        paymentDate: addDays(invoiceDate, getRandomInt(1, 5)),
                        method: getRandomElement(['BANK', 'UPI']),
                        reference: `TXN-${getRandomInt(100000, 999999)}`,
                        notes: "Payment to vendor"
                    }
                });
            }
        }
    }
    console.log(`Created ${vendorInvoiceCount} vendor invoices.`);

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
