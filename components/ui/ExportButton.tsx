'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface ExportButtonProps {
    entity: 'customers' | 'invoices' | 'collection' | 'vendors' | 'expenses' | 'vendor-invoices'
}

export function ExportButton({ entity }: ExportButtonProps) {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)

    const handleExport = async (type: 'excel' | 'pdf') => {
        try {
            setLoading(true)
            const params = new URLSearchParams(searchParams)
            params.set('type', type)
            params.set('entity', entity)

            const response = await fetch(`/api/export?${params.toString()}`)

            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url

            const contentDisposition = response.headers.get('Content-Disposition')
            let filename = `${entity}_export_${Date.now()}.${type === 'excel' ? 'xlsx' : 'pdf'}`

            if (contentDisposition) {
                const matches = /filename="?([^"]+)"?/.exec(contentDisposition)
                if (matches && matches[1]) filename = matches[1]
            }

            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export error:', error)
            alert('Failed to export. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative inline-block text-left min-w-[120px]">
            <select
                className="block w-full rounded-md border border-gray-200 py-[9px] pl-3 pr-10 text-sm outline-2 bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                onChange={(e) => {
                    if (e.target.value) {
                        handleExport(e.target.value as 'excel' | 'pdf')
                        e.target.value = '' // Reset
                    }
                }}
                disabled={loading}
                value=""
            >
                <option value="" disabled>
                    {loading ? 'Exporting...' : 'Export'}
                </option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
            </select>
            {/* Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                {loading ? (
                    <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                )}
            </div>
        </div>
    )
}
