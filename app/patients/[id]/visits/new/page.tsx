'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createVisit, type VisitFormState } from '../actions'
import { Card, InputNumber, Checkbox } from 'antd'

/**
 * New Visit Page (EMR Entry).
 * Allows the doctor to record vitals, risk factors, and clinical notes.
 */
export default function NewVisitPage() {
    const router = useRouter()
    const params = useParams()
    const patientId = params.id as string

    const [patientName, setPatientName] = useState('')

    const [height, setHeight] = useState<number | null>(null)
    const [weight, setWeight] = useState<number | null>(null)
    const [bmi, setBmi] = useState<number | null>(null)
    const [riskFactors, setRiskFactors] = useState<string[]>([])

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

    // Calculate BMI
    useEffect(() => {
        if (height && weight && height > 0) {
            const calculatedBmi = weight / (height * height)
            setBmi(parseFloat(calculatedBmi.toFixed(2)))
        } else {
            setBmi(null)
        }
    }, [height, weight])

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Record Visit</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {patientName ? `Patient: ${patientName}` : 'Loading patient...'}
                </p>
            </div>

            <div className="rounded-lg shadow-sm">
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="patientId" value={patientId} />
                    <input type="hidden" name="height" value={height || ''} />
                    <input type="hidden" name="weight" value={weight || ''} />
                    <input type="hidden" name="bmi" value={bmi || ''} />
                    <input type="hidden" name="isNonVeg" value={riskFactors.includes('Non-Veg') ? 'true' : 'false'} />
                    <input type="hidden" name="alcohol" value={riskFactors.includes('Alcohol') ? 'true' : 'false'} />
                    <input type="hidden" name="smoking" value={riskFactors.includes('Smoking') ? 'true' : 'false'} />

                    {state.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg mb-4">
                            ⚠️ {state.error}
                        </div>
                    )}

                    {/* Vitals Section */}
                    <Card title={<span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Vitals</span>} className="mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Blood Pressure</label>
                                <input
                                    name="bp"
                                    type="text"
                                    placeholder="120/80"
                                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:border-primary outline-none transition-all text-sm h-8"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Temperature (°F)</label>
                                <input
                                    name="temperature"
                                    type="number"
                                    step="0.1"
                                    placeholder="98.6"
                                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:border-primary outline-none transition-all text-sm h-8"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Pulse (bpm)</label>
                                <input
                                    name="pulse"
                                    type="number"
                                    placeholder="72"
                                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background focus:border-primary outline-none transition-all text-sm h-8"
                                />
                            </div>
                            <div className="hidden block"></div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Height (m)</label>
                                <InputNumber
                                    min={0.5}
                                    max={2.5}
                                    step={0.01}
                                    value={height}
                                    onChange={(val) => setHeight(val as number)}
                                    placeholder="1.75"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                                <InputNumber
                                    min={1}
                                    max={300}
                                    step={0.1}
                                    value={weight}
                                    onChange={(val) => setWeight(val as number)}
                                    placeholder="70"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">BMI</label>
                                <InputNumber
                                    value={bmi}
                                    readOnly
                                    className="w-full bg-gray-50"
                                    placeholder="Auto-calculated"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Risk Factors Section */}
                    <Card title={<span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Risk Factors</span>} className="mb-4">
                        <div className="mb-4">
                            <Checkbox.Group
                                options={['Non-Veg', 'Alcohol', 'Smoking']}
                                value={riskFactors}
                                onChange={(vals) => setRiskFactors(vals as string[])}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Drug Allergy</label>
                                <input
                                    name="drugAllergy"
                                    type="text"
                                    placeholder="None or specify"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Surgery History</label>
                                <textarea
                                    name="surgeryHistory"
                                    rows={2}
                                    placeholder="Any past surgeries..."
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Clinical Section */}
                    <Card title={<span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success" /> Clinical Notes</span>} className="mb-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Chief Complaint <span className="text-red-500">*</span></label>
                                <textarea
                                    name="chiefComplaint"
                                    required
                                    rows={2}
                                    placeholder="Main reason for visit..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">History of Present Illness</label>
                                <textarea
                                    name="historyOfPresentIllness"
                                    rows={2}
                                    placeholder="Details of current illness..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Examination</label>
                                <textarea
                                    name="examination"
                                    rows={2}
                                    placeholder="Physical examination notes..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Provisional Diagnosis</label>
                                <input
                                    name="provisionalDiagnosis"
                                    type="text"
                                    placeholder="Initial diagnosis..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Investigations</label>
                                <textarea
                                    name="investigations"
                                    rows={2}
                                    placeholder="Ordered tests or labs..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Final Diagnosis</label>
                                <input
                                    name="finalDiagnosis"
                                    type="text"
                                    placeholder="Definitive diagnosis..."
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Scheduling & Billing */}
                    <Card title={<span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning" /> Scheduling & Billing</span>} className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Next Visit Date</label>
                                <input
                                    name="nextVisitDate"
                                    type="date"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none transition-all text-sm h-[32px]"
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
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none transition-all text-sm h-[32px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Payment Mode</label>
                                <select
                                    name="paymentMode"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:border-primary outline-none transition-all text-sm h-[32px]"
                                >
                                    <option value="">Select</option>
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                    <option value="INSURANCE">Insurance</option>
                                </select>
                            </div>
                        </div>
                    </Card>

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
