import { Hono } from 'hono'
import { prisma } from "@/lib/prisma"
import { getSystemSocialLinks } from "@/lib/social-links"
import { getDb } from "@/lib/drizzle"
import { systemConfig } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { isPhoneFrameColor } from "@/lib/phone-frame-colors"

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

systemRouter.get('/social-links', async (c) => {
    c.header("Cache-Control", "no-store");
    try {
        return c.json({ links: await getSystemSocialLinks(c.env) });
    } catch (error) {
        console.error("[SYSTEM_SOCIAL_LINKS_GET]", error);
        return c.json({ error: "Failed to fetch social links" }, 500);
    }
});

systemRouter.get('/phone-frame-color', async (c) => {
    c.header("Cache-Control", "no-store");
    try {
        const [config] = await getDb(c.env)
            .select({ phoneFrameColor: systemConfig.phoneFrameColor })
            .from(systemConfig)
            .where(eq(systemConfig.id, "GLOBAL"))
            .limit(1);
        return c.json({
            phoneFrameColor: isPhoneFrameColor(config?.phoneFrameColor) ? config.phoneFrameColor : "black",
        });
    } catch (error) {
        console.error("[SYSTEM_PHONE_FRAME_COLOR_GET]", error);
        return c.json({ error: "Failed to fetch phone frame color" }, 500);
    }
});

export default systemRouter;
