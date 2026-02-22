'use server'

import { prisma } from '@/lib/db/prisma'
import { calculateGstAmounts } from '@/lib/utils/invoice'
import { revalidatePath } from 'next/cache'

export type InvoiceFormState = {
  error?: string
  success?: boolean
}

export async function createInvoice(prevState: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  const customerId = formData.get('customerId') as string
  const invoiceNo = formData.get('invoiceNo') as string
  const invoiceDateStr = formData.get('invoiceDate') as string
  const invoiceAmountStr = formData.get('invoiceAmount') as string
  const paidAmountStr = formData.get('paidAmount') as string
  const gstRateStr = formData.get('gstRate') as string
  const gstAmountStr = formData.get('gstAmount') as string

  if (!customerId || !invoiceNo || !invoiceDateStr || !invoiceAmountStr || !paidAmountStr) {
    return { error: 'Missing required fields' }
  }

  const isGstInclusive = formData.get('isGstInclusive') === 'true'
  const invoiceAmountEntered = Number(invoiceAmountStr)
  const paidAmount = Number(paidAmountStr)
  const gstRate = gstRateStr ? Number(gstRateStr) : null

  const { baseAmount: invoiceAmount, gstAmount, totalAmount } = calculateGstAmounts({
    amountEntered: invoiceAmountEntered,
    gstRate,
    isGstInclusive
  })

  if (paidAmount > totalAmount) {
    return { error: 'Paid amount cannot be greater than total invoice amount' }
  }

  const outstandingAmount = totalAmount - paidAmount
  const invoiceDate = new Date(invoiceDateStr)

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { creditTerms: true },
    })

    if (!customer) {
      return { error: 'Customer not found' }
    }

    const creditDays = customer.creditTerms ?? 0
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + creditDays)

    let status: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID'
    if (outstandingAmount === 0) status = 'PAID'
    else if (paidAmount > 0) status = 'PARTIAL'

    await prisma.invoice.create({
      data: {
        customerId,
        invoiceNo,
        invoiceDate,
        dueDate,
        invoiceAmount,
        gstRate,
        gstAmount,
        isGstInclusive,
        paidAmount,
        outstandingAmount,
        status,
      },
    })

    revalidatePath('/invoices')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to create invoice' }
  }
}
