// app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { ScoreValue, RespondentType } from '@/lib/types';

const VALID_THL_EVENTS = new Set(['through-her-lens', 'through-her-lens-joburg']);

const VALID_SCORES = new Set([1, 2, 3, 4, 5, null]);

function isValidScore(v: unknown): v is ScoreValue {
    return v === null || (typeof v === 'number' && VALID_SCORES.has(v as ScoreValue));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            event,
            respondentType,
            isAnonymous,
            name,
            email,
            organization,
            belongingScore,
            fairTreatmentScore,
            supportScore,
            openFeedback,
        } = body;

        const eventSlug = (event && VALID_THL_EVENTS.has(event)) ? event : 'through-her-lens-joburg';

        // Validate required fields
        if (!respondentType || !['woman', 'ally'].includes(respondentType)) {
            return NextResponse.json({ error: 'respondentType must be "woman" or "ally"' }, { status: 400 });
        }
        if (typeof isAnonymous !== 'boolean') {
            return NextResponse.json({ error: 'isAnonymous must be a boolean' }, { status: 400 });
        }
        if (!isAnonymous && (!name || typeof name !== 'string' || !name.trim())) {
            return NextResponse.json({ error: 'name is required when not anonymous' }, { status: 400 });
        }
        if (!isValidScore(belongingScore) || !isValidScore(fairTreatmentScore) || !isValidScore(supportScore)) {
            return NextResponse.json({ error: 'scores must be 1–5 or null' }, { status: 400 });
        }
        if (openFeedback && typeof openFeedback === 'string' && openFeedback.length > 300) {
            return NextResponse.json({ error: 'openFeedback must be 300 characters or fewer' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('eventRegistrations');

        const doc: Record<string, unknown> = {
            event: eventSlug,
            respondentType: respondentType as RespondentType,
            isAnonymous,
            belongingScore: belongingScore ?? null,
            fairTreatmentScore: fairTreatmentScore ?? null,
            supportScore: supportScore ?? null,
            createdAt: new Date(),
        };

        // Only store personal info if not anonymous
        if (!isAnonymous) {
            doc.name = name.trim();
            if (email && typeof email === 'string' && email.trim()) doc.email = email.trim().toLowerCase();
            if (organization && typeof organization === 'string' && organization.trim()) doc.organization = organization.trim();
        }

        if (openFeedback && typeof openFeedback === 'string' && openFeedback.trim()) {
            doc.openFeedback = openFeedback.trim();
        }

        const result = await db.collection('feedback').insertOne(doc);

        return NextResponse.json({ success: true, feedbackId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error('Error saving feedback:', error);
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
        const respondentTypeFilter = searchParams.get('respondentType');
        const anonymousFilter = searchParams.get('anonymous');
        const eventFilter = searchParams.get('event');

        const conditions: Record<string, unknown>[] = [];
        if (eventFilter && VALID_THL_EVENTS.has(eventFilter)) {
            conditions.push({ event: eventFilter });
        } else {
            conditions.push({ event: { $in: [...VALID_THL_EVENTS] } });
        }
        if (respondentTypeFilter && ['woman', 'ally'].includes(respondentTypeFilter)) {
            conditions.push({ respondentType: respondentTypeFilter });
        }
        if (anonymousFilter === 'true') conditions.push({ isAnonymous: true });
        if (anonymousFilter === 'false') conditions.push({ isAnonymous: false });

        const filter = conditions.length > 1 ? { $and: conditions } : conditions[0];

        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const collection = db.collection('feedback');

        const [docs, total, statsAgg] = await Promise.all([
            collection
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .toArray(),
            collection.countDocuments(filter),
            collection.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        womenCount: { $sum: { $cond: [{ $eq: ['$respondentType', 'woman'] }, 1, 0] } },
                        allyCount: { $sum: { $cond: [{ $eq: ['$respondentType', 'ally'] }, 1, 0] } },
                        anonymousCount: { $sum: { $cond: ['$isAnonymous', 1, 0] } },
                        avgBelonging: {
                            $avg: {
                                $cond: [
                                    { $and: [{ $ne: ['$belongingScore', null] }, { $ne: ['$belongingScore', '$$REMOVE'] }] },
                                    '$belongingScore',
                                    null,
                                ],
                            },
                        },
                        avgFairTreatment: {
                            $avg: {
                                $cond: [
                                    { $and: [{ $ne: ['$fairTreatmentScore', null] }, { $ne: ['$fairTreatmentScore', '$$REMOVE'] }] },
                                    '$fairTreatmentScore',
                                    null,
                                ],
                            },
                        },
                        avgSupport: {
                            $avg: {
                                $cond: [
                                    { $and: [{ $ne: ['$supportScore', null] }, { $ne: ['$supportScore', '$$REMOVE'] }] },
                                    '$supportScore',
                                    null,
                                ],
                            },
                        },
                    },
                },
            ]).toArray(),
        ]);

        const raw = statsAgg[0] ?? {};
        const stats = {
            total: raw.total ?? 0,
            womenCount: raw.womenCount ?? 0,
            allyCount: raw.allyCount ?? 0,
            anonymousCount: raw.anonymousCount ?? 0,
            avgBelonging: raw.avgBelonging != null ? Math.round(raw.avgBelonging * 10) / 10 : null,
            avgFairTreatment: raw.avgFairTreatment != null ? Math.round(raw.avgFairTreatment * 10) / 10 : null,
            avgSupport: raw.avgSupport != null ? Math.round(raw.avgSupport * 10) / 10 : null,
        };

        return NextResponse.json({
            data: docs.map((d) => ({ ...d, _id: d._id.toString() })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
            stats,
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}
