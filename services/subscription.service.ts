/**
 * Subscription Service — Foundation for subscription billing.
 * Stub implementation — provides type-safe interfaces for future Stripe/Razorpay integration.
 */

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface PlanFeatures {
  maxPatients: number
  maxUsers: number
  analytics: boolean
  auditLogs: boolean
  aiFeatures: boolean
  customBranding: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    maxPatients: 100,
    maxUsers: 2,
    analytics: false,
    auditLogs: false,
    aiFeatures: false,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
  },
  PRO: {
    maxPatients: 5000,
    maxUsers: 10,
    analytics: true,
    auditLogs: true,
    aiFeatures: false,
    customBranding: true,
    apiAccess: true,
    prioritySupport: false,
  },
  ENTERPRISE: {
    maxPatients: -1, // unlimited
    maxUsers: -1,
    analytics: true,
    auditLogs: true,
    aiFeatures: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
  },
}

/**
 * Get features for a given plan.
 */
export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  return PLAN_FEATURES[plan]
}

/**
 * Check if a tenant can perform an action based on their plan.
 */
export function canAccessFeature(plan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
  const features = PLAN_FEATURES[plan]
  return !!features[feature]
}

/**
 * Check if a tenant has reached their patient limit.
 */
export function hasReachedPatientLimit(plan: SubscriptionPlan, currentCount: number): boolean {
  const features = PLAN_FEATURES[plan]
  if (features.maxPatients === -1) return false
  return currentCount >= features.maxPatients
}

/**
 * Check if a tenant has reached their user limit.
 */
export function hasReachedUserLimit(plan: SubscriptionPlan, currentCount: number): boolean {
  const features = PLAN_FEATURES[plan]
  if (features.maxUsers === -1) return false
  return currentCount >= features.maxUsers
}
