'use client'

type Props = {
  message: string
}

export default function WhatsAppActions({ message }: Props) {
  const encodedMessage = encodeURIComponent(message)

  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

  return (
    <div className="flex flex-row gap-1">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-700 underline text-sm"
      >
        📲 WhatsApp
      </a>

      {/* <button
        type="button"
        onClick={() => navigator.clipboard.writeText(message)}
        className="text-blue-600 underline text-sm text-left"
      >
        📋 Copy
      </button> */}
    </div>
  )
}
