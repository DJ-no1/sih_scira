'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface DevBypassContextType {
    isDevBypassEnabled: boolean;
    toggleDevBypass: () => void;
    isDevMode: boolean;
}

const DevBypassContext = createContext<DevBypassContextType | undefined>(undefined);

interface DevBypassProviderProps {
    children: React.ReactNode;
}

export function DevBypassProvider({ children }: DevBypassProviderProps) {
    // Check if we're in development mode
    const isDevMode = process.env.NODE_ENV === 'development';

    // Use localStorage to persist bypass state (default: enabled in dev mode)
    const [isDevBypassEnabled, setIsDevBypassEnabled] = useLocalStorage('dev-bypass-enabled', isDevMode);
    const [isHydrated, setIsHydrated] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const toggleDevBypass = useCallback(() => {
        setIsDevBypassEnabled((prev) => {
            const newValue = !prev;
            console.log(`🔧 Dev Bypass ${newValue ? 'ENABLED' : 'DISABLED'}`);
            if (newValue) {
                console.log('🚀 Pro features unlocked - bypassing all authentication checks');
            } else {
                console.log('🔒 Pro features locked - authentication checks active');
            }
            return newValue;
        });
    }, [setIsDevBypassEnabled]);

    // Log bypass status on mount
    useEffect(() => {
        if (isHydrated && isDevMode && isDevBypassEnabled) {
            console.log('🔧 Dev Bypass is ACTIVE - Pro features unlocked');
        }
    }, [isDevMode, isDevBypassEnabled, isHydrated]);

    // Only provide bypass functionality in development mode and after hydration
    // During SSR, always return the default state to prevent hydration mismatch
    const effectiveBypassEnabled = isHydrated && isDevMode && isDevBypassEnabled;

    const value: DevBypassContextType = {
        isDevBypassEnabled: effectiveBypassEnabled,
        toggleDevBypass,
        isDevMode: isHydrated && isDevMode, // Only show as dev mode after hydration
    };

    return <DevBypassContext.Provider value={value}>{children}</DevBypassContext.Provider>;
}

export function useDevBypass(): DevBypassContextType {
    const context = useContext(DevBypassContext);

    if (context === undefined) {
        throw new Error('useDevBypass must be used within a DevBypassProvider');
    }

    return context;
}

// Global function to check bypass status (for use in server-side code)
export function getDevBypassStatus(): boolean {
    if (typeof window === 'undefined') return false;
    if (process.env.NODE_ENV !== 'development') return false;

    try {
        const stored = localStorage.getItem('dev-bypass-enabled');
        return stored ? JSON.parse(stored) : true; // Default to true in dev mode
    } catch {
        return true; // Default to true in dev mode if parsing fails
    }
}