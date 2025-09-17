'use client';

import { useDevBypass } from '@/contexts/dev-bypass-context';
import { useEffect } from 'react';

/**
 * This component synchronizes the dev bypass state between client and server
 * by setting cookies and headers that can be accessed in middleware and server functions
 */
export function DevBypassSync() {
    const { isDevBypassEnabled } = useDevBypass();

    useEffect(() => {
        // Only run on client side to prevent hydration issues
        if (typeof window === 'undefined') return;

        // Set cookie for middleware access
        document.cookie = `dev-bypass-enabled=${isDevBypassEnabled}; path=/; SameSite=Lax`;

        // Store in global window object for easy access
        (window as any).__DEV_BYPASS_ENABLED__ = isDevBypassEnabled;
    }, [isDevBypassEnabled]);

    return null; // This component doesn't render anything
}