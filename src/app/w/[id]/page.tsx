import { WeddingData } from "@/components/templates/types";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Hero from "@/components/wedding/Hero";
import Countdown from "@/components/wedding/Countdown";
import Timeline from "@/components/wedding/Timeline";
import Gallery from "@/components/wedding/Gallery";
import Location from "@/components/wedding/Location";
import ModernFullTemplate from "@/components/templates/ModernFullTemplate";
import ClassicKhmer from "@/components/templates/ClassicKhmer";
import ModernMinimal from "@/components/templates/ModernMinimal";
import FloralElegant from "@/components/templates/FloralElegant";
import CanvaInvitation from "@/components/templates/CanvaInvitation";
import EnchantedGarden from "@/components/templates/EnchantedGarden";
import LuxuryGoldTemplate from "@/components/templates/LuxuryGoldTemplate";
import PastelFloralTemplate from "@/components/templates/PastelFloralTemplate";


// Force dynamic rendering since we depend on params and DB
export const dynamic = 'force-dynamic';

async function getWedding(id: string) {
    const wedding = await prisma.wedding.findUnique({
        where: { id },
        include: {
            activities: {
                orderBy: { order: 'asc' }
            },
            galleryItems: {
                orderBy: { createdAt: 'desc' },
                take: 8 // Fetch more for full template
            }
        }
    });
    return wedding;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const wedding = await getWedding(params.id);

    if (!wedding) {
        return {
            title: "Wedding Invitation Not Found",
        };
    }

    const title = `${wedding.groomName} & ${wedding.brideName} - Wedding Invitation`;
    const description = `Join us in celebrating our special day on ${new Date(wedding.date).toLocaleDateString()}.`;
    const imageUrl = (wedding.themeSettings as any)?.shareImage || (wedding.themeSettings as any)?.heroImage || '/og-default.jpg';

    // Dynamic OG Image Integration
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monea.com';
    const heroImage = (wedding.themeSettings as any)?.heroImage || '';
    const ogImageUrl = `${baseUrl}/api/og?groom=${encodeURIComponent(wedding.groomName)}&bride=${encodeURIComponent(wedding.brideName)}&date=${encodeURIComponent(new Date(wedding.date).toISOString())}&type=${wedding.eventType || 'wedding'}&image=${encodeURIComponent(heroImage)}`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [ogImageUrl],
        },
    };
}

export default async function SmartQRPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { template?: string }
}) {
    const wedding = await getWedding(params.id);

    if (!wedding) {
        return notFound();
    }

    // Select the template component logic
    const renderTemplate = () => {
        // Priority: URL Param > DB Value > Default
        const id = searchParams.template || wedding.templateId || "modern-full";

        // Dynamically imported or standard imported components
        switch (id) {
            case "classic-khmer":
            case "anniversary-classic":
                return <ClassicKhmer wedding={wedding as any} />;
            case "modern-minimal":
                return <ModernMinimal wedding={wedding as any} />;
            case "floral-elegant":
            case "elegant-pink":
                return <FloralElegant wedding={wedding as any} />;
            case "canva-style":
                return <CanvaInvitation wedding={wedding as any} />;
            case "enchanted-garden":
                return <EnchantedGarden wedding={wedding as any} />;
            case "anniversary-golden":
            case "luxury-gold":
                return <LuxuryGoldTemplate wedding={wedding as any} />;
            case "anniversary-floral":
            case "pastel-floral":
                return <PastelFloralTemplate wedding={wedding as any} />;
            case "modern-full":
                return <ModernFullTemplate wedding={wedding as any} />;
            default:
                return <ModernFullTemplate wedding={wedding as any} />;
        }
    };

    return renderTemplate();
}
