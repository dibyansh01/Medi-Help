/**
 * Calculates the date for today and a future date N days from now.
 * @param {number} n - Number of days to look ahead
 * @returns {Object} Object containing `now` (current date) and `future` (date N days from now)
 */
export function getNextNDays(n: number) {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + n)

  return { now, future }
}

export type DateRangePreset = 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'this_year' | 'next_month' | 'this_week'

export function getDateRangeFromPreset(preset: string): { startDate: Date; endDate: Date } | null {
  const now = new Date()
  let startDate = new Date()
  let endDate = new Date() // Default end date usually varies

  switch (preset) {
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'last_30_days':
      startDate.setDate(now.getDate() - 30)
      endDate = new Date() // Up to now
      break
    case 'last_90_days':
      startDate.setDate(now.getDate() - 90)
      endDate = new Date()
      break
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
      break
    case 'next_month':
      // useful for "Due Date"
      startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0)
      break
    case 'this_week':
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
      startDate = new Date(now.setDate(diff))
      endDate = new Date(now.setDate(startDate.getDate() + 6))
      break
    default:
      return null
  }

  // Normalize times
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}
