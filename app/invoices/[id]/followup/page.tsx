import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import FollowupForm from './FollowupForm'

export default async function AddFollowupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession()
  const { id } = await params
  if (!session) redirect('/login')
  

  const invoice = await prisma.invoice.findUnique({
    where: { id: id },
    include: { customer: true },
  })

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">
        Add Follow-up
      </h1>

      <p className="text-sm text-gray-600 mb-4">
        {invoice.customer.name} — {invoice.invoiceNo}
      </p>

      <FollowupForm invoiceId={invoice.id} />
    </div>
  )
}
