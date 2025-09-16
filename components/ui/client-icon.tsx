'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';

interface ClientIconProps {
    icon: any;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
}

/**
 * Client-only wrapper for HugeiconsIcon to prevent hydration mismatches
 * This component only renders on the client side to ensure consistent rendering
 */
export function ClientIcon({ icon, size = 24, color = "currentColor", strokeWidth = 2, className }: ClientIconProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render anything on the server
    if (!isMounted) {
        return (
            <div
                className={className}
                style={{
                    width: size,
                    height: size,
                    display: 'inline-block',
                    // Invisible placeholder to maintain layout
                    opacity: 0
                }}
            />
        );
    }

    return (
        <HugeiconsIcon
            icon={icon}
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
        />
    );
}