import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/reset-password/handler';

const router = new Hono();

router.post('/', async (c) => {
    return await nextRoute.POST(c.req.raw);
});

export default router;

