import { Hono } from 'hono'

const pingRouter = new Hono()

pingRouter.get('/', (c) => {
    return c.json({ pong: true, time: new Date().toISOString() });
});

export default pingRouter;
