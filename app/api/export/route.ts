import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db/prisma'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getNextNDays, getDateRangeFromPreset } from '@/lib/utils/date'

// Hard limit for rows to prevent memory issues
const MAX_ROWS = 5000

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'excel' | 'pdf'
    const entity = searchParams.get('entity') // 'customers' | 'invoices' | 'collection'
    const q = searchParams.get('q') || ''

    if (!type || !entity) {
        return NextResponse.json({ error: 'Missing type or entity' }, { status: 400 })
    }

    let data: any[] = []
    let columns: { header: string, key: string, width?: number }[] = []
    let title = ''

    try {
        // --- QUERY LOGIC ---
        if (entity === 'customers') {
            title = 'Customers Report'
            const whereClause: any = q ? {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q, mode: 'insensitive' } },
                    { location: { contains: q, mode: 'insensitive' } },
                ],
            } : {}

            data = await prisma.customer.findMany({
                where: whereClause,
                include: {
                    invoices: {
                        select: {
                            dueDate: true,
                            outstandingAmount: true,
                            status: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: MAX_ROWS,
            })

            // Transform for Export
            data = data.map((c: any) => {
                const invoices = c.invoices || []
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                let status = 'New'
                if (invoices.length > 0) {
                    const hasOverdue = invoices.some((inv: any) => inv.outstandingAmount > 0 && new Date(inv.dueDate) < today)
                    const totalOutstanding = invoices.reduce((sum: number, inv: any) => sum + inv.outstandingAmount, 0)
                    if (hasOverdue) status = 'Overdue'
                    else if (totalOutstanding > 0) status = 'Pending'
                    else status = 'Paid'
                }

                return {
                    name: c.name,
                    status,
                    phone: c.phone || '-',
                    location: c.location || '-',
                    email: c.email || '-',
                    creditTerms: c.creditTerms ? `${c.creditTerms} days` : '-',
                    createdAt: new Date(c.createdAt).toLocaleDateString()
                }
            })

            columns = [
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Phone', key: 'phone', width: 15 },
                { header: 'Location', key: 'location', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Credit Terms', key: 'creditTerms', width: 15 },
                { header: 'Created', key: 'createdAt', width: 15 },
            ]

        } else if (entity === 'invoices') {
            title = 'Invoices Report'
            const status = searchParams.get('status') || ''
            const invoiceDateRange = searchParams.get('invoiceDateRange') || ''
            const dueDateRange = searchParams.get('dueDateRange') || ''

            const whereClause: any = { AND: [] }

            // ... Replicating Invoice Filter Logic ...
            if (invoiceDateRange) {
                const range = getDateRangeFromPreset(invoiceDateRange)
                if (range) whereClause.AND.push({ invoiceDate: { gte: range.startDate, lte: range.endDate } })
            }
            if (dueDateRange) {
                const range = getDateRangeFromPreset(dueDateRange)
                if (range) whereClause.AND.push({ dueDate: { gte: range.startDate, lte: range.endDate } })
            }

            if (q) {
                whereClause.AND.push({
                    OR: [
                        { invoiceNo: { contains: q, mode: 'insensitive' } },
                        { customer: { name: { contains: q, mode: 'insensitive' } } },
                        { customer: { location: { contains: q, mode: 'insensitive' } } },
                    ],
                })
            }

            // Status Logic for Filter (Pre-fetching filter)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (status) {
                const statusUpper = status.toUpperCase()
                if (statusUpper === 'PAID') whereClause.AND.push({ outstandingAmount: 0 })
                else if (statusUpper === 'OVERDUE') whereClause.AND.push({ outstandingAmount: { gt: 0 }, dueDate: { lt: today } })
                else if (statusUpper === 'PARTIAL') whereClause.AND.push({ outstandingAmount: { gt: 0 }, paidAmount: { gt: 0 }, dueDate: { gte: today } })
                else if (statusUpper === 'UNPAID') whereClause.AND.push({ outstandingAmount: { gt: 0 }, paidAmount: 0, dueDate: { gte: today } })
            }

            data = await prisma.invoice.findMany({
                where: whereClause,
                include: { customer: true },
                orderBy: { dueDate: 'asc' },
                take: MAX_ROWS,
            })

            // Transform
            data = data.map((inv: any) => {
                const isOverdue = inv.outstandingAmount > 0 && new Date(inv.dueDate) < today
                let displayStatus = 'UNPAID'
                if (inv.outstandingAmount === 0) displayStatus = 'PAID'
                else if (isOverdue) displayStatus = 'OVERDUE'
                else if (inv.paidAmount > 0) displayStatus = 'PARTIAL'

                return {
                    invoiceNo: inv.invoiceNo,
                    customer: inv.customer.name,
                    location: inv.customer.location || '-',
                    invoiceDate: new Date(inv.invoiceDate).toLocaleDateString(),
                    dueDate: new Date(inv.dueDate).toLocaleDateString(),
                    amount: inv.invoiceAmount,
                    outstanding: inv.outstandingAmount,
                    status: displayStatus
                }
            })

            columns = [
                { header: 'Invoice #', key: 'invoiceNo', width: 15 },
                { header: 'Customer', key: 'customer', width: 25 },
                { header: 'Location', key: 'location', width: 20 },
                { header: 'Inv Date', key: 'invoiceDate', width: 15 },
                { header: 'Due Date', key: 'dueDate', width: 15 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Outstanding', key: 'outstanding', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
            ]

        } else if (entity === 'collection') {
            title = 'Collection Queue Report'
            const status = searchParams.get('status') || ''
            const nextFollowUpStart = searchParams.get('nextFollowUpStart')
            const nextFollowUpEnd = searchParams.get('nextFollowUpEnd')
            const dueDateStart = searchParams.get('dueDateStart')
            const dueDateEnd = searchParams.get('dueDateEnd')

            const today = getNextNDays(7).now
            today.setHours(0, 0, 0, 0)
            const next7Days = getNextNDays(7).future

            // Base Clause
            const whereClause: any = {
                AND: [
                    { invoice: { outstandingAmount: { gt: 0 } } },
                ],
            }

            // Date filters
            const hasDateFilters = nextFollowUpStart || nextFollowUpEnd || dueDateStart || dueDateEnd
            if (hasDateFilters) {
                if (nextFollowUpStart || nextFollowUpEnd) {
                    const dateFilter: any = {}
                    if (nextFollowUpStart) dateFilter.gte = new Date(nextFollowUpStart)
                    if (nextFollowUpEnd) dateFilter.lte = new Date(nextFollowUpEnd)
                    whereClause.AND.push({ followUpDate: dateFilter })
                }
                if (dueDateStart || dueDateEnd) {
                    const dateFilter: any = {}
                    if (dueDateStart) dateFilter.gte = new Date(dueDateStart)
                    if (dueDateEnd) dateFilter.lte = new Date(dueDateEnd)
                    whereClause.AND.push({ invoice: { dueDate: dateFilter } })
                }
            } else {
                whereClause.AND.push({
                    OR: [
                        { followUpDate: { lte: next7Days } },
                        { invoice: { dueDate: { lt: today } } },
                    ],
                })
            }

            if (q) {
                whereClause.AND.push({
                    invoice: {
                        customer: {
                            OR: [
                                { name: { contains: q, mode: 'insensitive' } },
                                { location: { contains: q, mode: 'insensitive' } }
                            ]
                        }
                    }
                })
            }

            if (status) {
                whereClause.AND.push({ status: { equals: status, mode: 'insensitive' } })
            }

            data = await prisma.followUp.findMany({
                where: whereClause,
                include: {
                    invoice: { include: { customer: true } }
                },
                orderBy: [{ followUpDate: 'asc' }, { createdAt: 'desc' }],
                take: MAX_ROWS,
            })

            // Transform
            data = data.map((fu: any) => {
                const inv = fu.invoice
                const displayDate = fu.status === 'SCHEDULED' ? fu.followUpDate : fu.nextFollowUpOn

                return {
                    customer: inv.customer.name,
                    location: inv.customer.location || '-',
                    invoiceNo: inv.invoiceNo,
                    outstanding: inv.outstandingAmount,
                    dueDate: new Date(inv.dueDate).toLocaleDateString(),
                    method: fu.method,
                    status: fu.status,
                    nextFollowUp: displayDate ? new Date(displayDate).toLocaleDateString() : '-',
                    // Truncate notes/message if needed, or include simple reminder
                    // The UI shows generated message, here we might not generate it dynamicall per row if costly?
                    // The prompt said "based on users selected filter... data". 
                    // I'll leave reminder message out for brevity or add it if user insists later.
                    // Actually, let's include 'notes' if any.
                    notes: fu.notes || ''
                }
            })

            columns = [
                { header: 'Customer', key: 'customer', width: 20 },
                { header: 'Location', key: 'location', width: 15 },
                { header: 'Invoice #', key: 'invoiceNo', width: 15 },
                { header: 'Outstanding', key: 'outstanding', width: 15 },
                { header: 'Due Date', key: 'dueDate', width: 15 },
                { header: 'Method', key: 'method', width: 10 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Next F/U', key: 'nextFollowUp', width: 15 },
                { header: 'Notes', key: 'notes', width: 30 },
            ]
        } else if (entity === 'vendors') {
            title = 'Vendors Report'
            const whereClause: any = q ? {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q, mode: 'insensitive' } },
                ],
            } : {}

            data = await prisma.vendor.findMany({
                where: whereClause,
                include: {
                    invoices: {
                        select: {
                            dueDate: true,
                            outstandingAmount: true,
                            status: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: MAX_ROWS,
            })

            data = data.map((v: any) => {
                const invoices = v.invoices || []
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                let status = 'New'
                if (invoices.length > 0) {
                    const hasOverdue = invoices.some((inv: any) => inv.outstandingAmount > 0 && new Date(inv.dueDate) < today)
                    const totalOutstanding = invoices.reduce((sum: number, inv: any) => sum + inv.outstandingAmount, 0)
                    if (hasOverdue) status = 'Overdue'
                    else if (totalOutstanding > 0) status = 'Pending'
                    else status = 'Paid'
                }
                return {
                    name: v.name,
                    status,
                    phone: v.phone || '-',
                    email: v.email || '-',
                    creditTerms: v.creditTerms ? `${v.creditTerms} days` : '-',
                    createdAt: new Date(v.createdAt).toLocaleDateString()
                }
            })

            columns = [
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Phone', key: 'phone', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Credit Terms', key: 'creditTerms', width: 15 },
                { header: 'Created', key: 'createdAt', width: 15 },
            ]

        } else if (entity === 'expenses') {
            title = 'Expenses Report'
            const expenseDateRange = searchParams.get('expenseDateRange') || ''
            const paymentMode = searchParams.get('paymentMode') || ''
            const whereClause: any = { AND: [] }

            if (q) {
                whereClause.AND.push({
                    OR: [
                        { category: { name: { contains: q, mode: 'insensitive' } } },
                        { vendor: { name: { contains: q, mode: 'insensitive' } } },
                        { notes: { contains: q, mode: 'insensitive' } },
                    ]
                })
            }
            if (expenseDateRange) {
                const range = getDateRangeFromPreset(expenseDateRange)
                if (range) whereClause.AND.push({ expenseDate: { gte: range.startDate, lte: range.endDate } })
            }
            if (paymentMode) whereClause.AND.push({ paymentMode })

            data = await prisma.expense.findMany({
                where: whereClause,
                include: { category: true, vendor: true },
                orderBy: { expenseDate: 'desc' },
                take: MAX_ROWS,
            })

            data = data.map((e: any) => ({
                date: new Date(e.expenseDate).toLocaleDateString(),
                category: e.category.name,
                vendor: e.vendor?.name || '-',
                amount: e.amount,
                mode: e.paymentMode,
                notes: e.notes || '-'
            }))

            columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Vendor', key: 'vendor', width: 20 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Mode', key: 'mode', width: 15 },
                { header: 'Notes', key: 'notes', width: 30 },
            ]

        } else if (entity === 'vendor-invoices' || entity === 'supplier-invoices') {
            title = 'Vendor Invoices Report'
            const status = searchParams.get('status') || ''
            const dueDateRange = searchParams.get('dueDateRange') || ''
            const whereClause: any = { AND: [] }

            if (q) {
                whereClause.AND.push({
                    OR: [
                        { invoiceNo: { contains: q, mode: 'insensitive' } },
                        { vendor: { name: { contains: q, mode: 'insensitive' } } },
                    ]
                })
            }

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (status) {
                const statusUpper = status.toUpperCase()
                if (statusUpper === 'PAID') whereClause.AND.push({ outstandingAmount: 0 })
                else if (statusUpper === 'OVERDUE') whereClause.AND.push({ outstandingAmount: { gt: 0 }, dueDate: { lt: today } })
                else if (statusUpper === 'PARTIAL') whereClause.AND.push({ outstandingAmount: { gt: 0 }, paidAmount: { gt: 0 }, dueDate: { gte: today } })
                else if (statusUpper === 'UNPAID') whereClause.AND.push({ outstandingAmount: { gt: 0 }, paidAmount: 0, dueDate: { gte: today } })
            }

            if (dueDateRange) {
                const range = getDateRangeFromPreset(dueDateRange)
                if (range) whereClause.AND.push({ dueDate: { gte: range.startDate, lte: range.endDate } })
            }

            data = await prisma.vendorInvoice.findMany({
                where: whereClause,
                include: { vendor: true },
                orderBy: { dueDate: 'asc' },
                take: MAX_ROWS,
            })

            data = data.map((inv: any) => {
                const isOverdue = inv.outstandingAmount > 0 && new Date(inv.dueDate) < today
                let displayStatus = 'UNPAID'
                if (inv.outstandingAmount === 0) displayStatus = 'PAID'
                else if (isOverdue) displayStatus = 'OVERDUE'
                else if (inv.paidAmount > 0) displayStatus = 'PARTIAL'

                return {
                    invoiceNo: inv.invoiceNo,
                    vendor: inv.vendor.name,
                    invoiceDate: new Date(inv.invoiceDate).toLocaleDateString(),
                    dueDate: new Date(inv.dueDate).toLocaleDateString(),
                    amount: inv.invoiceAmount,
                    outstanding: inv.outstandingAmount,
                    status: displayStatus
                }
            })

            columns = [
                { header: 'Invoice #', key: 'invoiceNo', width: 15 },
                { header: 'Vendor', key: 'vendor', width: 25 },
                { header: 'Inv Date', key: 'invoiceDate', width: 15 },
                { header: 'Due Date', key: 'dueDate', width: 15 },
                { header: 'Amount', key: 'amount', width: 15 },
                { header: 'Outstanding', key: 'outstanding', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
            ]
        }

        // --- GENERATION LOGIC ---

        // Header Info
        const timestamp = new Date().toLocaleString()
        const printedBy = `Printed by: ${session.user?.name || session.user?.email} on ${timestamp}`

        if (type === 'excel') {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Report')


            // Add Headers
            worksheet.columns = columns
            worksheet.getRow(1).font = { bold: true }

            // Add Rows
            data.forEach(item => {
                worksheet.addRow(item)
            })

            // Buffer
            const buffer = await workbook.xlsx.writeBuffer()

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx"`
                }
            })

        } else if (type === 'pdf') {
            // Using jsPDF
            const doc = new jsPDF()

            // Title
            doc.setFontSize(16)
            doc.text(title, 14, 20)

            // Printed Info
            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(printedBy, 14, 28)

            // Table
            const tableBody = data.map(item => columns.map(col => String(item[col.key] || '')))
            const tableHeaders = columns.map(col => col.header)

            autoTable(doc, {
                startY: 35,
                head: [tableHeaders],
                body: tableBody,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] }
            })

            // Output
            const arrayBuffer = doc.output('arraybuffer')

            return new NextResponse(arrayBuffer as ArrayBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}_${Date.now()}.pdf"`
                }
            })
        }

    } catch (error) {
        console.error('Export Error:', error)
        return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Invalid Request' }, { status: 400 })
}
