// app/api/upload-social-card/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
    try {
        const { image } = await request.json();

        const result = await cloudinary.uploader.upload(image, {
            folder: 'event-social-cards',
            // transformation: [
            //     { quality: 'auto:best' },
            //     { fetch_format: 'auto' }
            // ]
        });

        return NextResponse.json({ url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json(
            { message: 'Error uploading image to Cloudinary' },
            { status: 500 }
        );
    }
}