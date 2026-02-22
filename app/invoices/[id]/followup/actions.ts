'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export type FollowupFormState = {
  error?: string
  success?: boolean
}

export async function createFollowUpAction(
  invoiceId: string,
  prevState: FollowupFormState,
  formData: FormData
): Promise<FollowupFormState> {
  try {
    const method = formData.get('method') as string
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string | null
    const nextFollowUpOn = formData.get('nextFollowUpOn') as string | null

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return { error: 'Invoice not found' }
    }

    if (invoice.status === 'PAID') {
      return { error: 'Cannot add follow-up on a PAID invoice.' }
    }

    let nextDate: Date | null = null
    if (nextFollowUpOn) {
      nextDate = new Date(nextFollowUpOn)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (nextDate < today) {
        return { error: 'Next follow-up date cannot be in the past.' }
      }
    }

    await prisma.followUp.create({
      data: {
        invoiceId,
        method,
        status,
        notes,
        nextFollowUpOn: nextDate,
      },
    })

    revalidatePath(`/invoices/${invoiceId}`)

    return { success: true }
  } catch (err) {
    console.error('Create follow-up error:', err)
    return { error: 'Failed to create follow-up.' }
  }
}
