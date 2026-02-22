'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SearchProps {
    placeholder?: string
}

export function Search({ placeholder = 'Search...' }: SearchProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    // Initialize from URL
    const [term, setTerm] = useState(searchParams.get('q')?.toString() || '')

    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set('q', term)
            } else {
                params.delete('q')
            }

            // Reset page to 1 when searching
            params.set('page', '1')

            replace(`${pathname}?${params.toString()}`, { scroll: false })
        }, 300) // 300ms debounce

        return () => {
            clearTimeout(handler)
        }
    }, [term])

    return (
        <div className="relative flex-1 flex-shrink-0">
            <label htmlFor="search" className="sr-only">
                Search
            </label>
            <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                placeholder={placeholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-primary">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-full h-full"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
            </div>
        </div>
    )
}
