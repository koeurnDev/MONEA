import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/csrf/handler';

const router = new Hono();

router.get('/', async (c) => {
    // @ts-ignore - Some handlers don't take arguments
    return await nextRoute.GET(c.req.raw);
});

export default router;

