import { Hono, type Context } from 'hono';
import { sendTelegramMessage } from '@/lib/telegram-webhook';

const router = new Hono();

type TelegramWebhookMessage = {
  message?: {
    chat?: {
      id?: number;
    };
    text?: string;
  };
};

function getTelegramWebhookSecret(c: Context): string | undefined {
  // In this worker codebase, env bindings are passed as `c.env` in route handlers.
  const env = c.env as Record<string, unknown> | undefined;
  const secret = env && typeof env.TELEGRAM_WEBHOOK_SECRET === 'string' ? env.TELEGRAM_WEBHOOK_SECRET : undefined;
  return secret;
}

function isTelegramWebhookMessage(value: unknown): value is TelegramWebhookMessage {
  if (!value || typeof value !== 'object') return false;
  const v = value as TelegramWebhookMessage;
  return (
    v &&
    (v.message === undefined || typeof v.message === 'object')
  );
}

function getChatIdFromUpdate(update: TelegramWebhookMessage): number | null {
  const chatId = update.message?.chat?.id;
  return typeof chatId === 'number' ? chatId : null;
}

function getTextFromUpdate(update: TelegramWebhookMessage): string | null {
  const text = update.message?.text;
  return typeof text === 'string' ? text : null;
}

async function handleCommand({ chatId, text }: { chatId: number; text: string }): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) return false;

  const [command] = trimmed.split(/\s+/);
  switch (command) {
    case '/start':
      await sendTelegramMessage({
        chatId,
        text: 'Welcome to MONEA! 👋\n\nUse this bot to get quick help and updates.',
      });
      return true;
    default:
      await sendTelegramMessage({
        chatId,
        text: "I didn't recognize that command. Try /start.",
      });
      return true;
  }
}

router.post('/', async (c) => {
  const secretHeader = c.req.header('X-Telegram-Bot-Api-Secret-Token');
  const expectedSecret = getTelegramWebhookSecret(c);
  if (!expectedSecret || typeof expectedSecret !== 'string') {
    return c.json({ error: 'Server misconfigured: TELEGRAM_WEBHOOK_SECRET missing' }, 500);
  }
  if (!secretHeader || secretHeader !== expectedSecret) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const rawBody: unknown = await c.req.json().catch(() => undefined);
  if (!isTelegramWebhookMessage(rawBody)) {
    return c.json({ error: 'Invalid Telegram webhook payload' }, 400);
  }

  const chatId = getChatIdFromUpdate(rawBody);
  const text = getTextFromUpdate(rawBody);

  if (chatId === null || text === null) {
    // Telegram expects fast 200, but invalid payload should not be retried infinitely.
    return c.json({ error: 'Missing chat.id or message.text' }, 400);
  }

  // Command handling (e.g. /start). For non-commands, keep previous behavior.
  const handled = await handleCommand({ chatId, text });
  if (!handled) {
    await sendTelegramMessage({ chatId, text });
  }

  // Telegram requires an immediate response.
  return c.json({ ok: true });
});

export default router;
