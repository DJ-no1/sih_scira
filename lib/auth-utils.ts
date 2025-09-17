import { auth } from '@/lib/auth';
import { config } from 'dotenv';
import { headers } from 'next/headers';
import { User } from './db/schema';
import { sessionCache, extractSessionToken, createSessionKey } from './performance-cache';

config({
  path: '.env.local',
});

// Check if dev bypass is enabled on the server side
async function isDevBypassEnabled(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'development') return false;

  // In server context, we'll also check headers for the bypass flag
  // This will be set by client-side cookie synchronization
  try {
    const requestHeaders = await headers();
    const bypassHeader = requestHeaders.get('x-dev-bypass');
    if (bypassHeader) {
      return bypassHeader === 'true';
    }
  } catch {
    // headers() might not be available in all contexts
  }

  // Default to true in development mode for safety
  return true;
}

// Mock pro user for dev bypass
const mockProUser: User = {
  id: 'dev-bypass-user',
  email: 'dev@scira.ai',
  name: 'Dev Bypass User',
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isProUser: true,
  proSource: 'polar' as const,
  subscriptionStatus: 'active',
  // Add other required User fields with mock values
  username: 'dev-bypass',
  planName: 'Dev Pro',
  planSlug: 'dev-pro',
  planInterval: 'month',
  planIntervalCount: 1,
  subscriptionId: 'dev-bypass-subscription',
  customerId: 'dev-bypass-customer',
  currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  trialEnd: null,
  trialStart: null,
} as User;

export const getSession = async () => {
  // Check for dev bypass first
  const devBypass = await isDevBypassEnabled();
  if (devBypass) {
    console.log('🔧 Dev bypass enabled - returning mock session');
    return {
      user: mockProUser,
      session: {
        id: 'dev-bypass-session',
        userId: mockProUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: 'dev-bypass-token',
        ipAddress: '127.0.0.1',
        userAgent: 'dev-bypass',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }

  const requestHeaders = await headers();
  const sessionToken = extractSessionToken(requestHeaders);

  // Try cache first (only if we have a session token)
  if (sessionToken) {
    const cacheKey = createSessionKey(sessionToken);
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // Only cache valid sessions with users
  if (sessionToken && session?.user) {
    const cacheKey = createSessionKey(sessionToken);
    sessionCache.set(cacheKey, session);
  }

  return session;
};

export const getUser = async (): Promise<User | null> => {
  // Check for dev bypass first
  const devBypass = await isDevBypassEnabled();
  if (devBypass) {
    console.log('🔧 Dev bypass enabled - returning mock pro user');
    return mockProUser;
  }

  const session = await getSession();
  return session?.user as User | null;
};
