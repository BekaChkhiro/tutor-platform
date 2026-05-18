import { NextResponse, type NextRequest } from 'next/server';

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

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
}

// Edge-runtime middleware. Performs only a cookie-presence check to avoid
// pulling Prisma / bcrypt / pg into the Edge bundle (Auth.js + database session
// strategy can't be validated in Edge anyway). Role/status checks happen in
// server component layouts via src/lib/auth/guards.ts using the full auth().
//
// x-pathname is forwarded so server components can build a callbackUrl for
// the /login redirect without parsing the request URL themselves.
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    const res = NextResponse.next();
    res.headers.set('x-pathname', pathname);
    return res;
  }

  if (!hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('x-pathname', pathname);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
