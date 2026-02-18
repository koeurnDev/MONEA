
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const { public_id, resource_type = 'image' } = await request.json();

        if (!public_id) {
            return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
        }

        const result = await cloudinary.uploader.destroy(public_id, { resource_type });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
