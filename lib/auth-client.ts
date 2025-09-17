import { createAuthClient } from 'better-auth/react';
import { dodopaymentsClient } from '@dodopayments/better-auth';
import { polarClient } from '@polar-sh/better-auth';
import { AUTH_DISABLED } from '@/lib/disable-auth';

export const betterauthClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000',
  plugins: [dodopaymentsClient()],
});

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : 'http://localhost:3000',
  plugins: [polarClient()],
});

const originalHooks = authClient;

// Create wrapper hooks that return null when auth is disabled
export const useSession = () => {
  if (AUTH_DISABLED) {
    return { data: null, isPending: false };
  }
  return originalHooks.useSession();
};

export const signIn = (...args: any[]) => {
  if (AUTH_DISABLED) {
    console.log('Auth disabled - signIn called but ignored');
    return Promise.resolve();
  }
  return originalHooks.signIn(...args);
};

export const signOut = (...args: any[]) => {
  if (AUTH_DISABLED) {
    console.log('Auth disabled - signOut called but ignored');
    return Promise.resolve();
  }
  return originalHooks.signOut(...args);
};

export const signUp = (...args: any[]) => {
  if (AUTH_DISABLED) {
    console.log('Auth disabled - signUp called but ignored');
    return Promise.resolve();
  }
  return originalHooks.signUp(...args);
};
