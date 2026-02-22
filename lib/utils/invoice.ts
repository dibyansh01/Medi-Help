
export function calculateGstAmounts({
  amountEntered,
  gstRate,
  isGstInclusive,
}: {
  amountEntered: number
  gstRate?: number | null
  isGstInclusive: boolean
}) {
  let baseAmount = amountEntered
  let gstAmount = 0
  let totalAmount = amountEntered

  if (!gstRate) {
    return { baseAmount, gstAmount: 0, totalAmount }
  }

  if (!isGstInclusive) {
    gstAmount = amountEntered * (gstRate / 100)
    totalAmount = amountEntered + gstAmount
    return { baseAmount: amountEntered, gstAmount, totalAmount }
  }

  // GST Inclusive
  baseAmount = amountEntered / (1 + gstRate / 100)
  gstAmount = amountEntered - baseAmount

  return { baseAmount, gstAmount, totalAmount: amountEntered }
}
