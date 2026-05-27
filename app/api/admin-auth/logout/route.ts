/**
 * Admin logout. Clears the session cookie and redirects to /admin/login.
 * Accepts both POST (from a Sign Out button) and GET (so a typed URL also
 * works as a kill-switch).
 */

import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/admin-auth';

function clearCookie(req: NextRequest): NextResponse {
  const res = NextResponse.redirect(new URL('/admin/login', req.url));
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export async function GET(req: NextRequest) {
  return clearCookie(req);
}
export async function POST(req: NextRequest) {
  return clearCookie(req);
}
