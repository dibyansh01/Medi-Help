'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'

interface FilterConfig {
    key: string
    label: string
    // For formatters, e.g. mapping 'PAID' to 'Paid'
    formatValue?: (value: string) => string
}

interface ActiveFiltersProps {
    filters: FilterConfig[]
    className?: string
}

export function ActiveFilters({ filters, className = '' }: ActiveFiltersProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // 1. Identify active filters based on config
    const activeFilters = filters
        .map((config) => {
            const value = searchParams.get(config.key)
            if (!value) return null
            return {
                ...config,
                value,
            }
        })
        .filter((f): f is NonNullable<typeof f> => f !== null)

    if (activeFilters.length === 0) return null

    // 2. Remove a single filter
    function removeFilter(key: string) {
        const params = new URLSearchParams(searchParams)
        params.delete(key)
        params.set('page', '1') // always reset page
        replace(`${pathname}?${params.toString()}`)
    }

    // 3. Clear all filters
    function clearAll() {
        const params = new URLSearchParams(searchParams)
        filters.forEach((f) => params.delete(f.key))
        params.set('page', '1')
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {activeFilters.map((filter) => (
                <span
                    key={filter.key}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                >
                    <span className="text-slate-500">{filter.label}:</span>
                    <span className="text-slate-900">
                        {filter.formatValue ? filter.formatValue(filter.value) : filter.value}
                    </span>
                    <button
                        onClick={() => removeFilter(filter.key)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 focus:outline-none"
                        type="button"
                    >
                        <span className="sr-only">Remove {filter.label} filter</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-3 w-3"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </span>
            ))}

            {activeFilters.length > 1 && (
                <button
                    onClick={clearAll}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline px-2"
                    type="button"
                >
                    Clear all
                </button>
            )}
        </div>
    )
}
