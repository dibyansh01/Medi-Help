'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    PieChart,
    Settings,
    X,
    LogOut,
    Stethoscope,
    IndianRupee,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    isOpen: boolean
    isCollapsed: boolean
    toggleSidebar: () => void
    setIsCollapsed: (value: boolean) => void
}

const navGroups = [
    {
        title: 'Overview',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Analytics', href: '/analytics', icon: PieChart },
        ]
    },
    {
        title: 'Clinic',
        items: [
            { name: 'Patients', href: '/patients', icon: Users },
            { name: 'Follow-ups', href: '/followups', icon: CalendarCheck },
        ]
    },
    {
        title: 'Finance',
        items: [
            { name: 'Billing', href: '/billing', icon: IndianRupee },
        ]
    },
]

export function Sidebar({ isOpen, isCollapsed, toggleSidebar, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 2xl:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'z-50 bg-[#0f172a] border-r border-[#1e293b] transition-[width,transform] duration-300 ease-in-out overflow-y-auto overflow-x-hidden',
                    isOpen ? 'block translate-x-0' : 'hidden 2xl:block 2xl:translate-x-0',
                    isCollapsed ? 'w-[80px]' : 'w-72',
                )}
                style={{
                    width: isCollapsed ? '80px' : '288px',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    backgroundColor: '#0f172a'
                }}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                {/* Header */}
                <div className={cn("sidebar-header flex h-14 items-center transition-all duration-300 border-b border-[#1e293b]", isCollapsed ? "justify-center px-2" : "justify-between px-6")}>
                    <Link href="/dashboard" className={cn("flex items-center font-bold text-white transition-all duration-300", isCollapsed ? "justify-center" : "gap-3")}>
                        <div className="relative flex items-center h-10 px-2">
                            {/* Full logo */}
                            <span
                                className={cn(
                                    "text-white font-bold whitespace-nowrap text-xl flex items-center gap-2",
                                    isCollapsed ? "hidden" : "block"
                                )}
                            >
                                <Stethoscope className="h-5 w-5 text-teal-400" />
                                MediHelp
                            </span>

                            {/* Collapsed logo */}
                            <span
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 text-teal-400 font-extrabold text-lg",
                                    isCollapsed ? "block" : "hidden"
                                )}
                            >
                                <Stethoscope className="h-6 w-6" />
                            </span>
                        </div>
                    </Link>
                    {!isCollapsed && (
                        <button onClick={toggleSidebar} className="2xl:hidden text-white hover:text-teal-400">
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="space-y-2 p-3">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.title} className="sidebar-nav-group">
                            {!isCollapsed && (
                                <h3
                                    className="sidebar-group-title mb-1 px-3 text-[11px] font-bold uppercase tracking-wider"
                                    style={{ color: '#f1f5f9' }}
                                >
                                    {group.title}
                                </h3>
                            )}
                            {isCollapsed && groupIndex > 0 && (
                                <div className="border-t border-[#1e293b] my-2 mx-3" />
                            )}

                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isItemActive = item.href === '/dashboard'
                                        ? pathname === '/dashboard'
                                        : pathname.startsWith(item.href)

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            title={isCollapsed ? item.name : undefined}
                                            className={cn(
                                                'sidebar-nav-item flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap group relative overflow-hidden',
                                                isItemActive
                                                    ? '!bg-teal-600 !text-white shadow-lg shadow-teal-900/20'
                                                    : '!text-[#f1f5f9] hover:bg-[#1e293b] hover:text-white',
                                                isCollapsed && 'justify-center px-0 w-10 h-10 mx-auto rounded-lg'
                                            )}
                                            style={{
                                                backgroundColor: isItemActive ? '#0d9488' : undefined,
                                                color: isItemActive ? '#ffffff' : '#f1f5f9'
                                            }}
                                        >
                                            <item.icon className={cn("transition-transform duration-300 shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4", isItemActive && !isCollapsed && "scale-110")} />
                                            <span className={cn('block transition-all duration-300 overflow-hidden', isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto transform translate-x-0')}>
                                                {item.name}
                                            </span>

                                            {/* Tooltip for collapsed state */}
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-4 bg-[#1e293b] text-white px-3 py-1.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none drop-shadow-lg hidden 2xl:block border border-[#334155]">
                                                    {item.name}
                                                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-[#1e293b]" />
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer p-3 border-t border-[#1e293b] space-y-1">
                    {/* Settings */}
                    <Link
                        href="/settings"
                        title={isCollapsed ? 'Settings' : undefined}
                        className={cn(
                            'sidebar-nav-item flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap group relative overflow-hidden',
                            pathname.startsWith('/settings')
                                ? '!bg-teal-600 !text-white shadow-lg shadow-teal-900/20'
                                : '!text-[#f1f5f9] hover:bg-[#1e293b] hover:text-white',
                            isCollapsed && 'justify-center px-0 w-10 h-10 mx-auto rounded-lg'
                        )}
                        style={{
                            backgroundColor: pathname.startsWith('/settings') ? '#0d9488' : undefined,
                            color: pathname.startsWith('/settings') ? '#ffffff' : '#f1f5f9'
                        }}
                    >
                        <Settings className={cn("transition-transform duration-300 shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4", pathname.startsWith('/settings') && !isCollapsed && "scale-110")} />
                        <span className={cn('block transition-all duration-300 overflow-hidden', isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto transform translate-x-0')}>
                            Settings
                        </span>

                        {isCollapsed && (
                            <div className="absolute left-full ml-4 bg-[#1e293b] text-white px-3 py-1.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none drop-shadow-lg hidden 2xl:block border border-[#334155]">
                                Settings
                                <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-[#1e293b]" />
                            </div>
                        )}
                    </Link>

                    <div className={cn("flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[#1e293b] cursor-pointer group", isCollapsed && "justify-center p-0 hover:bg-transparent")}>
                        <div className="sidebar-user-avatar w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-[#1e293b] group-hover:ring-[#334155] transition-all shrink-0">
                            {session?.user?.name?.[0]?.toUpperCase() || 'D'}
                        </div>
                        <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 flex-1')}>
                            <p className="font-semibold text-white text-sm">{session?.user?.name || 'Doctor'}</p>
                            <p className="text-xs text-[#cbd5e1] truncate max-w-[140px]">{session?.user?.email || 'doctor@clinic.com'}</p>
                        </div>
                        {!isCollapsed && (
                            <button
                                onClick={() => signOut()}
                                className="text-[#cbd5e1] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#334155]"
                                title="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}
