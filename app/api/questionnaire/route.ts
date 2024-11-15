// app/api/questionnaire/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface QuestionnaireResponse {
    thoughts: string;
    otherThoughts?: string;
    subsectors: string;
    otherSubsector?: string;
    challenges: string;
    otherChallenges?: string;
}

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("eventRegistrations");

        const body: QuestionnaireResponse = await request.json();

        const response = {
            ...body,
            createdAt: new Date(),
        };

        const result = await db.collection('questionnaires').insertOne(response);

        return NextResponse.json({
            success: true,
            responseId: result.insertedId
        }, { status: 201 });
    } catch (error) {
        console.error('Questionnaire submission error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error processing questionnaire submission'
        }, { status: 500 });
    }
}