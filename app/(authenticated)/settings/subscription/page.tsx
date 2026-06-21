import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react'

/**
 * Subscription Management Page (Stub) — Plan management and billing.
 * Will support plan upgrades, invoice history, and payment methods.
 */
export default async function SubscriptionSettingsPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: '/month',
      features: [
        'Up to 50 patients',
        'Basic visit records',
        'Follow-up reminders',
        'Single user',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: '₹999',
      period: '/month',
      features: [
        'Unlimited patients',
        'Full EMR & analytics',
        'WhatsApp integration',
        'Up to 5 users',
        'Priority support',
      ],
      current: false,
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Everything in Pro',
        'Multi-clinic support',
        'Unlimited users',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
      current: false,
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link
          href="/settings"
          className="text-xs text-muted-foreground hover:text-primary transition-colors mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Subscription & Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your plan, view invoices, and update payment details
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border shadow-sm p-6 relative ${
              plan.current
                ? 'border-primary bg-primary/5'
                : plan.recommended
                ? 'border-teal-300 dark:border-teal-700'
                : 'bg-card text-card-foreground'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </span>
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-sm">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-4 mt-2">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.current
                  ? 'bg-primary/20 text-primary cursor-default'
                  : 'bg-secondary text-secondary-foreground cursor-not-allowed opacity-60'
              }`}
            >
              {plan.current ? 'Current Plan' : 'Coming Soon'}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Info Placeholder */}
      <div className="mt-8 rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center">
        <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Payment & Invoice Management</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Payment method management and invoice history will be available here
          when paid plans are activated.
        </p>
      </div>
    </div>
  )
}
