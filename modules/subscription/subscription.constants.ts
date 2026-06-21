/**
 * Subscription Module — Constants
 */

export const SUBSCRIPTION_PLANS = ['FREE', 'PRO', 'ENTERPRISE'] as const
export const SUBSCRIPTION_STATUSES = ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED'] as const

export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  FREE: 'Free',
  PRO: 'Professional',
  ENTERPRISE: 'Enterprise',
}
