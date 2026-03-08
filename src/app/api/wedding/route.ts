export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";
import { errorResponse } from "@/lib/api-utils";
import { sanitizeObject } from "@/lib/sanitize";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        console.log(`[Wedding API Debug] GET. UserRole: ${user?.role}, UserId: ${user?.userId}`);

        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const full = searchParams.get("full") === "true";

        let wedding;
        const include = full ? {
            galleryItems: true,
            activities: true
        } : undefined;

        if (user.role === "STAFF") {
            wedding = await prisma.wedding.findUnique({
                where: { id: (user as any).weddingId },
                include
            });
        } else {
            wedding = await prisma.wedding.findFirst({
                where: { userId: user.userId },
                include
            });
        }

        if (!wedding) {
            console.log(`[Wedding API Debug] GET. No wedding found for user ${user.userId}`);
            return NextResponse.json({});
        }

        // Decrypt paymentInfo if exists
        try {
            if (wedding.paymentInfo) {
                wedding.paymentInfo = decrypt(wedding.paymentInfo);
            }
        } catch (e: any) {
            console.error(`[Wedding API Debug] Decryption failure: ${e.message}`);
        }

        let responseData: any = wedding;
        if (wedding && typeof wedding.themeSettings === 'string') {
            try {
                const parsed = JSON.parse(wedding.themeSettings);
                responseData = { ...wedding, themeSettings: parsed };
            } catch (e) {
                responseData = { ...wedding, themeSettings: {} };
            }
        }

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error(`[Wedding API Debug] GET CRASH: ${error.message}`, error);
        return errorResponse("Internal Server Error in Wedding GET", 500, error.message);
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        console.log(`[Wedding API Debug] POST. UserRole: ${user?.role}`);

        if (!user) return errorResponse("Unauthorized", 401);

        const body = await req.json();
        const sanitizedBody = sanitizeObject<any>(body);
        const { groomName, brideName, date, location, eventType, paymentInfo } = sanitizedBody;

        // Staff cannot create weddings
        if (user.role === "STAFF") return errorResponse("Staff cannot create weddings", 403);

        const existingWedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        if (existingWedding) {
            return errorResponse("Wedding already exists", 400);
        }

        const wedding = await prisma.wedding.create({
            data: {
                userId: user.userId,
                groomName: groomName || "Groom",
                brideName: brideName || "Bride",
                date: date ? new Date(date) : new Date(),
                location: location || "",
                status: "ACTIVE",
                eventType: eventType || "wedding",
                paymentInfo: paymentInfo ? encrypt(paymentInfo) : null,
                themeSettings: JSON.stringify(body.themeSettings || {}),
            }
        });

        if (wedding.paymentInfo) {
            wedding.paymentInfo = decrypt(wedding.paymentInfo);
        }

        console.log(`[Wedding API Debug] POST Success. WeddingId: ${wedding.id}`);
        return NextResponse.json(wedding);
    } catch (error: any) {
        console.error(`[Wedding API Debug] POST CRASH: ${error.message}`, error);
        return errorResponse("Internal Server Error in Wedding POST", 500, error.message);
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getServerUser();
        console.log(`[Wedding API Debug] PUT. UserRole: ${user?.role}`);

        if (!user) return errorResponse("Unauthorized", 401);

        const body = await req.json();
        const sanitizedBody = sanitizeObject<any>(body);
        const { status, templateId, groomName, brideName, location, date, eventType, paymentInfo } = sanitizedBody;

        let wedding;
        if (user.role === "STAFF") {
            wedding = await prisma.wedding.findUnique({ where: { id: (user as any).weddingId } });
        } else {
            wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        }

        if (!wedding) {
            return errorResponse("Wedding not found", 404);
        }

        const updateData: any = {
            ...(status && { status }),
            ...(templateId && { templateId }),
            ...(groomName && { groomName }),
            ...(brideName && { brideName }),
            ...(location && { location }),
            ...(date && { date: new Date(date) }),
            ...(eventType && { eventType }),
            ...(paymentInfo && { paymentInfo: encrypt(paymentInfo) }),
            ...(sanitizedBody.themeSettings && {
                themeSettings: typeof sanitizedBody.themeSettings === 'string'
                    ? sanitizedBody.themeSettings
                    : JSON.stringify(sanitizedBody.themeSettings)
            }),
        };

        if (sanitizedBody.galleryItems) {
            updateData.galleryItems = {
                deleteMany: {},
                create: sanitizedBody.galleryItems.map((item: any) => ({
                    url: item.url,
                    type: item.type || 'IMAGE',
                    caption: item.caption
                }))
            };
        }

        if (sanitizedBody.activities) {
            updateData.activities = {
                deleteMany: {},
                create: sanitizedBody.activities.map((item: any) => ({
                    title: item.title || "Activity",
                    time: item.time,
                    description: item.description,
                    order: item.order || 0
                }))
            };
        }

        wedding = await prisma.wedding.update({
            where: { id: wedding.id },
            data: updateData
        });

        if (wedding.paymentInfo) {
            wedding.paymentInfo = decrypt(wedding.paymentInfo);
        }

        console.log(`[Wedding API Debug] PUT Success. WeddingId: ${wedding.id}`);
        return NextResponse.json(wedding);
    } catch (error: any) {
        console.error(`[Wedding API Debug] PUT CRASH: ${error.message}`, error);
        return errorResponse("Internal Server Error in Wedding PUT", 500, error.message);
    }
}
