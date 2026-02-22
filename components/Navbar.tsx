'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/* ---------------- Nav Config ---------------- */

const CASH_IN_LINKS = [
  { href: '/customers', label: 'Customers' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/followups', label: 'Collections' },
]

const CASH_OUT_LINKS = [
  { href: '/expenses', label: 'Expenses' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/vendor-invoices', label: 'Vendor Invoices' },
  { href: '/payables-queue', label: 'Payables' },
]

/* ---------------- Helpers ---------------- */

function getActiveLabel(
  pathname: string,
  links: { href: string; label: string }[]
) {
  const match = links.find(link => pathname.startsWith(link.href))
  return match?.label ?? null
}

/* ---------------- Dropdown ---------------- */

function Dropdown({
  label,
  links,
  active,
}: {
  label: string
  links: { href: string; label: string }[]
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1 text-sm font-medium transition ${active
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
          }`}
      >
        {label}
        <span className="text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------- Navbar ---------------- */

export default function Navbar() {
  const pathname = usePathname()

  const activeCashInLabel = getActiveLabel(pathname, CASH_IN_LINKS)
  const activeCashOutLabel = getActiveLabel(pathname, CASH_OUT_LINKS)

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-lg text-gray-900 hover:text-blue-600 transition"
          >
            MSME Cashflow
          </Link>

          {/* Dashboard */}
          <Link
            href="/"
            className={`text-sm font-medium ${pathname === '/'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Dashboard
          </Link>

          {/* Cash In */}
          <div className="flex items-center gap-2">
            <Dropdown
              label="Cash In"
              links={CASH_IN_LINKS}
              active={!!activeCashInLabel}
            />
            {activeCashInLabel && (
              <span className="text-sm font-medium text-gray-700">
                {activeCashInLabel}
              </span>
            )}
          </div>

          {/* Cash Out */}
          <div className="flex items-center gap-2">
            <Dropdown
              label="Cash Out"
              links={CASH_OUT_LINKS}
              active={!!activeCashOutLabel}
            />
            {activeCashOutLabel && (
              <span className="text-sm font-medium text-gray-700">
                {activeCashOutLabel}
              </span>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
            ACpppppp
          </div>
        </div>

      </div>
    </nav>
  )
}