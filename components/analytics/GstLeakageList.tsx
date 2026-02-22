import { Badge } from '@/app/components/ui/Badge';

interface LeakageItem {
    name: string;
    value: number;
    percentage: number;
}

interface GstLeakageListProps {
    items: LeakageItem[];
    type: 'Category' | 'Vendor';
}

export function GstLeakageList({ items, type }: GstLeakageListProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p>No GST leakage found 🎉</p>
                <p className="text-xs mt-1">All expenses are eligible for input credit.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, idx) => {
                const isCritical = item.percentage > 15; // >15% of total leakage is critical
                return (
                    <div key={idx} className="relative group">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`font-medium text-sm ${isCritical ? 'font-bold !text-red-900 dark:!text-red-200' : '!text-slate-900 dark:!text-slate-100'}`}>
                                {item.name}
                                {isCritical && <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-semibold">High</span>}
                            </span>
                            <span className="font-bold text-sm !text-red-600 dark:!text-red-400">
                                ₹{item.value.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${isCritical ? 'bg-red-600' : 'bg-red-400/70'}`}
                                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs w-10 text-right font-mono !text-slate-600 dark:!text-slate-400">
                                {item.percentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
