'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createInvoice, type InvoiceFormState } from '../actions'
import { calculateGstAmounts } from '@/lib/utils/invoice'

export default function InvoiceForm({ customers }: { customers: { id: string; name: string }[] }) {
    const initialState: InvoiceFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createInvoice, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    // State for GST calculation
    const [baseAmount, setBaseAmount] = useState<number | ''>('')
    const [gstRate, setGstRate] = useState<number>(0)
    const [isGstInclusive, setIsGstInclusive] = useState<boolean>(false)

    const {
        baseAmount: calculatedBaseAmount,
        gstAmount,
        totalAmount
    } = calculateGstAmounts({
        amountEntered: Number(baseAmount) || 0,
        gstRate,
        isGstInclusive
    })

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
            setBaseAmount('')
            setGstRate(0)
            setIsGstInclusive(false)
        }
    }, [state.success])

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            {state.error && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm text-yellow-800 rounded">
                    ⚠ {state.error}
                </div>
            )}

            {state.success && (
                <div className="bg-green-50 border border-green-300 p-2 text-sm text-green-800 rounded">
                    ✅ Invoice saved successfully
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Customer *
                </label>
                <select
                    name="customerId"
                    required
                    className="border p-2 w-full rounded"
                >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Invoice Number *
                </label>
                <input
                    name="invoiceNo"
                    required
                    className="border p-2 w-full rounded"
                    placeholder="INV-1001"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Invoice Date *
                </label>
                <input
                    name="invoiceDate"
                    type="date"
                    required
                    className="border p-2 w-full rounded"
                />
            </div>

            <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
                <h3 className="font-semibold text-gray-700">Payment Details</h3>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Base Amount (Taxable Value) *
                    </label>
                    <input
                        name="invoiceAmount"
                        type="number"
                        step="0.01"
                        required
                        className="border p-2 w-full rounded"
                        placeholder="e.g. 50000"
                        value={baseAmount}
                        onChange={(e) => setBaseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                </div>

                {/* GST Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isGstInclusive"
                            checked={isGstInclusive}
                            onChange={(e) => setIsGstInclusive(e.target.checked)}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <label htmlFor="isGstInclusive" className="text-sm font-medium text-gray-700 select-none">
                            Amount includes GST
                        </label>
                        <input type="hidden" name="isGstInclusive" value={String(isGstInclusive)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                GST Rate (%)
                            </label>
                            <input
                                type="number"
                                name="gstRate"
                                className="border p-2 w-full rounded"
                                value={gstRate}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= 0 && value <= 99 && Number.isInteger(value)) {
                                        setGstRate(value);
                                    }
                                }}
                                min="0"
                                max="99"
                                step="1"
                                pattern="[0-9]*"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                GST Amount
                            </label>
                            <input
                                name="gstAmount"
                                type="number"
                                step="0.01"
                                readOnly
                                className="border p-2 w-full rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                                value={gstAmount.toFixed(2)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-100 p-3 rounded">
                        <div>Base Amount:</div>
                        <div className="text-right font-medium">₹{calculatedBaseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

                        <div>GST ({gstRate}%):</div>
                        <div className="text-right font-medium">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t pt-3 mt-2">
                    <span className="font-medium text-gray-700">Total Invoice Value:</span>
                    <span className="text-xl font-bold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Paid Amount *
                </label>
                <input
                    name="paidAmount"
                    type="number"
                    step="0.01"
                    required
                    className="border p-2 w-full rounded"
                    placeholder="0"
                    defaultValue="0"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    Save Invoice
                </button>

                <Link
                    href="/invoices"
                    className="px-4 py-2 border rounded"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
