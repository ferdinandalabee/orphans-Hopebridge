import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/volunteer(.*)',
  '/donate(.*)',
  '/api(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const userId = session?.userId;
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If user is not signed in, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is trying to access volunteer dashboard, ensure they have the right role
  if (pathname.startsWith('/dashboard/volunteer')) {
    // Here you can add role-based access control
    // For now, we'll just allow any authenticated user to access volunteer dashboard
    return NextResponse.next();
  }

  // For all other protected routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};