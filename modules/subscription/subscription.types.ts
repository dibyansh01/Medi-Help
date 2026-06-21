/**
 * Subscription Module — Type Definitions
 */

export interface Subscription {
  id: string
  tenantId: string
  plan: string
  status: SubscriptionStatus
  startDate: Date
  endDate?: Date
  trialEndsAt?: Date
}

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
