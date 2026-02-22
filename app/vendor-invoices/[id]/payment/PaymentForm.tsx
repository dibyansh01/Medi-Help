'use client'

import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { addVendorPayment } from './actions'

export default function VendorPaymentForm({
    invoiceId,
}: {
    invoiceId: string
}) {
    // @ts-ignore
    const [state, formAction] = useFormState(addVendorPayment, null)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            const timer = setTimeout(() => {
                router.push(`/vendor-invoices/${invoiceId}`)
                router.refresh()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [state?.success, router, invoiceId])

    if (state?.success) {
        return (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center space-y-2">
                <div className="text-2xl">✅</div>
                <h3 className="font-bold text-lg">Payment Recorded!</h3>
                <p>Redirecting to invoice details...</p>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="invoiceId" value={invoiceId} />

            {/* Error Message */}
            {state?.error && (
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded text-sm">
                    ⚠️ {state.error}
                </div>
            )}

            {/* Payment Date */}
            <div>
                <label className="block text-sm mb-1">
                    Payment Date *
                </label>
                <input
                    name="paymentDate"
                    type="date"
                    required
                    className="border p-2 w-full"
                    defaultValue={new Date().toISOString().split('T')[0]}
                />
            </div>

            {/* Amount */}
            <div>
                <label className="block text-sm mb-1">
                    Amount Paid *
                </label>
                <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    className="border p-2 w-full"
                    placeholder="5000"
                />
            </div>

            {/* Method */}
            <div>
                <label className="block text-sm mb-1">
                    Payment Method
                </label>
                <select
                    name="method"
                    className="border p-2 w-full"
                >
                    <option value="BANK">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>

            {/* Reference */}
            <div>
                <label className="block text-sm mb-1">
                    Reference
                </label>
                <input
                    name="reference"
                    className="border p-2 w-full"
                    placeholder="UTR / Cheque no"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    className="border p-2 w-full"
                />
            </div>

            <button className="bg-black text-white px-4 py-2 rounded">
                Save Payment
            </button>
        </form>
    )
}
