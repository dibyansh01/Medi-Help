'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { createVendorInvoice, type VendorInvoiceFormState } from '../actions'
import { useState } from 'react'
import { calculateGstAmounts } from '@/lib/utils/invoice'

export default function VendorInvoiceForm({ vendors }: { vendors: { id: string; name: string }[] }) {
    const initialState: VendorInvoiceFormState = {
        message: '',
        error: '',
    }

    const [state, formAction] = useFormState(createVendorInvoice, initialState)

    // GST State
    const [amountEntered, setAmountEntered] = useState<number | ''>('')
    const [gstRate, setGstRate] = useState<number>(0)
    const [isGstInclusive, setIsGstInclusive] = useState<boolean>(false)
    const [isGstEligible, setIsGstEligible] = useState<boolean>(true)

    const { baseAmount, gstAmount, totalAmount } = calculateGstAmounts({
        amountEntered: Number(amountEntered) || 0,
        gstRate,
        isGstInclusive
    })

    return (
        <form action={formAction} className="space-y-4">
            {state.error && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm text-yellow-800 rounded">
                    ⚠ {state.error}
                </div>
            )}
            {state.message && (
                <div className="bg-green-50 border border-green-300 p-2 text-sm text-green-800 rounded">
                    ✅ {state.message}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">Vendor *</label>
                <select name="vendorId" required className="w-full p-2 border rounded-md bg-background">
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Invoice Number *
                    </label>
                    <input
                        name="invoiceNo"
                        required
                        className="border p-2 w-full rounded"
                        placeholder="e.g. INV-001"
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
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Due Date *
                    </label>
                    <input
                        name="dueDate"
                        type="date"
                        required
                        className="border p-2 w-full rounded"
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>


            {/* Amount & GST Section */}
            <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
                <h3 className="font-semibold text-gray-700">Invoice Amount & GST</h3>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Amount Entered (Base or Total) *
                    </label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        className="border p-2 w-full rounded"
                        placeholder="e.g. 50000"
                        value={amountEntered}
                        onChange={(e) => setAmountEntered(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
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

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isGstEligible"
                                checked={isGstEligible}
                                onChange={(e) => setIsGstEligible(e.target.checked)}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                            />
                            <label htmlFor="isGstEligible" className="text-sm font-medium text-gray-700 select-none">
                                GST Eligible (Input Credit)
                            </label>
                            <input type="hidden" name="isGstEligible" value={String(isGstEligible)} />
                        </div>
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
                                placeholder="0"
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
                        <div className="text-right font-medium">₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

                        <div>Total Payable:</div>
                        <div className="text-right font-bold text-black">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
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
                    Save Vendor Invoice
                </button>

                <Link
                    href="/vendor-invoices"
                    className="px-4 py-2 border rounded"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
