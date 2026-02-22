'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(true)

    // Pages where sidebar should be hidden
    const isPublicPage = pathname === '/login' || pathname === '/'

    return (
        <div className="min-h-screen bg-background text-foreground">
            {!isPublicPage && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    isCollapsed={isCollapsed}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    setIsCollapsed={setIsCollapsed}
                />
            )}


            <div className="flex min-h-screen w-full">
                {/* Spacer for Sidebar - Desktop Only */}
                {!isPublicPage && (
                    <div
                        className="hidden 2xl:block shrink-0 transition-all duration-300 ease-in-out"
                        style={{ width: isCollapsed ? '80px' : '288px' }}
                    />
                )}

                <div className="flex flex-col flex-1 min-w-0">
                    {/* Mobile Header - Only show if not public page */}
                    {!isPublicPage && (
                        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 2xl:hidden">
                            <button
                                className="p-2 -ml-2 rounded-md hover:bg-muted"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            {/* <span className="font-bold text-lg">CashFlow</span> */}
                        </header>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
