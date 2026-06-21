'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    tooltip?: string;
}

export function Card({ children, className = '', title, tooltip }: CardProps) {
    const [isTooltipOpen, setIsTooltipOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className={`
      relative rounded-2xl
      bg-card border border-card-border
      shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
      transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
      ${isTooltipOpen ? 'z-50' : 'z-0'}
      ${className}
    `}>
            {title && (
                <div className="px-6 py-4 border-b border-card-border flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
                    {tooltip && (
                        <div className="relative inline-block ml-2" ref={tooltipRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsTooltipOpen(!isTooltipOpen);
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
                            >
                                <Info className={`h-4 w-4 ${isTooltipOpen ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`} />
                            </button>

                            {isTooltipOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-72 p-4 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
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
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
