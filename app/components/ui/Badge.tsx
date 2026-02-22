import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'unpaid' | 'neutral' | 'secondary';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-100',

        // Paid: Emerald (Money/Success)
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100',

        // Partial: Amber (Warning/Attention)
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-100',

        // Overdue: Red (Critical)
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-100',

        // Unpaid: Rose (Pending but not critical yet)
        unpaid: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-100',

        neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    };

    return (
        <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
      shadow-sm
      ${variants[variant]}
      ${className}
    `}>
            {children}
        </span>
    );
}
