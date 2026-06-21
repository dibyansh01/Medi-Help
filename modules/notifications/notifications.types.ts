/**
 * Notifications Module — Type Definitions
 * Foundation for push notifications, email, and in-app alerts.
 */

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'MISSED_APPOINTMENT'
  | 'NEW_PATIENT'
  | 'SYSTEM_ALERT'
  | 'BILLING_ALERT'

export interface NotificationPayload {
  type: NotificationType
  recipientId: string
  title: string
  message: string
  metadata?: Record<string, unknown>
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP'
}

export interface Notification {
  id: string
  type: NotificationType
  recipientId: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}
