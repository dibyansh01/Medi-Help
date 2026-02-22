'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createVisit, type VisitFormState } from '../actions'

/**
 * New Visit Page (EMR Entry).
 * Allows the doctor to record vitals, symptoms, diagnosis, prescription, lab tests.
 * If nextVisitDate is set, auto-creates a follow-up appointment.
 */
export default function NewVisitPage() {
    const router = useRouter()
    const params = useParams()
    const patientId = params.id as string

    const [patientName, setPatientName] = useState('')

    const [state, formAction, isPending] = useActionState(
        createVisit,
        { error: undefined, success: undefined } as VisitFormState
    )

    // Fetch patient name for display
    useEffect(() => {
        fetch(`/api/patients/${patientId}`)
            .then((res) => res.json())
            .then((data) => setPatientName(data.name || ''))
            .catch(() => { })
    }, [patientId])

    // Redirect on success
    useEffect(() => {
        if (state.success) {
            router.push(`/patients/${patientId}`)
        }
    }, [state.success, patientId, router])

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Record Visit</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {patientName ? `Patient: ${patientName}` : 'Loading patient...'}
                </p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="patientId" value={patientId} />

                    {state.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            ⚠️ {state.error}
                        </div>
                    )}

                    {/* Vitals Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Vitals
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Blood Pressure</label>
                                <input
                                    name="bp"
                                    type="text"
                                    placeholder="120/80"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Temperature (°F)</label>
                                <input
                                    name="temperature"
                                    type="number"
                                    step="0.1"
                                    placeholder="98.6"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Pulse (bpm)</label>
                                <input
                                    name="pulse"
                                    type="number"
                                    placeholder="72"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                                <input
                                    name="weight"
                                    type="number"
                                    step="0.1"
                                    placeholder="70"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clinical Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success"></span>
                            Clinical Notes
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Symptoms</label>
                                <textarea
                                    name="symptoms"
                                    rows={2}
                                    placeholder="Chief complaints and symptoms..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Diagnosis</label>
                                <textarea
                                    name="diagnosis"
                                    rows={2}
                                    placeholder="Clinical diagnosis..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Prescription (Rx)</label>
                                <textarea
                                    name="prescription"
                                    rows={3}
                                    placeholder="Medications, dosage, duration..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Lab Tests</label>
                                <textarea
                                    name="labTests"
                                    rows={2}
                                    placeholder="Recommended investigations..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scheduling & Billing */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning"></span>
                            Scheduling & Billing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Next Visit Date</label>
                                <input
                                    name="nextVisitDate"
                                    type="date"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Auto-creates follow-up reminder
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Consultation Fee (₹)</label>
                                <input
                                    name="fee"
                                    type="number"
                                    step="0.01"
                                    placeholder="Optional"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Payment Mode</label>
                                <select
                                    name="paymentMode"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                >
                                    <option value="">Select</option>
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                    <option value="INSURANCE">Insurance</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Additional Notes</label>
                        <textarea
                            name="notes"
                            rows={2}
                            placeholder="Any additional observations..."
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                        >
                            {isPending ? 'Saving...' : 'Save Visit Record'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
