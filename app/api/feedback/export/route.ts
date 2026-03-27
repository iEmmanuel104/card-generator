// app/api/feedback/export/route.ts
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

function escapeCsvValue(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function formatScore(score: number | null | undefined): string {
    if (score === null || score === undefined) return 'Prefer not to share';
    return String(score);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const respondentTypeFilter = searchParams.get('respondentType');
        const anonymousFilter = searchParams.get('anonymous');

        const conditions: Record<string, unknown>[] = [{ event: 'through-her-lens' }];
        if (respondentTypeFilter && ['woman', 'ally'].includes(respondentTypeFilter)) {
            conditions.push({ respondentType: respondentTypeFilter });
        }
        if (anonymousFilter === 'true') conditions.push({ isAnonymous: true });
        if (anonymousFilter === 'false') conditions.push({ isAnonymous: false });

        const filter = conditions.length > 1 ? { $and: conditions } : conditions[0];

        const client = await clientPromise;
        const db = client.db('eventRegistrations');
        const records = await db.collection('feedback')
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        const headers = [
            'Submitted At',
            'Respondent Type',
            'Anonymous',
            'Name',
            'Email',
            'Organization',
            'Belonging (Q1)',
            'Fair Treatment (Q2)',
            'Support (Q3)',
            'Has Story',
            'Story Text',
        ];

        const rows = records.map((r) => [
            escapeCsvValue(r.createdAt ? new Date(r.createdAt).toISOString() : ''),
            escapeCsvValue(r.respondentType),
            r.isAnonymous ? 'Yes' : 'No',
            escapeCsvValue(r.isAnonymous ? 'Anonymous' : r.name),
            escapeCsvValue(r.isAnonymous ? '' : r.email),
            escapeCsvValue(r.isAnonymous ? '' : r.organization),
            escapeCsvValue(formatScore(r.belongingScore)),
            escapeCsvValue(formatScore(r.fairTreatmentScore)),
            escapeCsvValue(formatScore(r.supportScore)),
            r.openFeedback ? 'Yes' : 'No',
            escapeCsvValue(r.openFeedback || ''),
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `feedback-through-her-lens-${timestamp}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=${filename}`,
            },
        });
    } catch (error) {
        console.error('Error exporting feedback:', error);
        return new Response('Failed to export feedback', { status: 500 });
    }
}
