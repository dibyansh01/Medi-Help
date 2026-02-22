'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addPayment(
  prevState: { error?: string } | null,
  formData: FormData
) {
  const invoiceId = formData.get('invoiceId') as string
  const amountStr = formData.get('amount') as string
  const method = formData.get('method') as string
  const reference = formData.get('reference') as string
  const notes = formData.get('notes') as string
  const paymentDateStr = formData.get('paymentDate') as string

  const amount = Number(amountStr)
  const paymentDate = new Date(paymentDateStr)

  if (!invoiceId || !amount || amount <= 0) {
    return { error: 'Please enter a valid payment amount' }
  }

  if (isNaN(paymentDate.getTime())) {
    return { error: 'Please select a valid payment date' }
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  })

  if (!invoice) {
    return { error: 'Invoice not found' }
  }

  const totalPaidSoFar = invoice.payments.reduce(
    (sum, p) => sum + p.amount,
    0
  )

  const newTotalPaid = totalPaidSoFar + amount

  // Calculate total invoice amount (Base + GST)
  const gstAmount = invoice.gstAmount || 0
  const totalInvoiceAmount = invoice.invoiceAmount + gstAmount

  if (newTotalPaid > totalInvoiceAmount) {
    return {
      error: `Payment exceeds outstanding balance. Outstanding is ₹${invoice.outstandingAmount.toLocaleString()}`,
    }
  }

  const newOutstanding =
    totalInvoiceAmount - newTotalPaid

  let newStatus: 'UNPAID' | 'PARTIAL' | 'PAID' = 'UNPAID'

  if (newOutstanding === 0) {
    newStatus = 'PAID'
  } else if (newTotalPaid > 0) {
    newStatus = 'PARTIAL'
  }

  await prisma.$transaction([
    prisma.paymentEntry.create({
      data: {
        invoiceId,
        amount,
        method,
        reference,
        notes,
        paymentDate,
      },
    }),

    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newTotalPaid,
        outstandingAmount: newOutstanding,
        status: newStatus,
      },
    }),
  ])

  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/invoices')
  revalidatePath('/dashboard')

  return { success: true, message: 'Payment recorded successfully!' }
}
