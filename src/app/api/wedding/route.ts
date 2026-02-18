export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";


async function getUser() {
    const token = cookies().get("token")?.value;
    const staffToken = cookies().get("staff_token")?.value;

    if (token) {
        try {
            const decoded = verifyToken(token) as any;
            if (decoded && typeof decoded === "object") {
                const role = decoded.role?.toUpperCase() || "ADMIN";
                const userId = decoded.userId || decoded.sub || decoded.id;
                return { ...decoded, role, userId } as any;
            }
        } catch (e) { }
    }

    if (staffToken) {
        try {
            const decoded = verifyToken(staffToken) as any;
            if (decoded && typeof decoded === "object" && (decoded.weddingId || decoded.userId)) {
                return { ...decoded, role: "STAFF", userId: decoded.weddingId || decoded.userId } as any;
            }
        } catch (e) { }
    }

    return null;
}

export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let wedding;

    if (user.role?.toUpperCase() === "STAFF") {
        wedding = await prisma.wedding.findUnique({
            where: { id: user.userId },
            include: {
                galleryItems: true,
                activities: true
            }
        });
    } else {
        wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId },
            include: {
                galleryItems: true,
                activities: true
            }
        });
    }

    if (!wedding) return NextResponse.json({});

    // Decrypt paymentInfo if exists
    if (wedding.paymentInfo) {
        wedding.paymentInfo = decrypt(wedding.paymentInfo);
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
}

export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { groomName, brideName, date, location, eventType, paymentInfo } = body;

    const existingWedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
    if (existingWedding) {
        return NextResponse.json({ error: "Wedding already exists" }, { status: 400 });
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

    return NextResponse.json(wedding);
}

export async function PUT(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status, templateId, groomName, brideName, location, date, eventType, paymentInfo } = body;

    let wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });

    if (!wedding) {
        return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
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
        ...(body.themeSettings && { themeSettings: typeof body.themeSettings === 'string' ? body.themeSettings : JSON.stringify(body.themeSettings) }),
    };

    if (body.galleryItems) {
        updateData.galleryItems = {
            deleteMany: {},
            create: body.galleryItems.map((item: any) => ({
                url: item.url,
                type: item.type || 'IMAGE',
                caption: item.caption
            }))
        };
    }

    if (body.activities) {
        updateData.activities = {
            deleteMany: {},
            create: body.activities.map((item: any) => ({
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

    return NextResponse.json(wedding);
}
