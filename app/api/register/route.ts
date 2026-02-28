// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Registration, EventSlug } from '@/lib/types';
import { getEventConfig } from '@/lib/events';
import { sendRegistrationConfirmation } from '@/lib/email';

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get('email');
    const event = request.nextUrl.searchParams.get('event');

    if (!email || !event) {
        return NextResponse.json({ registered: false });
    }

    try {
        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const existing = await db.collection('registrations').findOne(
            { email, event },
            { projection: { socialCard: 1, name: 1 } }
        );

        if (existing) {
            return NextResponse.json({
                registered: true,
                socialCard: existing.socialCard,
                name: existing.name,
            });
        }

        return NextResponse.json({ registered: false });
    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json({ registered: false });
    }
}

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("eventRegistrations");

        const body = await request.json();
        const { event, role, name, email, phoneNumber, profilePhoto, socialCard, organization, talkTitle, bio } = body;

        // Validate event
        let eventConfig;
        try {
            eventConfig = getEventConfig(event as EventSlug);
        } catch {
            return NextResponse.json(
                { success: false, message: 'Invalid event' },
                { status: 400 }
            );
        }

        // Validate role
        if (role !== 'attendee' && role !== 'speaker') {
            return NextResponse.json(
                { success: false, message: 'Invalid role. Must be "attendee" or "speaker"' },
                { status: 400 }
            );
        }

        // Validate speaker fields
        if (role === 'speaker') {
            if (!talkTitle || !bio) {
                return NextResponse.json(
                    { success: false, message: 'Speakers must provide a talk title and bio' },
                    { status: 400 }
                );
            }
        }

        // Check for duplicate registration
        const existing = await db.collection('registrations').findOne({ event, email });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Already registered for this event' },
                { status: 409 }
            );
        }

        // Build registration document
        const registration: Omit<Registration, '_id'> = {
            event,
            role,
            name,
            email,
            phoneNumber,
            profilePhoto,
            socialCard,
            organization: organization || undefined,
            emailSent: false,
            createdAt: new Date(),
            ...(role === 'speaker' ? { talkTitle, bio } : {}),
        } as Omit<Registration, '_id'>;

        const result = await db.collection('registrations').insertOne(registration);

        // Attempt email sending
        const emailResult = await sendRegistrationConfirmation({
            to: email,
            name,
            event: eventConfig,
            role,
            socialCardUrl: socialCard,
            talkTitle: role === 'speaker' ? talkTitle : undefined,
        });

        // Update emailSent status
        if (emailResult.sent) {
            await db.collection('registrations').updateOne(
                { _id: result.insertedId },
                { $set: { emailSent: true } }
            );
        }

        return NextResponse.json({
            success: true,
            registrationId: result.insertedId,
            emailSent: emailResult.sent,
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error processing registration'
        }, { status: 500 });
    }
}
