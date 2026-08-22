import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/me/handler';

const router = new Hono();

router.get('/', async (c) => {
    return await nextRoute.GET(c.req.raw);
});

export default router;
