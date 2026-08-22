import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/inspect/handler';

const router = new Hono();

router.get('/', async (c) => {
    // @ts-ignore
    return await nextRoute.GET(c.req.raw);
});

export default router;

