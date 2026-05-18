import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/complete-profile',
  '/tutors',
  '/category',
  '/faq',
  '/contact',
  '/',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session && !isPublic(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (session && !session.user.profileComplete && pathname !== '/complete-profile') {
    const url = req.nextUrl.clone();
    url.pathname = '/complete-profile';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
