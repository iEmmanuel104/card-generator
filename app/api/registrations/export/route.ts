// app/api/registrations/export/route.ts
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Filter, Document } from 'mongodb';

function escapeCsvValue(value: string | undefined | null): string {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const collection = db.collection('registrations');

        const searchParams = request.nextUrl.searchParams;
        const event = searchParams.get('event');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        // Build filter using $and to combine conditions safely
        const conditions: Filter<Document>[] = [];

        if (event && (event === 'this-is-lagos' || event === 'through-her-lens')) {
            if (event === 'this-is-lagos') {
                // Include legacy registrations that have no event field
                conditions.push({
                    $or: [
                        { event: 'this-is-lagos' },
                        { event: { $exists: false } },
                        { event: null },
                    ],
                });
            } else {
                conditions.push({ event });
            }
        }

        if (role && (role === 'attendee' || role === 'speaker')) {
            conditions.push({ role });
        }

        if (search && search.trim()) {
            conditions.push({
                $or: [
                    { name: { $regex: search.trim(), $options: 'i' } },
                    { email: { $regex: search.trim(), $options: 'i' } },
                ],
            });
        }

        const filter: Filter<Document> = conditions.length > 0 ? { $and: conditions } : {};

        const records = await collection
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        // Build CSV
        const headers = [
            'Name',
            'Email',
            'Phone',
            'Organization',
            'Role',
            'Event',
            'Talk Title',
            'Bio',
            'Email Sent',
            'Registered At',
        ];

        const rows = records.map((record) => {
            const registeredAt = record.createdAt
                ? new Date(record.createdAt).toISOString()
                : '';

            return [
                escapeCsvValue(record.name),
                escapeCsvValue(record.email),
                escapeCsvValue(record.phoneNumber),
                escapeCsvValue(record.organization),
                escapeCsvValue(record.role),
                escapeCsvValue(record.event),
                escapeCsvValue(record.talkTitle),
                escapeCsvValue(record.bio),
                record.emailSent ? 'Yes' : 'No',
                escapeCsvValue(registeredAt),
            ].join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        const filenameEvent = event || 'all';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `registrations-${filenameEvent}-${timestamp}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=${filename}`,
            },
        });
    } catch (error) {
        console.error('Error exporting registrations:', error);
        return new Response('Failed to export registrations', { status: 500 });
    }
}
