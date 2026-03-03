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
        const collection = db.collection('waitlist');

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const position = searchParams.get('position');

        const conditions: Filter<Document>[] = [];

        if (position && position.trim()) {
            conditions.push({ position });
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

        const headers = ['Name', 'Email', 'Position', 'Expectation', 'Signed Up At'];

        const rows = records.map((record) => {
            const signedUpAt = record.createdAt
                ? new Date(record.createdAt).toISOString()
                : '';

            return [
                escapeCsvValue(record.name),
                escapeCsvValue(record.email),
                escapeCsvValue(record.position),
                escapeCsvValue(record.expectation),
                escapeCsvValue(signedUpAt),
            ].join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `waitlist-${timestamp}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=${filename}`,
            },
        });
    } catch (error) {
        console.error('Error exporting waitlist:', error);
        return new Response('Failed to export waitlist', { status: 500 });
    }
}
