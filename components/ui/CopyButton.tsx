'use client'

type CopyButtonProps = {
  text: string
}

export default function CopyButton({ text }: CopyButtonProps) {
  function handleCopy() {
    navigator.clipboard.writeText(text)
    alert('Message copied')
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-blue-600 text-xs underline flex items-center gap-1"
    >
      📋 Copy
    </button>
  )
}
