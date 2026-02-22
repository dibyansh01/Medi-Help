'use client'

import { useFormState } from 'react-dom'
import {
  createFollowUpAction,
  type FollowupFormState,
} from './actions'
import { useState } from 'react'

function getSuggestedNextDate(status: string) {
  const base = new Date()
  base.setHours(0, 0, 0, 0)

  switch (status) {
    case 'PROMISED':
      base.setDate(base.getDate() + 2)
      break
    case 'NO_RESPONSE':
      base.setDate(base.getDate() + 1)
      break
    case 'DISPUTED':
      base.setDate(base.getDate() + 5)
      break
    default:
      return ''
  }

  return base.toISOString().slice(0, 10)
}

export default function FollowupForm({
  invoiceId,
}: {
  invoiceId: string
}) {
  // ✅ CORRECT WRAPPER WITH TYPES
  async function action(
    prevState: FollowupFormState,
    formData: FormData
  ): Promise<FollowupFormState> {
    return createFollowUpAction(invoiceId, prevState, formData)
  }

  const initialState: FollowupFormState = {
    error: undefined,
    success: false,
  }

  const [state, formAction] = useFormState(
    action,
    initialState
  )

  const [status, setStatus] = useState('PROMISED')
  const [nextDate, setNextDate] = useState(
    getSuggestedNextDate('PROMISED')
  )

  function handleStatusChange(val: string) {
    setStatus(val)
    setNextDate(getSuggestedNextDate(val))
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-yellow-50 border border-yellow-300 p-2 text-sm text-yellow-800 rounded">
          ⚠ {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 border border-green-300 p-2 text-sm text-green-800 rounded">
          ✅ Follow-up saved successfully
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Method
        </label>
        <select
          name="method"
          className="border p-2 w-full rounded"
          required
        >
          <option value="CALL">Call</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
          <option value="VISIT">Visit</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Status
        </label>
        <select
          name="status"
          value={status}
          onChange={(e) =>
            handleStatusChange(e.target.value)
          }
          className="border p-2 w-full rounded"
          required
        >
          <option value="PROMISED">Promised to Pay</option>
          <option value="NO_RESPONSE">No Response</option>
          <option value="DISPUTED">Disputed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          className="border p-2 w-full rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Next Follow-up Date
        </label>
        <input
          type="date"
          name="nextFollowUpOn"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <button className="bg-black text-white px-4 py-2 rounded">
        Save Follow-up
      </button>
    </form>
  )
}
