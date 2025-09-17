import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/app/actions';
import { type ComprehensiveUserData } from '@/lib/user-data';
import { shouldBypassRateLimits } from '@/ai/providers';
import { getDevBypassStatus } from '@/contexts/dev-bypass-context';

// Mock pro user data for dev bypass
const mockProUserData: ComprehensiveUserData = {
  id: 'dev-bypass-user',
  email: 'dev@scira.ai',
  name: 'Dev Bypass User',
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isProUser: true,
  proSource: 'polar', // Use 'polar' as valid enum value
  subscriptionStatus: 'active',
  polarSubscription: {
    id: 'dev-bypass-polar-sub',
    productId: 'dev-bypass-product',
    status: 'active',
    amount: 0,
    currency: 'USD',
    recurringInterval: 'month',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    canceledAt: null,
  },
  dodoPayments: {
    hasPayments: false,
    expiresAt: null,
    isExpired: false,
    isExpiringSoon: false,
  },
  paymentHistory: [],
};

export function useUserData() {
  // Check for dev bypass
  const devBypassEnabled = getDevBypassStatus();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['comprehensive-user-data'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 30, // 30 minutes - matches server cache
    gcTime: 1000 * 60 * 60, // 1 hour cache retention
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !devBypassEnabled, // Don't fetch if bypass is enabled
  });

  // Use mock data if dev bypass is enabled
  const effectiveUserData = devBypassEnabled ? mockProUserData : userData;
  const effectiveIsLoading = devBypassEnabled ? false : isLoading;

  // Helper function to check if user should have unlimited access for specific models
  const shouldBypassLimitsForModel = (selectedModel: string) => {
    return shouldBypassRateLimits(selectedModel, effectiveUserData);
  };

  return {
    // Core user data
    user: effectiveUserData,
    isLoading: effectiveIsLoading,
    error: devBypassEnabled ? null : error,
    refetch,
    isRefetching: devBypassEnabled ? false : isRefetching,

    // Quick access to commonly used properties
    isProUser: Boolean(effectiveUserData?.isProUser),
    proSource: effectiveUserData?.proSource || 'none',
    subscriptionStatus: effectiveUserData?.subscriptionStatus || 'none',

    // Polar subscription details
    polarSubscription: effectiveUserData?.polarSubscription,
    hasPolarSubscription: Boolean(effectiveUserData?.polarSubscription),

    // DodoPayments details
    dodoPayments: effectiveUserData?.dodoPayments,
    hasDodoPayments: Boolean(effectiveUserData?.dodoPayments?.hasPayments),
    dodoExpiresAt: effectiveUserData?.dodoPayments?.expiresAt,
    isDodoExpiring: Boolean(effectiveUserData?.dodoPayments?.isExpiringSoon),
    isDodoExpired: Boolean(effectiveUserData?.dodoPayments?.isExpired),

    // Payment history
    paymentHistory: effectiveUserData?.paymentHistory || [],

    // Rate limiting helpers - always false if dev bypass is enabled
    shouldCheckLimits: devBypassEnabled ? false : (!effectiveIsLoading && effectiveUserData && !effectiveUserData.isProUser),
    shouldBypassLimitsForModel,

    // Subscription status checks
    hasActiveSubscription: effectiveUserData?.subscriptionStatus === 'active',
    isSubscriptionCanceled: effectiveUserData?.subscriptionStatus === 'canceled',
    isSubscriptionExpired: effectiveUserData?.subscriptionStatus === 'expired',
    hasNoSubscription: effectiveUserData?.subscriptionStatus === 'none',

    // Legacy compatibility helpers
    subscriptionData: effectiveUserData?.polarSubscription
      ? {
        hasSubscription: true,
        subscription: effectiveUserData.polarSubscription,
      }
      : { hasSubscription: false },

    // Map dodoPayments to legacy dodoProStatus structure for settings dialog
    dodoProStatus: effectiveUserData?.dodoPayments
      ? {
        isProUser: effectiveUserData.proSource === 'dodo' && effectiveUserData.isProUser,
        hasPayments: effectiveUserData.dodoPayments.hasPayments,
        expiresAt: effectiveUserData.dodoPayments.expiresAt,
        mostRecentPayment: effectiveUserData.dodoPayments.mostRecentPayment,
        daysUntilExpiration: effectiveUserData.dodoPayments.daysUntilExpiration,
        isExpired: effectiveUserData.dodoPayments.isExpired,
        isExpiringSoon: effectiveUserData.dodoPayments.isExpiringSoon,
        source: effectiveUserData.proSource,
      }
      : null,

    expiresAt: effectiveUserData?.dodoPayments?.expiresAt,
  };
}

// Lightweight hook for components that only need to know if user is pro
export function useIsProUser() {
  const { isProUser, isLoading } = useUserData();
  return { isProUser, isLoading };
}

// Hook for components that need subscription status but not all user data
export function useSubscriptionStatus() {
  const {
    subscriptionStatus,
    proSource,
    hasActiveSubscription,
    isSubscriptionCanceled,
    isSubscriptionExpired,
    hasNoSubscription,
    isLoading,
  } = useUserData();

  return {
    subscriptionStatus,
    proSource,
    hasActiveSubscription,
    isSubscriptionCanceled,
    isSubscriptionExpired,
    hasNoSubscription,
    isLoading,
  };
}

// Export the comprehensive type for components that need it
export type { ComprehensiveUserData };
