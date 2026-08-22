import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"

const systemRouter = new Hono()

systemRouter.get('/status', (c) => {
    c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    c.header("Pragma", "no-cache");
    c.header("Expires", "0");
    return c.json({ maintenance: false });
});

systemRouter.get('/maintenance', async (c) => {
    try {
        const config = await (prisma as any).systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });
        return c.json({ maintenanceMode: config?.maintenanceMode || false });
    } catch (error) {
        return c.json({ maintenanceMode: false });
    }
});

export default systemRouter;
