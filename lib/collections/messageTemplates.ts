export function getReminderMessage(params: {
    customerName: string
    invoiceNo: string
    amount: number
    dueDate: Date
    daysOverdue: number
  }) {
    const { customerName, invoiceNo, amount, dueDate, daysOverdue } = params
  
    if (daysOverdue <= 0) {
      return `Hi ${customerName}, this is a reminder that Invoice ${invoiceNo} of ₹${amount} is due on ${dueDate.toLocaleDateString()}. Please let us know if you need anything. धन्यवाद 🙏`
    }
  
    if (daysOverdue <= 15) {
      return `Hi ${customerName}, Invoice ${invoiceNo} of ₹${amount} is overdue by ${daysOverdue} days. Kindly arrange payment at your earliest. धन्यवाद 🙏`
    }
  
    return `Hi ${customerName}, despite reminders, Invoice ${invoiceNo} of ₹${amount} is overdue by ${daysOverdue} days. Please confirm payment timeline today.`
  }
  