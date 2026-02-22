'use client'

type Props = {
  message: string
  phone?: string
}

/**
 * WhatsApp Actions component.
 * Opens WhatsApp Web with pre-filled message and optional phone number.
 * Reused from MSME system, enhanced with phone pre-fill for clinic context.
 */
export default function WhatsAppActions({ message, phone }: Props) {
  const encodedMessage = encodeURIComponent(message)

  // If phone provided, use wa.me/{phone} to pre-fill the contact
  // Clean phone: remove spaces, dashes, and add country code if needed
  const cleanPhone = phone
    ? phone.replace(/[\s-]/g, '').replace(/^0/, '91').replace(/^\+/, '')
    : ''

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`

  return (
    <div className="flex flex-row gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium transition-colors"
      >
        📲 WhatsApp
      </a>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(message)}
        className="text-primary hover:text-primary/80 text-xs font-medium transition-colors"
      >
        📋 Copy
      </button>
    </div>
  )
}
