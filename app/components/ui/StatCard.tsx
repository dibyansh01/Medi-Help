'use client'
import Link from 'next/link';
import { Card } from './Card';
import { Info, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    highlight?: boolean;
    color?: 'default' | 'danger' | 'success' | 'warning' | 'info' | 'gray';
    subtext?: string;
    href?: string;
    tooltip?: string;
}

export function StatCard({ title, value, color = 'default', subtext, href, tooltip }: StatCardProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a link
        e.stopPropagation();
        setIsTooltipOpen(!isTooltipOpen);
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsTooltipOpen(false);
            }
        }
        if (isTooltipOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isTooltipOpen]);

    const colorMap = {
        default: 'text-foreground',
        danger: 'text-red-500 dark:text-red-400',
        success: 'text-green-500 dark:text-green-400',
        warning: 'text-amber-500 dark:text-amber-400',
        info: 'text-blue-500 dark:text-blue-400',
        gray: 'text-gray-500 dark:text-gray-400',
    };

    const valueColor = colorMap[color as keyof typeof colorMap] || 'text-foreground';

    const cardContent = (
        <Card className={`hover:scale-[1.02] transition-transform h-full ${href ? 'cursor-pointer' : ''} ${isTooltipOpen ? 'z-50 relative' : ''}`}>
            <div className="flex flex-col gap-1 h-full justify-between">
                <div>
                    <div className="flex items-center justify-between relative">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {title}
                        </p>
                        {tooltip && (
                            <div className="relative" ref={tooltipRef}>
                                <button
                                    onClick={toggleTooltip}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
                                    aria-label="Show info"
                                >
                                    <Info className={`h-4 w-4 ${isTooltipOpen ? 'text-primary' : 'text-gray-400'}`} />
                                </button>

                                {isTooltipOpen && (
                                    <div
                                        className="absolute right-0 top-full mt-2 w-64 p-4 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Details</h4>
                                            <button
                                                onClick={() => setIsTooltipOpen(false)}
                                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {tooltip}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={`text-3xl font-bold ${valueColor}`}>
                        {value}
                    </div>
                </div>
                {subtext && (
                    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                )}
            </div>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
