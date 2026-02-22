'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'

interface FilterOption {
    label: string
    value: string
}

interface FilterProps {
    paramName: string
    label?: string
    options: FilterOption[]
    className?: string
}

export function Filter({ paramName, label, options, className = '' }: FilterProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const currentValue = searchParams.get(paramName) || ''

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value
        const params = new URLSearchParams(searchParams)

        if (value) {
            params.set(paramName, value)
        } else {
            params.delete(paramName)
        }

        // Reset page to 1 when filtering
        params.set('page', '1')

        replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <div className={`relative ${className}`}>
            {label && <label className="sr-only">{label}</label>}
            <select
                className="block w-full rounded-md border border-slate-300 py-[9px] pl-3 pr-10 text-sm outline-2 bg-white text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                onChange={handleChange}
                value={currentValue}
            >
                <option value="">{label || 'All'}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Chevron Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        </div>
    )
}
