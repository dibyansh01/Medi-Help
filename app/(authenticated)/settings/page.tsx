import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  CreditCard,
  Shield,
  Bell,
  Building2,
  ChevronRight,
} from 'lucide-react'

/**
 * Settings Hub Page — Central settings navigation for clinic configuration.
 * Links to user management, subscription, and other clinic settings.
 */
export default async function SettingsPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const settingsSections = [
    {
      title: 'User Management',
      description: 'Manage staff accounts, roles, and access permissions',
      href: '/settings/users',
      icon: Users,
      badge: 'Admin',
    },
    {
      title: 'Subscription & Billing',
      description: 'Manage your plan, view invoices, and update payment details',
      href: '/settings/subscription',
      icon: CreditCard,
      badge: null,
    },
    {
      title: 'Clinic Profile',
      description: 'Update clinic name, address, logo, and contact details',
      href: '#',
      icon: Building2,
      badge: 'Coming Soon',
    },
    {
      title: 'Security',
      description: 'Password policies, two-factor authentication, and session management',
      href: '#',
      icon: Shield,
      badge: 'Coming Soon',
    },
    {
      title: 'Notifications',
      description: 'Configure email, SMS, and WhatsApp notification preferences',
      href: '#',
      icon: Bell,
      badge: 'Coming Soon',
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your clinic configuration and preferences
        </p>
      </div>

      <div className="space-y-3">
        {settingsSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className={`flex items-center gap-4 p-5 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors group ${
              section.href === '#' ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <section.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{section.title}</h3>
                {section.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    section.badge === 'Coming Soon'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {section.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {section.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
