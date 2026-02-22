import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

export default async function VendorInvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const invoice = await prisma.vendorInvoice.findUnique({
    where: { id: id },
    include: {
      vendor: true,
      payments: { orderBy: { paymentDate: 'desc' } },
    },
  })

  if (!invoice) return <div className="p-6">Invoice not found</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Vendor Invoice {invoice.invoiceNo}
        </h1>
        <p className="text-gray-600">
          {invoice.vendor.name}
        </p>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-2 gap-4 border rounded p-4">
        <div>
          <div className="text-sm text-gray-500">
            Invoice Amount
          </div>
          <div className="font-bold">
            ₹{invoice.invoiceAmount.toLocaleString()}
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
          href={`/vendor-invoices/${invoice.id}/payment`}
          className="px-4 py-2 border rounded hover:bg-gray-50 bg-black text-white"
        >
          + Add Payment
        </Link>
      </div>

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