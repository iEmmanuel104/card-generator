// lib/events.ts
import { EventConfig, EventSlug } from './types';

const events: Record<EventSlug, EventConfig> = {
    'this-is-lagos': {
        slug: 'this-is-lagos',
        name: 'This Is Lagos',
        tagline: 'Pre seed launch of the African Creative Fund',
        date: 'November 20th, 2024',
        time: '10:00 AM - 4:00 PM',
        venue: 'Alliance Francaise, Ikoyi, Lagos',
        theme: 'light',
        colors: {
            primary: '#ff0000',
            secondary: '#cc0000',
            accent: '#ff0000',
            background: '#ffffff',
        },
        cardTemplate: {
            path: '/images/template2.jpg',
            width: 1080,
            height: 1274,
        },
        speakersEnabled: false,
        partners: [],
        mediaPartners: [],
    },
    'through-her-lens': {
        slug: 'through-her-lens',
        name: 'Through Her Lens',
        tagline: 'Celebrating the Female Gender and Gender Equality in the Creative Space',
        date: 'March 30, 2026',
        time: '9:00 AM - 4:00 PM',
        venue: 'Alliance Francaise de Lagos',
        theme: 'dark',
        colors: {
            primary: '#dc2626',
            secondary: '#991b1b',
            accent: '#dc2626',
            background: '#0a0a0a',
        },
        cardTemplate: {
            path: '/images/thl-card-template.jpg',
            width: 1080,
            height: 1485,
        },
        cardDateText: 'March 30',
        cardVenueText: 'Alliance Francaise de Lagos.',
        speakersEnabled: true,
        partners: [
            { name: 'Amstel Malta', logoPath: '/partners/through-her-lens/amstel-malta.png' },
            { name: 'Bank of Industry', logoPath: '/partners/through-her-lens/bank-of-industry.png' },
            { name: 'NCAC', logoPath: '/partners/through-her-lens/ncac.jpeg' },
            // { name: 'Nigerian Breweries', logoPath: '/partners/through-her-lens/nigerian-breweries.jpg' },
            // { name: 'UN Women', logoPath: '/partners/through-her-lens/un-women.png' },
            { name: 'Unstereotype Alliance', logoPath: '/partners/through-her-lens/unstereotype-alliance.jpg' },
        ],
        mediaPartners: [
            { name: 'Marketing Edge', logoPath: '/partners/through-her-lens/marketing-edge.webp' },
        ],
    },
    'through-her-lens-joburg': {
        slug: 'through-her-lens-joburg',
        name: 'Through Her Lens - Johannesburg',
        tagline: 'Celebrating the Female Gender and Gender Equality in the Creative Space',
        date: 'April 15, 2026',
        time: '9:00 AM - 2:00 PM',
        venue: 'Forrest Rd & 6th Ave, Inanda, Sandton, 2196, South Africa',
        theme: 'dark',
        colors: {
            primary: '#dc2626',
            secondary: '#991b1b',
            accent: '#dc2626',
            background: '#0a0a0a',
        },
        cardTemplate: {
            path: '/images/thl-card-template.jpg',
            width: 1080,
            height: 1485,
        },
        cardDateText: 'April 15',
        cardVenueText: 'Sandton, Johannesburg.',
        speakersEnabled: true,
        partners: [
            { name: 'Telkom', logoPath: '/partners/through-her-lens-joburg/telkom.png' },
            // { name: 'Amstel Malta', logoPath: '/partners/through-her-lens/amstel-malta.png' },
            // { name: 'Bank of Industry', logoPath: '/partners/through-her-lens/bank-of-industry.png' },
            // { name: 'NCAC', logoPath: '/partners/through-her-lens/ncac.jpeg' },
            { name: 'Unstereotype Alliance', logoPath: '/partners/through-her-lens/unstereotype-alliance.jpg' },
        ],
        mediaPartners: [
            // { name: 'Marketing Edge', logoPath: '/partners/through-her-lens/marketing-edge.webp' },
        ],
    },
    'the-dare-awards': {
        slug: 'the-dare-awards',
        name: 'The Dare Awards',
        tagline: 'A night dedicated to visionaries redefining the creative industry',
        date: 'April 15, 2026',
        time: '6:00 PM - 9:00 PM',
        venue: 'Emperors Palace Johannesburg, 64 Jones Rd, Kempton Park, Johannesburg, South Africa',
        theme: 'dark',
        colors: {
            primary: '#d4af37',
            secondary: '#a8872a',
            accent: '#d4af37',
            background: '#000000',
        },
        cardTemplate: {
            // Not used for card generation (simple RSVP flow), kept for type compatibility
            path: '/images/dare-awards-poster.png',
            width: 1080,
            height: 1485,
        },
        cardDateText: 'April 15',
        cardVenueText: 'Emperors Palace, Johannesburg.',
        speakersEnabled: false,
        partners: [],
        mediaPartners: [],
    },
};

export function getEventConfig(slug: EventSlug): EventConfig {
    const config = events[slug];
    if (!config) {
        throw new Error(`Unknown event: ${slug}`);
    }
    return config;
}

export function getAllEvents(): EventConfig[] {
    return Object.values(events);
}
