'use client';

import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function UsageLimitIndicator({ current, max, label, size = 'default' }) {
    const { t } = useTranslation();
    const percentage = (current / max) * 100;
    const isExceeding = current > max;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className={`font-medium text-foreground ${size === 'sm' ? 'text-sm' : 'text-base'}`}>{t(label)}</span>
                <span className={`${size === 'sm' ? 'text-sm' : 'text-base'} ${isExceeding ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}>
                    {current} / {max}
                </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${
                        isExceeding ? 'bg-red-500 dark:bg-red-600' : percentage > 80 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-green-500 dark:bg-green-600'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
}
