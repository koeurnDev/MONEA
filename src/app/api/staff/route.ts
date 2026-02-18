export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";


async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    try {
        const decoded = verifyToken(token) as any;
        if (decoded && typeof decoded === "object") {
            const role = decoded.role?.toUpperCase() || "ADMIN";
            const userId = decoded.userId || decoded.sub || decoded.id;
            return { ...decoded, role, userId } as { userId: string, role: string };
        }
    } catch (e) { }
    return null;
}

export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId },
        include: { staff: true } // Include staff directly
    });

    if (!wedding) {
        return NextResponse.json([]); // Return empty list instead of 404 for new users
    }

    // Lazy Backfill: Verify if any staff is missing an accessToken
    const staffToUpdate = wedding.staff.filter(s => !(s as any).accessToken);
    if (staffToUpdate.length > 0) {
        console.log(`[API/Staff] Backfilling tokens for ${staffToUpdate.length} staff members...`);
        for (const s of staffToUpdate) {
            await prisma.staff.update({
                where: { id: s.id },
                data: { accessToken: crypto.randomUUID() }
            });
        }
        // Refetch to get updated tokens
        const updatedStaff = await prisma.staff.findMany({
            where: { weddingId: wedding.id },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({
            staff: updatedStaff,
            weddingCode: (wedding as any).weddingCode
        });
    }

    // If all good, just return sorted staff
    const sortedStaff = (wedding.staff as any[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
        staff: sortedStaff,
        weddingCode: (wedding as any).weddingCode
    });
}

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId },
        });

        if (!wedding) {
            try {
                wedding = await prisma.wedding.create({
                    data: {
                        userId: user.userId,
                        groomName: "កូនកំលោះ",
                        brideName: "កូនក្រមុំ",
                        date: new Date(),
                    }
                });
            } catch (e) {
                console.error("Failed to auto-create wedding for staff:", e);
                return NextResponse.json({ error: "Failed to create wedding profile" }, { status: 500 });
            }
        }

        const body = await req.json();
        const { name, email, password } = body;

        console.log("[API/Staff] POST request:", { name, email });

        if (!name || !email || !password) {
            return NextResponse.json({ error: "សូមបញ្ចូល ឈ្មោះ, អ៊ីមែល និង ពាក្យសម្ងាត់" }, { status: 400 });
        }

        // Check for Email Uniqueness
        const existingStaff = await prisma.staff.findUnique({
            where: { email }
        });

        if (existingStaff) {
            return NextResponse.json({
                error: "អ៊ីមែលនេះមានប្រើរួចហើយ",
                details: "Email already in use."
            }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const accessToken = crypto.randomUUID();

        const newStaff = await prisma.staff.create({
            data: {
                name,
                email,
                password: hashedPassword,
                weddingId: wedding.id,
                role: "STAFF",
                accessToken,
                pin: null, // Explicitly set null for clarity
            },
        });

        return NextResponse.json(newStaff);
    } catch (e) {
        console.error("[API/Staff] POST Error:", e);
        return NextResponse.json({ error: "Internal Server Error", details: String(e) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId },
    });

    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    // Ensure staff belongs to this user's wedding
    const count = await prisma.staff.count({
        where: { id, weddingId: wedding.id },
    });

    if (count === 0) {
        return NextResponse.json({ error: "Staff not found or access denied" }, { status: 404 });
    }

    await prisma.staff.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
