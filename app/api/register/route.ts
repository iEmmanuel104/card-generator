// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import clientPromise from '@/lib/mongodb';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Get the public ID of the uploaded image
        const photoPublicId = data.photo.split('/').slice(-1)[0].split('.')[0];

        // Create the overlayed image using Cloudinary transformations
        const overlayedImage = cloudinary.url(photoPublicId, {
            transformation: [
                {
                    width: 400,  // Adjust based on your template
                    height: 400, // Adjust based on your template
                    crop: 'fill',
                    gravity: 'face'
                },
                {
                    overlay: 'lagos_event_template', // Your pre-uploaded template public ID
                    width: 1080,  // Template width
                    height: 1080  // Template height
                },
                {
                    flags: 'layer_apply',
                    gravity: 'center',    // Adjust based on where you want the photo
                    y: 0,                 // Adjust vertical position
                    x: 0                  // Adjust horizontal position
                }
            ],
            quality: 'auto',
            fetch_format: 'auto',
        });

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('lagos-event');

        // Save registration data
        await db.collection('registrations').insertOne({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            photoUrl: data.photo,
            overlayedImageUrl: overlayedImage,
            createdAt: new Date(),
        });

        return NextResponse.json({
            status: 'success',
            overlayedImage,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to process registration' },
            { status: 500 }
        );
    }
}