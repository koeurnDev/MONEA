export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const CACHE_KEY = "public_stats";
const CACHE_TTL = 300; // 5 minutes

export async function GET() {
    try {
        // 1. Try to fetch from Redis Cache
        try {
            const cachedData = await redis.get(CACHE_KEY);
            if (cachedData) {
                console.log("[Stats API] Serving from Cache");
                return NextResponse.json(cachedData, {
                    headers: {
                        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
                        "X-Cache": "HIT"
                    }
                });
            }
        } catch (redisError) {
            console.error("[Stats API] Redis Cache Error:", redisError);
        }

        // 2. Fetch real counts from the database
        const [totalWeddings, totalGuests] = await Promise.all([
            prisma.wedding.count(),
            prisma.guest.count()
        ]);

        const stats = {
            couples: totalWeddings,
            guests: totalGuests,
            templates: 12, 
            events: totalWeddings
        };

        // 3. Cache the result in Redis (Fire and forget)
        redis.set(CACHE_KEY, stats, { ex: CACHE_TTL }).catch((e: unknown) => console.error("[Stats API] Redis Set Error:", e));

        // 4. Return pure raw counts from the database
        return NextResponse.json(stats, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
                "X-Cache": "MISS"
            }
        });
    } catch (error) {
        console.error("Public stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
