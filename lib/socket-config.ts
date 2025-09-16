// Global Node.js configuration for socket timeouts
import http from 'http';
import https from 'https';

// Configure global timeout settings - match enhanced-fetch timeout
const TIMEOUT_DURATION = 400000; // 6.6 minutes
const KEEP_ALIVE_DURATION = 60000; // 1 minute

// Create optimized agents with extended timeouts
export const httpAgent = new http.Agent({
    keepAlive: true,
    timeout: TIMEOUT_DURATION,
    keepAliveMsecs: KEEP_ALIVE_DURATION,
    maxSockets: 100,
    maxFreeSockets: 10,
});

export const httpsAgent = new https.Agent({
    keepAlive: true,
    timeout: TIMEOUT_DURATION,
    keepAliveMsecs: KEEP_ALIVE_DURATION,
    maxSockets: 100,
    maxFreeSockets: 10,
});

// Override global agents
http.globalAgent = httpAgent;
https.globalAgent = httpsAgent;

export const GLOBAL_TIMEOUT_CONFIG = {
    timeout: TIMEOUT_DURATION,
    keepAlive: KEEP_ALIVE_DURATION,
};