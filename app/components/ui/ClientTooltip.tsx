'use client'
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface ClientTooltipProps {
    content: string;
    children: React.ReactNode;
}

export function ClientTooltip({ content, children }: ClientTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block ml-2" ref={tooltipRef}>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="cursor-pointer"
            >
                {children}
            </div>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-72 p-4 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Details</h4>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {content}
                    </p>
                </div>
            )}
        </div>
    );
}
