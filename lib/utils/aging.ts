/**
 * Calculates the number of days an invoice is overdue.
 * @param {Date} dueDate - The due date of the invoice
 * @returns {number} Number of days overdue (positive) or days until due (negative)
 */
export function getDaysOverdue(dueDate: Date) {
  const today = new Date()
  const diff = today.getTime() - new Date(dueDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Determines the aging bucket for an invoice based on days overdue.
 * @param {number} daysOverdue - Number of days the invoice is overdue
 * @returns {string} Aging bucket label (e.g., 'CURRENT', '0-30', '31-60', '90+')
 */
export function getAgingBucket(daysOverdue: number) {
  if (daysOverdue <= 0) return 'CURRENT'
  if (daysOverdue <= 30) return '0-30'
  if (daysOverdue <= 60) return '31-60'
  if (daysOverdue <= 90) return '61-90'
  return '90+'
}
