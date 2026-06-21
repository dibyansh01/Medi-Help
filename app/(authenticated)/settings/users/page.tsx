import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Shield } from 'lucide-react'

/**
 * User Management Page (Stub) — Manage staff accounts and roles.
 * Will support creating, editing, and deactivating user accounts.
 */
export default async function UsersSettingsPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/settings"
          className="text-xs text-muted-foreground hover:text-primary transition-colors mb-2 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage staff accounts, roles, and access permissions
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-12 text-center">
        <div className="flex justify-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">User Management Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You&apos;ll be able to invite staff, assign roles (Doctor, Receptionist, Admin),
          and manage access permissions from this page.
        </p>
      </div>
    </div>
  )
}
