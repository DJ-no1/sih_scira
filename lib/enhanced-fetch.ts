// Advanced socket timeout configuration for Node.js
// This file patches the global fetch and socket implementations to force extended timeouts

import { setTimeout } from 'timers/promises';

// Monkey patch the global fetch to always include our timeout
const originalFetch = globalThis.fetch;

if (originalFetch) {
    globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const enhancedInit: RequestInit = {
            ...init,
            // Create a timeout that's longer than our server timeout
            signal: init?.signal || AbortSignal.timeout(400000), // 6.6 minutes
        };

        // Only set basic headers without manual Keep-Alive configuration
        const headers = new Headers(init?.headers);
        // Remove manual Keep-Alive headers that cause conflicts
        enhancedInit.headers = headers;

        console.log(`🌐 Enhanced fetch called for: ${typeof input === 'string' ? input : input.toString()}`);
        console.log(`⏱️  Timeout set to: ${400000}ms (6.6 minutes)`);

        try {
            const response = await originalFetch(input, enhancedInit);
            console.log(`✅ Enhanced fetch successful for: ${typeof input === 'string' ? input : input.toString()}`);
            return response;
        } catch (error: unknown) {
            const url = typeof input === 'string' ? input : input.toString();
            console.error('🔥 Enhanced fetch error for:', url);

            // Type guard for Error objects
            const isError = error instanceof Error;
            const errorDetails = {
                name: isError ? error.name : 'Unknown',
                message: isError ? error.message : String(error),
                cause: isError ? (error as any).cause : undefined,
                stack: isError ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined
            };

            console.error('🔥 Error details:', errorDetails);

            // Enhance error message for better debugging
            if (isError && (error.name === 'AbortError' || error.message.includes('timeout'))) {
                console.error('🕐 Request timed out after 6.6 minutes');
                const timeoutError = new Error(`Request timeout: ${url} took longer than 6.6 minutes to respond`);
                timeoutError.name = 'TimeoutError';
                (timeoutError as any).cause = error;
                throw timeoutError;
            }

            throw error;
        }
    };

    console.log('✅ Global fetch patched with extended timeouts');
}

// Also patch XMLHttpRequest for older code
if (typeof XMLHttpRequest !== 'undefined') {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
        // Set timeout before calling original open
        this.timeout = 400000; // 6.6 minutes
        return originalOpen.call(this, method, url, async ?? true, user, password);
    };

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        // Ensure timeout is set even if not set in open
        if (this.timeout === 0) {
            this.timeout = 400000; // 6.6 minutes
        }

        // Add error event listener for better debugging
        this.addEventListener('timeout', () => {
            console.error('🕐 XMLHttpRequest timeout after 6.6 minutes');
        });

        this.addEventListener('error', (event) => {
            console.error('🔥 XMLHttpRequest error:', event);
        });

        console.log(`🌐 XMLHttpRequest timeout set to: ${this.timeout}ms`);
        return originalSend.call(this, body);
    };

    console.log('✅ XMLHttpRequest patched with extended timeouts');
}

// Export configuration for reference
export const ENHANCED_TIMEOUT_CONFIG = {
    fetchTimeout: 400000, // 6.6 minutes
    xhrTimeout: 400000,   // 6.6 minutes
    headers: 300000,      // 5 minutes
    body: 300000,         // 5 minutes
};