'use client';

import React, { useState, useEffect } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { useDevBypass } from '@/contexts/dev-bypass-context';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DevBypassToggleProps {
    className?: string;
}

export function DevBypassToggle({ className }: DevBypassToggleProps) {
    const { isDevBypassEnabled, toggleDevBypass, isDevMode } = useDevBypass();
    const [isHydrated, setIsHydrated] = useState(false);

    // Prevent hydration mismatch by only showing after client hydration
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Don't render in production or if not in dev mode
    if (!isDevMode) {
        return null;
    }

    // Don't render until hydrated to prevent SSR mismatch
    if (!isHydrated) {
        return (
            <div
                suppressHydrationWarning
                className={cn(
                    'flex items-center gap-2 rounded-lg border bg-background/80 backdrop-blur-sm p-2 shadow-lg opacity-0',
                    className,
                )}
            >
                {/* Placeholder to maintain layout during hydration */}
            </div>
        );
    }

    return (
        <div
            suppressHydrationWarning
            className={cn(
                'flex items-center gap-2 rounded-lg border bg-background/80 backdrop-blur-sm p-2 shadow-lg',
                className,
            )}
        >
            <Toggle
                pressed={isDevBypassEnabled}
                onPressedChange={toggleDevBypass}
                size="sm"
                variant="outline"
                className={cn(
                    'data-[state=on]:bg-green-500/20 data-[state=on]:text-green-700 data-[state=on]:border-green-500/50',
                    'dark:data-[state=on]:text-green-400 dark:data-[state=on]:border-green-400/50',
                    'transition-all duration-200',
                )}
                aria-label={isDevBypassEnabled ? 'Disable dev bypass' : 'Enable dev bypass'}
            >
                {isDevBypassEnabled ? (
                    <ShieldOff className="h-4 w-4" />
                ) : (
                    <ShieldCheck className="h-4 w-4" />
                )}
            </Toggle>
            <div className="flex flex-col">
                <span className="text-xs font-medium leading-none">
                    {isDevBypassEnabled ? 'Pro Bypass' : 'Auth Active'}
                </span>
                <span className="text-xs text-muted-foreground leading-none mt-0.5">
                    {isDevBypassEnabled ? 'Enabled' : 'Disabled'}
                </span>
            </div>
            {isDevBypassEnabled && (
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
        </div>
    );
}