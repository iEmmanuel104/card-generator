// app/api/register/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Registration } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("eventRegistrations");

        const body = await request.json();

        const registration: Registration = {
            ...body,
            createdAt: new Date(),
        };

        const result = await db.collection<Registration>('registrations').insertOne(registration);

        return NextResponse.json({
            success: true,
            registrationId: result.insertedId
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error processing registration'
        }, { status: 500 });
    }
}