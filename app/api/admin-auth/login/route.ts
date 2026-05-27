/**
 * Admin login. Compares the posted email + password to ADMIN_EMAIL +
 * ADMIN_PASSWORD_HASH (env). On match, mints an HMAC-signed cookie and the
 * caller is redirected by the client to `/admin`.
 *
 * Node runtime (not Edge) because bcryptjs is significantly slower on V8 +
 * we want true constant-time bcrypt comparison. The cookie verify in
 * middleware.ts is pure Web Crypto and stays on the Edge.
 *
 * The 250 ms artificial floor on failures masks the timing difference
 * between "user exists / password wrong" and "user doesn't exist" (single
 * shared user here so the latter is just a typo, but the principle holds).
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { COOKIE_NAME, SESSION_SECONDS, signAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(req: Request) {
  const failFloor = new Promise<void>((r) => setTimeout(r, 250));

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminPasswordHash) {
    await failFloor;
    return NextResponse.json({ error: 'admin credentials not configured' }, { status: 500 });
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    await failFloor;
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    await failFloor;
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  }

  const emailOk = timingSafeEqual(email, adminEmail.toLowerCase());
  // ALWAYS bcrypt.compare — even when email is wrong — so the response time
  // doesn't tell an attacker whether the email field landed.
  const passwordOk = await bcrypt.compare(password, adminPasswordHash);

  if (!emailOk || !passwordOk) {
    await failFloor;
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  }

  const token = await signAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return res;
}
