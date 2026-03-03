import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Filter, Document } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, position, expectation } = body;

        if (!name || !email || !position || !expectation) {
            return NextResponse.json(
                { error: 'All fields are required: name, email, position, expectation' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const collection = db.collection('waitlist');

        const existing = await collection.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json(
                { error: 'This email is already on the waitlist' },
                { status: 409 }
            );
        }

        const result = await collection.insertOne({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            position,
            expectation: expectation.trim(),
            createdAt: new Date(),
        });

        return NextResponse.json(
            { success: true, id: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Waitlist signup error:', error);
        return NextResponse.json(
            { error: 'Failed to join waitlist' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const collection = db.collection('waitlist');

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const position = searchParams.get('position');
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

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

        const [data, total, positionBreakdown] = await Promise.all([
            collection
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray(),
            collection.countDocuments(filter),
            collection.aggregate([
                { $group: { _id: '$position', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]).toArray(),
        ]);

        const totalAll = await collection.countDocuments();

        return NextResponse.json({
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            stats: {
                total: totalAll,
                byPosition: positionBreakdown.reduce(
                    (acc, item) => ({ ...acc, [item._id as string]: item.count }),
                    {} as Record<string, number>
                ),
            },
        });
    } catch (error) {
        console.error('Error fetching waitlist:', error);
        return NextResponse.json(
            { error: 'Failed to fetch waitlist data' },
            { status: 500 }
        );
    }
}
