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

        // Add custom headers for keep-alive
        const headers = new Headers(init?.headers);
        headers.set('Connection', 'keep-alive');
        headers.set('Keep-Alive', 'timeout=400, max=1000');
        enhancedInit.headers = headers;

        console.log(`🌐 Enhanced fetch called for: ${typeof input === 'string' ? input : input.toString()}`);
        console.log(`⏱️  Timeout set to: ${400000}ms (6.6 minutes)`);

        try {
            return await originalFetch(input, enhancedInit);
        } catch (error) {
            console.error('🔥 Enhanced fetch error:', error);
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
        console.log(`🌐 XMLHttpRequest timeout set to: ${this.timeout}ms`);
        return originalSend.call(this, body);
    };

    console.log('✅ XMLHttpRequest patched with extended timeouts');
}

// Export configuration for reference
export const ENHANCED_TIMEOUT_CONFIG = {
    fetchTimeout: 400000, // 6.6 minutes
    xhrTimeout: 400000,   // 6.6 minutes
    keepAliveTimeout: 400, // 400 seconds
    maxConnections: 1000,
};