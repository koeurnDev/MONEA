import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"

const pricingRouter = new Hono()

pricingRouter.get('/', async (c) => {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        return c.json({ 
            standard: config?.stadPrice ?? 9.00,
            pro: config?.proPrice ?? 19.00
        });
    } catch (error) {
        console.error("[API/PRICING] Error fetching price:", error);
        return c.json({ standard: 9.00, pro: 19.00 });
    }
});

export default pricingRouter;
