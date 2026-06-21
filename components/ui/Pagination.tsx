'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationProps {
    currentPage: number
    totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Link
                href={createPageURL(currentPage - 1)}
                className={`px-3 py-1 rounded-md border text-sm transition-colors ${currentPage <= 1
                        ? 'pointer-events-none opacity-50 bg-secondary text-muted-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground bg-card'
                    }`}
                aria-disabled={currentPage <= 1}
            >
                Previous
            </Link>

            <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </span>

            <Link
                href={createPageURL(currentPage + 1)}
                className={`px-3 py-1 rounded-md border text-sm transition-colors ${currentPage >= totalPages
                        ? 'pointer-events-none opacity-50 bg-secondary text-muted-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground bg-card'
                    }`}
                aria-disabled={currentPage >= totalPages}
            >
                Next
            </Link>
        </div>
    )
}
