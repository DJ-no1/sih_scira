import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const authRoutes = ['/sign-in', '/sign-up'];
const protectedRoutes = ['/lookout'];

// Check if dev bypass is enabled
function isDevBypassEnabled(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'development') return false;

  const bypassCookie = request.cookies.get('dev-bypass-enabled');
  if (bypassCookie) {
    try {
      return JSON.parse(bypassCookie.value);
    } catch {
      return false;
    }
  }

  // Default to true in development mode if no cookie is set
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Pathname: ', pathname);

  // Check for dev bypass first
  const devBypassEnabled = isDevBypassEnabled(request);
  if (devBypassEnabled) {
    console.log('🔧 Dev bypass enabled - skipping auth checks for:', pathname);
    return NextResponse.next();
  }

  if (pathname === '/api/search') return NextResponse.next();
  if (pathname.startsWith('/new') || pathname.startsWith('/api/search')) {
    return NextResponse.next();
  }

  // /api/payments/webhooks is a webhook endpoint that should be accessible without authentication
  if (pathname.startsWith('/api/payments/webhooks')) {
    return NextResponse.next();
  }

  // /api/auth/polar/webhooks
  if (pathname.startsWith('/api/auth/polar/webhooks')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/auth/dodopayments/webhooks')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/raycast')) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  // If user is authenticated but trying to access auth routes
  if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
    console.log('Redirecting to home');
    console.log('Session cookie: ', sessionCookie);
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!sessionCookie && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
