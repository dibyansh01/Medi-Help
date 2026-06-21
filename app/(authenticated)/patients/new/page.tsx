'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createPatient } from '../actions'
import type { PatientFormState } from '@/services'

import { useEffect, useState } from 'react'

type PatientType = {
    id: string
    name: string
    description: string | null
}

export default function NewPatientPage() {
    const router = useRouter()
    const [patientTypes, setPatientTypes] = useState<PatientType[]>([])

    const [state, formAction, isPending] = useActionState(
        createPatient,
        { error: undefined, success: undefined } as PatientFormState
    )

    // Fetch patient types on mount
    useEffect(() => {
        fetch('/api/patient-types')
            .then((res) => res.json())
            .then((data) => setPatientTypes(data))
            .catch(() => { })
    }, [])

    // Redirect on success
    useEffect(() => {
        if (state.success && state.patientId) {
            router.push(`/patients/${state.patientId}`)
        }
    }, [state.success, state.patientId, router])

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Register New Patient</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Patient ID will be auto-generated
                </p>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <form action={formAction} className="space-y-6">
                    {state.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            ⚠️ {state.error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Patient full name"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="10-digit mobile"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Optional"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Gender</label>
                                <select
                                    name="gender"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                >
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Medical Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                                <input
                                    name="dateOfBirth"
                                    type="date"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                >
                                    <option value="">Select</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Patient Type</label>
                                <select
                                    name="patientTypeId"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                >
                                    <option value="">General</option>
                                    {patientTypes.map((pt) => (
                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Allergies</label>
                                <input
                                    name="allergies"
                                    type="text"
                                    placeholder="e.g., Penicillin, Aspirin"
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Chronic Conditions</label>
                            <input
                                name="chronicConditions"
                                type="text"
                                placeholder="e.g., Diabetes, Hypertension"
                                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Address</label>
                            <textarea
                                name="address"
                                rows={2}
                                placeholder="Full address"
                                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
                        >
                            {isPending ? 'Registering...' : 'Register Patient'}
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
