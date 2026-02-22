
// Generic Chart Color Palettes
// Bright, distinct colors for categorical data (pie charts, bar charts)
export const CHART_PALETTE_MAIN = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

// Semantic Colors for Data Visualization
export const DATA_COLORS = {
    liability: '#2563eb', // blue-600
    asset: '#16a34a',      // green-600
    danger: '#dc2626',     // red-600
    warning: '#f59e0b',    // amber-500
    info: '#3b82f6',       // blue-500
};

// Semantic Styles (Tailwind classes for UI components)
// Reusable patterns for different data types
export const SEMANTIC_STYLES = {
    info: {
        wrapper: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800",
        label: "text-blue-900 dark:text-blue-200",
        value: "text-blue-800 dark:text-blue-300",
        subtext: "text-blue-700 dark:text-blue-300"
    },
    success: {
        wrapper: "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800",
        label: "text-green-900 dark:text-green-200",
        value: "text-green-800 dark:text-green-300",
        subtext: "text-green-700 dark:text-green-300"
    },
    danger: {
        wrapper: "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50",
        label: "text-red-900 dark:text-red-200",
        value: "text-red-700 dark:text-red-300",
        subtext: "text-red-700 dark:text-red-300"
    },
    warning: {
        wrapper: "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800",
        label: "text-amber-900 dark:text-amber-200",
        value: "text-amber-800 dark:text-amber-300",
        subtext: "text-amber-700 dark:text-amber-300"
    }
};
