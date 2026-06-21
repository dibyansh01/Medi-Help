import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Permission, hasPermission } from '@/lib/permissions'

/**
 * Require a specific permission — throws if unauthorized.
 * Use in Server Actions and API routes.
 */
export async function requirePermission(permission: Permission) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('Authentication required')
  }

  if (!hasPermission(session.user.role, permission)) {
    throw new Error(`Unauthorized: requires ${permission}`)
  }

  return session
}
