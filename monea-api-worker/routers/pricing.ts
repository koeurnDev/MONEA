import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"

const pricingRouter = new Hono()

pricingRouter.get('/', async (c) => {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        const standard = Number(config?.stadPrice ?? 9.00);
        const pro = Number(config?.proPrice ?? 19.00);
        if (![standard, pro].every((price) => Number.isFinite(price) && price >= 0)) {
            console.error("[API/PRICING] Configured plan prices are invalid");
            c.header('Cache-Control', 'no-store');
            return c.json({ error: "Unable to load current pricing" }, 503);
        }

        // Public, non-user-specific configuration that changes at most a few
        // times a year. Without cache headers every landing-page visit forced a
        // Prisma round trip through the Worker to Neon.
        c.header('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
        c.header('CDN-Cache-Control', 'max-age=300');

        return c.json({ standard, pro });
    } catch (error) {
        console.error("[API/PRICING] Error fetching price:", error);
        // Never let a failure response be cached.
        c.header('Cache-Control', 'no-store');
        return c.json({ error: "Unable to load current pricing" }, 503);
    }
});

export default pricingRouter;
