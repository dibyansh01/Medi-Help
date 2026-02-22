'use client'

import { useFormState } from 'react-dom'
import { createExpense, type ExpenseFormState } from '../actions'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { calculateGstAmounts } from '@/lib/utils/invoice'

type Props = {
    categories: { id: string; name: string }[]
    vendors: { id: string; name: string }[]
}

export default function ExpenseForm({ categories, vendors }: Props) {
    const initialState: ExpenseFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createExpense, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    // GST State
    const [amountEntered, setAmountEntered] = useState<number | ''>('')
    const [gstRate, setGstRate] = useState<number>(0)
    const [isGstInclusive, setIsGstInclusive] = useState<boolean>(false)
    const [isGstEligible, setIsGstEligible] = useState<boolean>(false) // Default false for expenses

    const { baseAmount, gstAmount, totalAmount } = calculateGstAmounts({
        amountEntered: Number(amountEntered) || 0,
        gstRate,
        isGstInclusive
    })

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
            setAmountEntered('')
            setGstRate(0)
            setIsGstInclusive(false)
            setIsGstEligible(false)
        }
    }, [state.success])

    // Default date to today
    const today = new Date().toISOString().split('T')[0]

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            {state.error && (
                <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm text-yellow-800 rounded">
                    ⚠ {state.error}
                </div>
            )}

            {state.success && (
                <div className="bg-green-50 border border-green-300 p-2 text-sm text-green-800 rounded">
                    ✅ Expense saved successfully
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Date *
                </label>
                <input
                    name="expenseDate"
                    type="date"
                    defaultValue={today}
                    required
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Category *
                </label>
                <select
                    name="categoryId"
                    required
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Vendor (Optional)
                </label>
                <select
                    name="vendorId"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="">No Vendor</option>
                    {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Amount & GST Section */}
            <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
                <h3 className="font-semibold text-gray-700">Expense Amount & GST</h3>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Amount Entered (Base or Total) *
                    </label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
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
                                className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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

                        <div>Total Pay-out:</div>
                        <div className="text-right font-bold text-black">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Payment Mode *
                </label>
                <select
                    name="paymentMode"
                    defaultValue="CASH"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Expense details..."
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                    Save Expense
                </button>

                <Link
                    href="/expenses"
                    className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors text-center"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
