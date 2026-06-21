'use client'

import { createContext, useContext } from 'react'

/**
 * Tenant Context — provides tenant information to client components.
 * Used for UI customization, plan-based feature flags, and tenant-aware navigation.
 */

export interface TenantContextValue {
  tenant: {
    id: string
    name: string
    slug: string
    plan: string
  } | null
  isLoading: boolean
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: false,
})

export function TenantProvider({
  children,
  tenant,
}: {
  children: React.ReactNode
  tenant: TenantContextValue['tenant']
}) {
  return (
    <TenantContext.Provider value={{ tenant, isLoading: false }}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * Hook to access the current tenant in client components.
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
