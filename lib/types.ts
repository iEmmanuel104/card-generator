// lib/types.ts
import { ObjectId } from 'mongodb';

// Event types
export type EventSlug = 'this-is-lagos' | 'through-her-lens';
export type RegistrationRole = 'attendee' | 'speaker';

export interface EventPartner {
    name: string;
    logoPath: string;
    url?: string;
}

export interface EventConfig {
    slug: EventSlug;
    name: string;
    tagline: string;
    date: string;
    time: string;
    venue: string;
    theme: 'light' | 'dark';
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
    };
    cardTemplate: {
        path: string;
        width: number;
        height: number;
    };
    speakersEnabled: boolean;
    partners: EventPartner[];
    mediaPartners: EventPartner[];
}

// Registration types
export interface BaseRegistration {
    _id?: ObjectId;
    event: EventSlug;
    role: RegistrationRole;
    name: string;
    email: string;
    phoneNumber: string;
    organization?: string;
    profilePhoto: string;
    socialCard: string;
    emailSent: boolean;
    createdAt: Date;
}

export interface SpeakerRegistration extends BaseRegistration {
    role: 'speaker';
    talkTitle: string;
    bio: string;
}

export type AttendeeRegistration = BaseRegistration & { role: 'attendee' };

export type Registration = AttendeeRegistration | SpeakerRegistration;

// Legacy type for backward compatibility with existing TIL data
export interface LegacyRegistration {
    _id?: ObjectId;
    name: string;
    email: string;
    phoneNumber: string;
    profilePhoto: string;
    socialCard: string;
    createdAt: Date;
}

// Client-side form data types
export interface BaseFormData {
    name: string;
    email: string;
    phoneNumber: string;
    photo: string;
    organization: string;
}

export interface SpeakerFormData extends BaseFormData {
    talkTitle: string;
    bio: string;
}

// Admin dashboard types
export interface RegistrationFilters {
    event?: EventSlug;
    role?: RegistrationRole;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}
