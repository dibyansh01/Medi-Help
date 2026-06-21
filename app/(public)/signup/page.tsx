'use client'

import Link from 'next/link'
import { Stethoscope, ArrowLeft } from 'lucide-react'

/**
 * Signup Page (Stub) — Registration page for new clinic accounts.
 * Currently a placeholder for future implementation.
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-slate-100">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="w-8 h-8 text-teal-500" />
              <h1 className="text-2xl font-bold text-slate-900">MediHelp</h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Create Your Account
            </h2>
            <p className="text-slate-500 text-sm">
              Registration is currently available by invitation only.
              Please contact your clinic administrator.
            </p>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700 mb-6">
            <p className="font-medium mb-1">🏥 Enterprise Registration</p>
            <p>
              To set up a new clinic on MediHelp, please reach out to our team
              for onboarding assistance.
            </p>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
