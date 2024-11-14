// lib/types.ts
import { ObjectId } from 'mongodb';

export interface Registration {
    _id?: ObjectId;
    name: string;
    email: string;
    phoneNumber: string;
    profilePhoto: string;
    socialCard: string;
    createdAt: Date;
}