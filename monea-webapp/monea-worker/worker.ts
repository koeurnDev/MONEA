/**
 * Cloudflare Workers entry point for MONEA Hono API.
 * Deploy: npx wrangler deploy
 */
import app from "./hono";

export default {
    fetch: app.fetch,
};
