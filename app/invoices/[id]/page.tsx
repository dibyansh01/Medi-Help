import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'


export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession()

  const { id } = await params

  if (!id) {
    return <div className="p-6">Invalid invoice ID </div>
  }


  if (!session) {
    redirect('/login')
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: id },
    include: {
      customer: true,
      followUps: {
        orderBy: { createdAt: 'desc' },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      }
    },
  })

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Invoice {invoice.invoiceNo}
        </h1>
        <p className="text-gray-600">
          {invoice.customer.name}
        </p>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border rounded p-4 bg-gray-50">
        <div>
          <div className="text-sm text-gray-500">
            Base Amount
          </div>
          <div className="font-bold">
            ₹{invoice.invoiceAmount.toLocaleString()}
          </div>
        </div>

        {invoice.gstAmount && invoice.gstAmount > 0 && (
          <div>
            <div className="text-sm text-gray-500">
              GST ({invoice.gstRate}%)
            </div>
            <div className="font-bold">
              ₹{invoice.gstAmount.toLocaleString()}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-gray-500">
            Total Amount
          </div>
          <div className="font-bold text-lg">
            ₹{(invoice.invoiceAmount + (invoice.gstAmount || 0)).toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">
            Outstanding
          </div>
          <div className="font-bold text-red-600">
            ₹{invoice.outstandingAmount.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">
            Due Date
          </div>
          <div>
            {new Date(invoice.dueDate).toLocaleDateString()}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">
            Status
          </div>
          <div>{invoice.status}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href={`/invoices/${invoice.id}/followup`}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Follow-up
        </Link>

        {/* Placeholder for Day 6 */}
        <Link
          href={`/invoices/${invoice.id}/payment`}
          className="px-4 py-2 border rounded"
        >
          + Add Payment
        </Link>

      </div>

      {/* Follow-up History */}
      <div className="border rounded p-4">
        <h2 className="font-bold mb-3">Follow-up History</h2>

        {invoice.followUps.length === 0 && (
          <div className="text-gray-500">
            No follow-ups yet
          </div>
        )}

        <ul className="space-y-3">
          {invoice.followUps.map((f: any) => (
            <li
              key={f.id}
              className="border-b pb-2"
            >
              <div className="text-sm">
                <strong>{f.method}</strong> — {f.status}
                <span className="text-gray-500 ml-2 text-xs">
                  {new Date(f.followUpDate).toLocaleDateString()}
                </span>
              </div>
              {f.notes && (
                <div className="text-gray-600">
                  {f.notes}
                </div>
              )}
              {f.nextFollowUpOn && (
                <div className="text-xs text-blue-600">
                  Next follow-up:{' '}
                  {new Date(
                    f.nextFollowUpOn
                  ).toLocaleDateString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* 🔽 ADD THIS BLOCK BELOW */}

      {/* Payment History */}
      <div className="border rounded p-4">
        <h2 className="font-bold mb-3">Payment History</h2>

        {invoice.payments.length === 0 && (
          <div className="text-gray-500">
            No payments yet
          </div>
        )}

        <ul className="space-y-2">
          {invoice.payments.map((p: any) => (
            <li key={p.id} className="border-b pb-2">
              <div className="text-sm font-medium">
                ₹{p.amount.toLocaleString()} — {p.method}
              </div>
              <div className="text-xs text-gray-600">
                {new Date(p.paymentDate).toLocaleDateString()}
                {p.reference && ` | Ref: ${p.reference}`}
              </div>
              {p.notes && (
                <div className="text-xs text-gray-500">
                  {p.notes}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
