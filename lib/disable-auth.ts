import { type ComprehensiveUserData } from '@/lib/user-data';

// Simple auth bypass configuration - set to true to disable auth completely
export const AUTH_DISABLED = true;

// Mock user data for when auth is disabled (currently not used)
export const MOCK_USER_DATA: ComprehensiveUserData = {
    id: 'mock-user',
    email: 'user@example.com',
    emailVerified: true,
    name: 'Mock User',
    image: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    isProUser: true,
    proSource: 'dodo',
    subscriptionStatus: 'active',
    dodoPayments: {
        hasPayments: true,
        expiresAt: new Date('2025-12-31T23:59:59.999Z'),
        isExpired: false,
        isExpiringSoon: false,
    },
    polarSubscription: undefined,
    paymentHistory: [],
};

export function getMockUser(): ComprehensiveUserData | null {
    return AUTH_DISABLED ? MOCK_USER_DATA : null;
}