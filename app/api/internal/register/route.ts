// app/api/internal/register/route.ts
//
// Server-to-server endpoint used by v2/server's external-partner webhook
// forwarder. Bearer-token-protected (INTERNAL_API_TOKEN). Inserts the
// partner-supplied registration document into the `registrations` collection
// so card-generator's existing /admin page renders it under the matching
// event tab.
//
// Public client flows continue to use /api/register — this endpoint does NOT
// modify or replace that path.

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getEventConfig } from '@/lib/events';
import type { EventSlug } from '@/lib/types';

export async function POST(request: NextRequest) {
    const token = process.env.INTERNAL_API_TOKEN;
    if (!token) {
        console.error('[internal/register] INTERNAL_API_TOKEN not configured');
        return NextResponse.json({ success: false, message: 'server misconfigured' }, { status: 500 });
    }

    const auth = request.headers.get('authorization') || '';
    const expected = `Bearer ${token}`;
    // Constant-time-ish compare via length pre-check + char loop; tokens are
    // small so the simple string compare is fine for our threat model here.
    if (auth.length !== expected.length || auth !== expected) {
        return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: 'invalid json' }, { status: 400 });
    }

    const event = body.event as EventSlug | undefined;
    const role = (body.role as string | undefined) || 'attendee';
    const name = body.name as string | undefined;
    const email = body.email as string | undefined;

    if (!event || !name || !email) {
        return NextResponse.json(
            { success: false, message: 'event, name, email are required' },
            { status: 400 },
        );
    }

    try {
        getEventConfig(event);
    } catch {
        return NextResponse.json({ success: false, message: 'invalid event' }, { status: 400 });
    }

    if (role !== 'attendee' && role !== 'speaker') {
        return NextResponse.json({ success: false, message: 'invalid role' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('eventRegistrations');

    // Idempotent on (event, email) — partner retries safely return 409.
    const existing = await db.collection('registrations').findOne({ event, email });
    if (existing) {
        return NextResponse.json(
            { success: false, message: 'Already registered for this event', registrationId: existing._id },
            { status: 409 },
        );
    }

    const registration = {
        event,
        role,
        name,
        email,
        phoneNumber: (body.phoneNumber as string | undefined) || undefined,
        organization: (body.organization as string | undefined) || undefined,
        profilePhoto: (body.profilePhoto as string | undefined) || '',
        socialCard: (body.socialCard as string | undefined) || '',
        emailSent: true, // partner already sent their own confirmation; suppress ours
        createdAt: new Date(),
        username: (body.username as string | undefined) || undefined,
        partner: (body.partner as string | undefined) || undefined,
        partnerRegistrationId: (body.partnerRegistrationId as string | undefined) || undefined,
        rawPayload: (body.rawPayload as Record<string, unknown> | undefined) || undefined,
    };

    const result = await db.collection('registrations').insertOne(registration);

    return NextResponse.json(
        { success: true, registrationId: result.insertedId },
        { status: 201 },
    );
}
