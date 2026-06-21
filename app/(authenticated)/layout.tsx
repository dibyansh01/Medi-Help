'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layouts/Sidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Authenticated Layout — Used for all authenticated pages.
 * Renders sidebar navigation and handles mobile menu toggle.
 * Auth check is handled at the page level via getServerSession.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex min-h-screen w-full">
        {/* Spacer for Sidebar - Desktop Only */}
        <div
          className="hidden 2xl:block shrink-0 transition-all duration-300 ease-in-out"
          style={{ width: isCollapsed ? '80px' : '288px' }}
        />

        <div className="flex flex-col flex-1 min-w-0">
          {/* Mobile Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 2xl:hidden">
            <button
              className="p-2 -ml-2 rounded-md hover:bg-muted"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
