import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import InvoiceForm from './InvoiceForm'

export default async function NewInvoicePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">New Invoice</h1>
      <InvoiceForm customers={customers} />
    </div>
  )
}
