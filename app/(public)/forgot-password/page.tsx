'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Stethoscope, ArrowLeft, ArrowRight, Mail } from 'lucide-react'

/**
 * Forgot Password Page (Stub) — Password reset flow.
 * Currently a placeholder for future implementation.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement password reset email logic
    setSubmitted(true)
  }

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
              Reset Your Password
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your email address and we&apos;ll send you instructions to
              reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" />
                  <p className="font-medium">Check your email</p>
                </div>
                <p>
                  If an account exists for <strong>{email}</strong>, you&apos;ll
                  receive password reset instructions shortly.
                </p>
              </div>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors text-sm shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
