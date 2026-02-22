'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Server action to create a new customer.
 * Validates input data and creates a new customer record in the database.
 * @param {FormData} formData - Form data containing customer details
 */
export type CustomerFormState = {
  error?: string
  success?: boolean
}

export async function createCustomer(prevState: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const location = formData.get('location') as string
  const creditTerms = formData.get('creditTerms') as string
  const notes = formData.get('notes') as string

  if (!name) {
    return { error: 'Customer name is required' }
  }

  try {
    await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        location: location || null,
        creditTerms: creditTerms ? Number(creditTerms) : null,
        notes: notes || null,
      },
    })

    revalidatePath('/customers')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to create customer' }
  }
}
