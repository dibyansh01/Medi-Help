import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { createCustomer } from '../actions'
import Link from 'next/link'
import CustomerForm from './CustomerForm'

export default async function NewCustomerPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Customer</h1>
        <p className="text-sm text-gray-500">
          Add a customer for invoicing and follow-ups
        </p>
      </div>

      <CustomerForm />
    </div>
  )
}
