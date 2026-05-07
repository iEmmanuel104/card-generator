// app/api/external-events/webhooks/[partner]/route.ts
//
// Partner-agnostic webhook proxy. Public URL handed to external ticketing
// platforms (EventNoir, Humanitix, etc.) — keeps the v2/server origin private.
//
// Transparent forwarder:
//   • does NOT parse the body (HMAC verification on v2/server depends on the
//     exact bytes the partner signed)
//   • does NOT inspect the partner slug (passed through as a path segment)
//   • forwards original X-Webhook-Signature header so v2/server can verify
//   • adds X-Proxy-Auth header so v2/server knows the request transited
//     through this proxy and not the public Railway origin
//
// Adding a new partner requires zero changes here — the [partner] dynamic
// segment forwards any value, and the per-partner secret lives on v2/server
// as WEBHOOK_SECRET_<PARTNER>.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FORWARDED_HEADERS = [
    'content-type',
    'x-webhook-signature',
    'user-agent',
] as const;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ partner: string }> },
): Promise<NextResponse> {
    const { partner } = await params;

    if (!partner || !/^[a-z0-9_-]+$/i.test(partner)) {
        return NextResponse.json({ error: 'invalid partner' }, { status: 400 });
    }

    const targetBase = process.env.V2_SERVER_INTERNAL_URL;
    const proxySecret = process.env.V2_SERVER_PROXY_SECRET;

    if (!targetBase || !proxySecret) {
        console.error('[external-events-proxy] V2_SERVER_INTERNAL_URL or V2_SERVER_PROXY_SECRET missing');
        return NextResponse.json({ error: 'proxy misconfigured' }, { status: 500 });
    }

    const body = await request.arrayBuffer();

    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }
    headers.set('x-proxy-auth', proxySecret);

    const targetUrl = `${targetBase.replace(/\/$/, '')}/api/v1/external-events/webhooks/${encodeURIComponent(partner)}`;

    let upstream: Response;
    try {
        upstream = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body,
            signal: AbortSignal.timeout(10_000),
        });
    } catch (err) {
        console.error(`[external-events-proxy:${partner}] forward failed:`, err);
        return NextResponse.json({ error: 'upstream unreachable' }, { status: 502 });
    }

    const responseBody = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') ?? 'application/json';

    return new NextResponse(responseBody, {
        status: upstream.status,
        headers: { 'content-type': contentType },
    });
}
