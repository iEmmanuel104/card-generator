// app/api/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Filter, Document } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const collection = db.collection('registrations');

        const searchParams = request.nextUrl.searchParams;
        const event = searchParams.get('event');
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

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

        // Get paginated data
        const skip = (page - 1) * limit;

        const [data, total, statsResult] = await Promise.all([
            collection
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments(filter),
            collection.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        speakers: {
                            $sum: { $cond: [{ $eq: ['$role', 'speaker'] }, 1, 0] },
                        },
                        attendees: {
                            $sum: { $cond: [{ $eq: ['$role', 'attendee'] }, 1, 0] },
                        },
                        emailsSent: {
                            $sum: { $cond: ['$emailSent', 1, 0] },
                        },
                    },
                },
            ]).toArray(),
        ]);

        const stats = statsResult[0] || {
            total: 0,
            speakers: 0,
            attendees: 0,
            emailsSent: 0,
        };

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            data,
            total,
            page,
            totalPages,
            stats: {
                total: stats.total,
                speakers: stats.speakers,
                attendees: stats.attendees,
                emailsSent: stats.emailsSent,
            },
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch registrations' },
            { status: 500 }
        );
    }
}
