/**
 * Admin auth — HMAC-signed cookie helpers.
 *
 * Single shared admin credential (see ADMIN_EMAIL / ADMIN_PASSWORD_HASH env
 * vars). A successful login mints a cookie of the form `<payload>.<sig>` where
 * payload is base64url-encoded JSON `{ exp: <unix-seconds> }` and sig is the
 * base64url HMAC-SHA256 of that payload using NEXTAUTH_SECRET as the key.
 *
 * The signing scheme is intentionally tiny — no JWT library, no DB. The
 * existence of a valid signature implies "is admin"; rotating NEXTAUTH_SECRET
 * invalidates every outstanding session at once.
 *
 * Web Crypto everywhere so the verify path runs unmodified on the Edge
 * runtime (Next.js middleware).
 */

const COOKIE_NAME = 'blkat_admin';
const SESSION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export { COOKIE_NAME, SESSION_SECONDS };

function getKey(): string {
  const key = process.env.NEXTAUTH_SECRET;
  if (!key) {
    throw new Error('NEXTAUTH_SECRET is not set — refusing to sign/verify admin sessions.');
  }
  return key;
}

function b64urlEncode(bytes: Uint8Array): string {
  // Cross-runtime base64url: btoa works on Edge + Node, replace url-unsafe chars.
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array {
  const norm = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export interface AdminSessionPayload {
  exp: number; // unix seconds
}

/** Sign a fresh session token. Returns the cookie value: `<payload>.<sig>`. */
export async function signAdminSession(): Promise<string> {
  const payload: AdminSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  };
  const payloadStr = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(getKey());
  const sig = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadStr)),
  );
  return `${payloadStr}.${b64urlEncode(sig)}`;
}

/**
 * Verify a token. Returns the payload on success or null on any failure
 * (missing, malformed, bad signature, expired). `crypto.subtle.verify` is
 * constant-time on the underlying digest comparison.
 */
export async function verifyAdminSession(token: string | undefined | null): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadStr, sigStr] = parts;

  let key: CryptoKey;
  try {
    key = await hmacKey(getKey());
  } catch {
    return null;
  }

  let ok: boolean;
  try {
    ok = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlDecode(sigStr),
      new TextEncoder().encode(payloadStr),
    );
  } catch {
    return null;
  }
  if (!ok) return null;

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadStr)));
  } catch {
    return null;
  }

  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
