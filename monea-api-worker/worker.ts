/**
 * Cloudflare Workers entry point for MONEA Hono API.
 * Deploy: npx wrangler deploy
 */
import app from "./hono";
import { cleanupRejectedPaymentReceipts } from "./lib/rejected-payment-receipt-cleanup";

export default {
    fetch: app.fetch,
    scheduled(
        _controller: { scheduledTime: number; cron: string },
        env: Record<string, unknown>,
        context: { waitUntil(promise: Promise<unknown>): void },
    ) {
        context.waitUntil(cleanupRejectedPaymentReceipts(env));
    },
};
