// lib/email.ts
import { Resend } from 'resend';
import { EventConfig } from './types';
import { getRegistrationEmailHtml } from './email-templates/registration-confirmation';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendConfirmationParams {
    to: string;
    name: string;
    event: EventConfig;
    role: 'attendee' | 'speaker';
    socialCardUrl?: string;
    talkTitle?: string;
}

export async function sendRegistrationConfirmation(
    params: SendConfirmationParams
): Promise<{ sent: boolean }> {
    if (!resend) {
        console.log('Email sending skipped: RESEND_API_KEY not configured');
        return { sent: false };
    }

    try {
        const html = getRegistrationEmailHtml({
            name: params.name,
            role: params.role,
            eventName: params.event.name,
            eventDate: params.event.date,
            eventTime: params.event.time,
            eventVenue: params.event.venue,
            socialCardUrl: params.socialCardUrl,
            talkTitle: params.talkTitle,
        });

        await resend.emails.send({
            from: 'Blkat Events Through Her Lens <blkatevents@busy2shop.com>',
            to: params.to,
            subject: `Registration Confirmed - ${params.event.name}`,
            html,
        });

        return { sent: true };
    } catch (error) {
        console.error('Failed to send registration email:', error);
        return { sent: false };
    }
}
