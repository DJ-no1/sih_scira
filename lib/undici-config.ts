// Configuration for extended timeouts
// This file can be extended when undici becomes available

export const TIMEOUT_CONFIG = {
    timeout: 300000, // 5 minutes
    keepAlive: 30000, // 30 seconds
    headers: 300000, // 5 minutes for headers
    body: 300000, // 5 minutes for body
};

// Log configuration
console.log('🔧 Extended timeout configuration loaded:', TIMEOUT_CONFIG);