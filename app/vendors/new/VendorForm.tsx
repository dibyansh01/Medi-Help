'use client'

import { useFormState } from 'react-dom'
import { createVendor, type VendorFormState } from '../actions'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
// If you have a Button/Input component in ui/ run replace with those if possible, but matching CustomerForm strictly first.

export default function VendorForm() {
    const initialState: VendorFormState = {
        error: undefined,
        success: false,
    }

    const [state, formAction] = useFormState(createVendor, initialState)
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
                    ✅ Vendor saved successfully
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1">
                    Vendor Name *
                </label>
                <input
                    name="name"
                    required
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Acme Supplies"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Phone
                </label>
                <input
                    name="phone"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 9876543210"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Email
                </label>
                <input
                    name="email"
                    type="email"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. accounts@acme.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Credit Terms (days)
                </label>
                <input
                    name="creditTerms"
                    type="number"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="border p-2 w-full rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional details..."
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                    Save Vendor
                </button>

                <Link
                    href="/vendors"
                    className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors text-center"
                >
                    Back to List
                </Link>
            </div>
        </form>
    )
}
