'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import {
  BarChart3,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

const ERROR_MESSAGE_MAP: Record<string, string> = {
  MISSING_CREDENTIALS: 'Please enter both email and password.',
  USER_NOT_FOUND: 'No account found with this email.',
  INVALID_PASSWORD: 'Incorrect password. Please try again.',
  CredentialsSignin: 'Invalid email or password.',
  default: 'Something went wrong. Please try again.',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard',
    })

    setLoading(false)

    if (res?.error) {
      const message =
        ERROR_MESSAGE_MAP[res.error] || ERROR_MESSAGE_MAP.default
      setError(message)
      return
    }

    if (res?.ok) {
      setSuccess(true)
      window.location.href = res.url || '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* LEFT SECTION - Product Value & Trust */}
      <div className="lg:w-1/2 bg-slate-900 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 -ml-20 -mb-20"></div>

        <div className="relative z-10">
          {/* 1. Product Identity */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              MSME Cashflow
            </h1>
            <p className="text-blue-200 text-lg font-medium">
              Control cash. Collect faster. Stay GST-ready.
            </p>
          </div>

          {/* 2. Key Value Highlights */}
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-blue-900/50 p-3 rounded-lg mr-4 border border-blue-800">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">
                  Real-time Cashflow Visibility
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Track cash in, cash out, and net position at a glance. No more guesswork.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-900/50 p-3 rounded-lg mr-4 border border-blue-800">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">
                  Smart Collections & Follow-ups
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Never miss overdue invoices. Automated tracking for faster payments.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-900/50 p-3 rounded-lg mr-4 border border-blue-800">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white mb-1">
                  GST-Aware Accounting
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Instant insights on GST payable, credits, and blocked cash.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Trust Signals */}
        <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-slate-300 text-sm font-medium">
              <ShieldCheck className="w-4 h-4 mr-2 text-blue-400" />
              Secure data & role-based access
            </div>
            <div className="flex items-center text-slate-300 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" />
              Designed for Indian MSMEs
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-slate-100">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Access your cashflow dashboard securely</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-start">
                  <span className="mr-2">✅</span> Login successful! Redirecting...
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <span>{loading ? 'Logging in...' : 'Login'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  By logging in, you agree to our secure access policy.
                </p>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center space-y-2">
            <div className="flex justify-center space-x-6 text-sm text-slate-500">
              <span>© 2026 MSME Cashflow</span>
              <a href="#" className="hover:text-slate-800">Privacy</a>
              <a href="#" className="hover:text-slate-800">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
