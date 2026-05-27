/**
 * Admin gate. Runs on the Edge for `/admin/*` pages and the GET data-export
 * API routes that were previously open and being scraped. The legitimate
 * public `POST /api/registrations` (attendee submits a registration) stays
 * unauthenticated — we only gate GETs on those paths so we don't break the
 * front-of-house signup flow.
 *
 * Verification is the HMAC check from `lib/admin-auth.ts` — no DB, no bcrypt
 * on this hot path; the bcrypt comparison happens only on the login route.
 */

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyAdminSession } from '@/lib/admin-auth';

const ADMIN_PATH_PREFIX = '/admin';
const GATED_API_PREFIXES = ['/api/registrations', '/api/waitlist', '/api/feedback'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never gate the login surfaces themselves — would cause an infinite redirect.
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin-auth/')) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith(ADMIN_PATH_PREFIX);
  const isGatedApi = GATED_API_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isAdminPage && !isGatedApi) {
    return NextResponse.next();
  }

  // POST stays public for attendee registration / waitlist signup / feedback
  // submission. The admin dashboard only ever does GETs against these routes,
  // so this method-aware gate cleanly separates "scrape data" from "submit".
  if (isGatedApi && req.method !== 'GET') {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifyAdminSession(token);

  if (payload) return NextResponse.next();

  if (isAdminPage) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('from', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Gated API call without a valid session → JSON 401.
  return new NextResponse(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}

export const config = {
  // Matcher is OR-evaluated. Admin pages + the three data API trees. The
  // function body further narrows to GET-only for the API trees.
  matcher: [
    '/admin/:path*',
    '/api/registrations/:path*',
    '/api/registrations',
    '/api/waitlist/:path*',
    '/api/waitlist',
    '/api/feedback/:path*',
    '/api/feedback',
  ],
};
