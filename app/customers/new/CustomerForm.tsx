'use client'

import { useFormState } from 'react-dom'
import { createCustomer, type CustomerFormState } from '../actions'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function CustomerForm() {
    const initialState: CustomerFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createCustomer, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset()
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
                    ✅ Customer saved successfully
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Customer Name *
                </label>
                <input
                    name="name"
                    required
                    className="border p-2 w-full rounded"
                    placeholder="ABC Pharma Distributors"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Phone
                </label>
                <input
                    name="phone"
                    className="border p-2 w-full rounded"
                    placeholder="9876543210"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Email
                </label>
                <input
                    name="email"
                    type="email"
                    className="border p-2 w-full rounded"
                    placeholder="accounts@abcpharma.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Location
                </label>
                <input
                    name="location"
                    className="border p-2 w-full rounded"
                    placeholder="New York, London, etc."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Credit Terms (days)
                </label>
                <input
                    name="creditTerms"
                    type="number"
                    className="border p-2 w-full rounded"
                    placeholder="30"
                />
                
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    className="border p-2 w-full rounded"
                    placeholder="Additional details..."
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    Save Customer
                </button>

                <Link
                    href="/customers"
                    className="px-4 py-2 border rounded"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
