import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

/**
 * Role-based access control helper.
 * Enforces that the current user has one of the allowed roles.
 * Throws an error if unauthorized — use in server actions and API routes.
 *
 * Roles:
 * - DOCTOR: Full access
 * - RECEPTIONIST: Patient + Appointment (limited)
 * - ADMIN: Future use
 */
export async function requireRole(allowedRoles: string[]) {
    const session = await getServerSession(authOptions)

    if (!session) {
        throw new Error('Authentication required')
    }

    if (!allowedRoles.includes(session.user.role)) {
        throw new Error(`Unauthorized: requires one of [${allowedRoles.join(', ')}]`)
    }

    return session
}

/**
 * Check if current user has a specific role.
 * Returns boolean — use for conditional rendering in server components.
 */
export async function hasRole(role: string): Promise<boolean> {
    const session = await getServerSession(authOptions)
    return session?.user?.role === role
}
