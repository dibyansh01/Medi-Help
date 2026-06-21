'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'

interface DateRangeFilterProps {
    label: string
    paramPrefix: string // e.g. 'dueDate' -> 'dueDateStart', 'dueDateEnd'
    className?: string
}

export function DateRangeFilter({ label, paramPrefix, className = '' }: DateRangeFilterProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const startParam = `${paramPrefix}Start`
    const endParam = `${paramPrefix}End`

    const currentStart = searchParams.get(startParam) || ''
    const currentEnd = searchParams.get(endParam) || ''

    function handleDateChange(type: 'start' | 'end', value: string) {
        const params = new URLSearchParams(searchParams)
        const key = type === 'start' ? startParam : endParam

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset page to 1
        params.set('page', '1')

        replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <span className="text-xs font-medium text-slate-600 ml-1">{label}</span>
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    className="rounded-md border border-slate-300 py-1.5 px-3 text-sm bg-white text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                    value={currentStart}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    placeholder="Start"
                />
                <span className="text-slate-400">-</span>
                <input
                    type="date"
                    className="rounded-md border border-slate-300 py-1.5 px-3 text-sm bg-white text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                    value={currentEnd}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    placeholder="End"
                />
            </div>
        </div>
    )
}
