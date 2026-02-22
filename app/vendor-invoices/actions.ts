'use server'

import { prisma } from '@/lib/db/prisma'
import { calculateGstAmounts } from '@/lib/utils/invoice'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type VendorInvoiceFormState = {
  message?: string
  error?: string
  success?: boolean
}

export async function createVendorInvoice(prevState: VendorInvoiceFormState, formData: FormData): Promise<VendorInvoiceFormState> {
  const vendorId = formData.get('vendorId') as string
  let invoiceNo = formData.get('invoiceNo') as string
  const invoiceDateStr = formData.get('invoiceDate') as string
  const dueDateStr = formData.get('dueDate') as string
  const amountStr = formData.get('amount') as string
  const description = formData.get('description') as string

  if (!vendorId || !invoiceNo || !invoiceDateStr || !dueDateStr || !amountStr) {
    return { error: 'Please fill in all required fields' }
  }



  const invoiceAmountEntered = parseFloat(amountStr)
  if (isNaN(invoiceAmountEntered) || invoiceAmountEntered <= 0) {
    return { error: 'Amount must be a positive number' }
  }

  const isGstInclusive = formData.get('isGstInclusive') === 'true'
  const isGstEligible = formData.get('isGstEligible') === 'true'
  const gstRateStr = formData.get('gstRate') as string
  const gstRate = gstRateStr ? Number(gstRateStr) : null

  const { baseAmount: invoiceAmount, gstAmount, totalAmount: outstandingAmount } = calculateGstAmounts({
    amountEntered: invoiceAmountEntered,
    gstRate,
    isGstInclusive
  })

  // Determine status (handle paidAmount logic if any, but default paidAmount=0 from form usually)
  // The form has paidAmount input.
  const paidAmountStr = formData.get('paidAmount') as string
  const paidAmount = paidAmountStr ? Number(paidAmountStr) : 0

  const finalOutstandingAmount = outstandingAmount - paidAmount

  let status: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID'
  if (finalOutstandingAmount <= 0) status = 'PAID' // Should typically be 0
  else if (paidAmount > 0) status = 'PARTIAL'

  const invoiceDate = new Date(invoiceDateStr)
  const dueDate = new Date(dueDateStr)

  try {
    await prisma.vendorInvoice.create({
      data: {
        vendorId,
        invoiceNo,
        invoiceDate,
        dueDate,
        invoiceAmount,
        gstAmount,
        gstRate,
        isGstInclusive,
        isGstEligible,
        paidAmount,
        outstandingAmount: finalOutstandingAmount,
        status,
        description,
      },
    });

    revalidatePath('/vendor-invoices');
    return { success: true, message: 'Vendor Invoice created successfully' }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to create vendor invoice' }
  }
}