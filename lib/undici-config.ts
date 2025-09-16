// Configuration for extended timeouts
// This file can be extended when undici becomes available

export const TIMEOUT_CONFIG = {
    timeout: 400000, // 6.6 minutes - match enhanced-fetch timeout
    keepAlive: 60000, // 1 minute
    headers: 400000, // 6.6 minutes for headers
    body: 400000, // 6.6 minutes for body
};

// Log configuration
console.log('🔧 Extended timeout configuration loaded:', TIMEOUT_CONFIG);