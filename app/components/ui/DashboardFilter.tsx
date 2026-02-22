'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'

export function DashboardFilter({ resetPath = '/dashboard' }: { resetPath?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    const [selectedPreset, setSelectedPreset] = useState('next_30')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [error, setError] = useState('')

    // Initialize from URL
    useEffect(() => {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const preset = searchParams.get('preset')

        if (preset) {
            setSelectedPreset(preset)
            if (preset === 'custom' && from && to) {
                setCustomFrom(from)
                setCustomTo(to)
            }
        } else if (from && to) {
            setSelectedPreset('custom')
            setCustomFrom(from)
            setCustomTo(to)
        } else {
            // Default
            setSelectedPreset('next_30')
        }
    }, [searchParams])

    // Close on click outside
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

    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const applyFilter = (preset: string, fromDate?: string, toDate?: string) => {
        setError('')
        const params = new URLSearchParams(searchParams)

        if (preset !== 'custom') {
            const now = new Date()
            let from = new Date(now)
            let to = new Date(now)

            switch (preset) {
                case 'next_30':
                    to.setDate(to.getDate() + 30)
                    break
                case 'next_7':
                    to.setDate(to.getDate() + 7)
                    break
                case 'this_month':
                    from = new Date(now.getFullYear(), now.getMonth(), 1)
                    to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    break
                case 'last_month':
                    from = new Date(now.getFullYear(), now.getMonth() - 1, 1) // 1st of last month
                    to = new Date(now.getFullYear(), now.getMonth(), 0) // Last day of last month
                    break
                case 'last_3_months':
                    from = new Date(now.getFullYear(), now.getMonth() - 2, 1) // Go back 2 more months from current = last 3 months
                    // Actually usually 'last_3_months' means (Today - 3 months) to Today? 
                    // Or "Previous 3 calendar months"?
                    // Current implementation: now.getMonth() - 2 is start of 3 months ago?
                    // Let's stick to existing logic to avoid regression, but ensure it captures backward data if that's the intent.
                    // GST is retrospective. Future dates ("next_30") are less useful.
                    // For GST we want "Last 3 Months", "This Financial Year", etc.
                    // But for reuse, keep as is.
                    from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
                    to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    break
            }

            params.set('from', formatDateLocal(from))
            params.set('to', formatDateLocal(to))
            params.set('preset', preset)
        } else {
            if (!fromDate || !toDate) {
                setError('Please select both dates')
                return
            }
            if (fromDate > toDate) {
                setError('Start date cannot be after End date')
                return
            }
            params.set('from', fromDate)
            params.set('to', toDate)
            params.set('preset', 'custom')
        }

        router.push(`?${params.toString()}`)
        setIsOpen(false)
    }

    const handleReset = () => {
        router.push(resetPath)
        setIsOpen(false)
        setSelectedPreset('next_30')
        setCustomFrom('')
        setCustomTo('')
    }

    const presetLabels: Record<string, string> = {
        next_30: 'Next 30 Days',
        next_7: 'Next 7 Days',
        this_month: 'This Month',
        last_month: 'Last Month',
        last_3_months: 'Last 3 Months',
        custom: 'Custom Range',
    }

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-border rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-accent transition-colors text-sm font-medium"
            >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{presetLabels[selectedPreset] || 'Select Date Range'}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-sm">Date Range</h3>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {['next_30', 'next_7', 'this_month', 'last_month', 'last_3_months'].map((preset) => (
                            <button
                                key={preset}
                                onClick={() => applyFilter(preset)}
                                className={`px-3 py-2 text-xs font-medium rounded-md border transition-all
                                    ${selectedPreset === preset && selectedPreset !== 'custom'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background hover:bg-secondary border-input'
                                    }`}
                            >
                                {presetLabels[preset]}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4">
                        <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wider">Custom Range</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="text-[10px] text-muted-foreground block mb-1">From</label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => {
                                        setCustomFrom(e.target.value)
                                        setSelectedPreset('custom')
                                    }}
                                    className="w-full text-xs p-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-muted-foreground block mb-1">To</label>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => {
                                        setCustomTo(e.target.value)
                                        setSelectedPreset('custom')
                                    }}
                                    className="w-full text-xs p-2 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-3 py-2 text-xs font-medium rounded-md border border-input hover:bg-secondary transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => applyFilter('custom', customFrom, customTo)}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors
                                    ${selectedPreset === 'custom'
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
