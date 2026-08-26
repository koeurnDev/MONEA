import { Hono } from 'hono'

const sentryTunnelRouter = new Hono()

sentryTunnelRouter.post('/', async (c) => {
    try {
        const body = await c.req.text();
        if (!body) return c.json({ error: "Empty body" }, 400);

        const envelope = body.split("\n");
        const header = JSON.parse(envelope[0]);

        if (!header.dsn) {
            return c.json({ error: "No DSN found" }, 400);
        }

        const dsn = new URL(header.dsn);
        const projectId = dsn.pathname.replace("/", "");
        const sentryHost = dsn.host;
        const sentryUrl = `https://${sentryHost}/api/${projectId}/envelope/`;

        await fetch(sentryUrl, {
            method: "POST",
            body,
        });

        return c.json({ ok: true });
    } catch (e) {
        console.error("Sentry tunnel error:", e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default sentryTunnelRouter;
