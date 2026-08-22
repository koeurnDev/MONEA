import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/signin/handler';

const router = new Hono();

router.post('/', async (c) => {
    return await nextRoute.POST(c.req.raw);
});

router.options('/', async (c) => {
    return await nextRoute.OPTIONS(c.req.raw);
});

export default router;

