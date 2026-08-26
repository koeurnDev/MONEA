import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import redis from "@/lib/redis"

const CACHE_KEY = "public_stats";
const CACHE_TTL = 300;

const publicStatsRouter = new Hono()

publicStatsRouter.get('/', async (c) => {
    try {
        try {
            const cachedData = await redis.get(CACHE_KEY);
            if (cachedData) {
                c.header("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
                c.header("X-Cache", "HIT");
                return c.json(cachedData);
            }
        } catch (redisError) {
            console.error("[Stats API] Redis Cache Error:", redisError);
        }

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

        redis.set(CACHE_KEY, stats, { ex: CACHE_TTL }).catch((e: unknown) => console.error("[Stats API] Redis Set Error:", e));

        c.header("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
        c.header("X-Cache", "MISS");
        return c.json(stats);
    } catch (error) {
        console.error("Public stats error:", error);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default publicStatsRouter;
