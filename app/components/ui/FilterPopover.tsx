'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

interface FilterPopoverProps {
    children: React.ReactNode
    label?: string
    filterKeys?: string[]
}

export function FilterPopover({ children, label = 'Filters', filterKeys = [] }: FilterPopoverProps) {
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // Internal Logic for Active Count & Clearing
    const activeCount = filterKeys.filter(key => searchParams.has(key)).length

    function handleClear() {
        const params = new URLSearchParams(searchParams)
        filterKeys.forEach(key => params.delete(key))
        params.set('page', '1') // Reset pagination
        replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const hasActiveFilters = activeCount > 0

    return (
        <div className="relative inline-block text-left" ref={popoverRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-md border px-4 py-[9px] text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all
                    ${hasActiveFilters
                        ? 'bg-slate-100 border-slate-300 text-slate-900 ring-1 ring-slate-300'
                        : isOpen
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-white border-gray-200 text-slate-700 hover:bg-slate-50'
                    }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`h-4 w-4 ${hasActiveFilters ? 'text-primary' : 'text-slate-500'}`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                    />
                </svg>
                {label}
                {hasActiveFilters && (
                    <span className="ml-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-200 px-1 text-xs font-semibold text-slate-800">
                        {activeCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-md bg-white border border-slate-200 text-slate-900 shadow-xl ring-1 ring-black/5 focus:outline-none p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <h3 className="font-semibold text-sm text-slate-900">Filters</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClear}
                                className="text-xs text-slate-500 hover:text-red-600 hover:underline font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}
