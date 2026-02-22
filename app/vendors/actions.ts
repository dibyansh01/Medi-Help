'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export type VendorFormState = {
  error?: string
  success?: boolean
}

export async function createVendor(
  prevState: VendorFormState,
  formData: FormData
): Promise<VendorFormState> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const creditTerms = formData.get('creditTerms')
    ? Number(formData.get('creditTerms'))
    : null
  const notes = formData.get('notes') as string

  if (!name) {
    return { error: 'Vendor Name is required' }
  }

  try {
    await prisma.vendor.create({
      data: {
        name,
        phone,
        email,
        creditTerms,
        notes,
      },
    })

    revalidatePath('/vendors')
    return { success: true }
  } catch (error) {
    console.error('Create Vendor Error:', error)
    return { error: 'Failed to create vendor. Please try again.' }
  }
}