export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import WeddingTemplateFullClient from './client-page';

export const metadata: Metadata = {
    title: 'ពិធីមង្គលការ ភារម្យ & សោភា | Wedding Invitation',
    description: 'សូមគោរពអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។',
    openGraph: {
        title: 'ពិធីមង្គលការ ភារម្យ & សោភា',
        description: 'សូមគោរពអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។',
        images: [
            {
                url: '/couple-main.jpg',
                width: 1200,
                height: 630,
                alt: 'Phearom & Sophea Wedding',
            },
        ],
        type: 'website',
    },
};

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getWeddingData() {
    const wedding = await prisma.wedding.findFirst({
        include: {
            galleryItems: true,
            activities: true
        }
    });
    return wedding;
}

export default async function WeddingTemplateFull() {
    const wedding = await getWeddingData();

    if (!wedding) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                <p>No wedding invitation found.</p>
            </div>
        );
    }

    // Parse themeSettings if it's a string (SQLite storage)
    const parsedWedding = {
        ...wedding,
        themeSettings: typeof wedding.themeSettings === 'string'
            ? JSON.parse(wedding.themeSettings)
            : wedding.themeSettings
    };

    return <WeddingTemplateFullClient wedding={parsedWedding} />;
}
