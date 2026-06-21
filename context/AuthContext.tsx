'use client'

import { createContext, useContext, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Permission, ROLE_PERMISSIONS } from '@/lib/permissions'

/**
 * Auth Context — enhanced auth with permission checking.
 * Wraps next-auth session with role-based permission utilities.
 */

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthContextValue {
  user: AuthUser | null
  permissions: Permission[]
  hasPermission: (perm: Permission) => boolean
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  permissions: [],
  hasPermission: () => false,
  isLoading: true,
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user
      ? {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role,
        }
      : null

    const permissions = user ? (ROLE_PERMISSIONS[user.role] || []) : []

    return {
      user,
      permissions,
      hasPermission: (perm: Permission) => permissions.includes(perm),
      isLoading: status === 'loading',
      isAuthenticated: !!user,
    }
  }, [session, status])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth state and permissions in client components.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
