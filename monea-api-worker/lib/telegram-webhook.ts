import { getSecret } from './secrets';

type TelegramSendMessageRequest = {
  chat_id: number;
  text: string;
};

type TelegramApiResponseOk = {
  ok: true;
  result: unknown;
};

type TelegramApiResponseNotOk = {
  ok: false;
  description?: string;
  error_code?: number;
  parameters?: unknown;
};

type TelegramApiResponse = TelegramApiResponseOk | TelegramApiResponseNotOk;

function parseTelegramApiResponse(value: unknown): TelegramApiResponse {
  if (!value || typeof value !== 'object') {
    return { ok: false };
  }
  const v = value as { ok?: unknown; description?: unknown; error_code?: unknown };
  if (v.ok === true) return { ok: true, result: (value as TelegramApiResponseOk).result };
  return {
    ok: false,
    description: typeof v.description === 'string' ? v.description : undefined,
    error_code: typeof v.error_code === 'number' ? v.error_code : undefined,
  };
}

function resolveTelegramToken(env?: Record<string, unknown>): string {
  const token = extractEnvVar('TELEGRAM_BOT_TOKEN', env);
  if (!token || token === 'your_bot_token_here') {
    throw new Error('TELEGRAM_BOT_TOKEN is missing in environment bindings.');
  }
  return token;
}

function extractEnvVar(name: 'TELEGRAM_BOT_TOKEN', env?: Record<string, unknown>): string | undefined {
  const fromBindings = env && typeof env[name] === 'string' ? env[name] : undefined;
  if (fromBindings) return fromBindings;
  // Fallback for local dev / tests.
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }
  // Use existing secrets helper (may throw if missing).
  try {
    const secret = getSecret(name);
    return secret || undefined;
  } catch {
    return undefined;
  }
}

export async function sendTelegramMessage(params: { chatId: number; text: string }): Promise<void> {
  const token = resolveTelegramToken(undefined);
  const request: TelegramSendMessageRequest = {
    chat_id: params.chatId,
    text: params.text,
  };

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const data: unknown = await response.json().catch(() => undefined);
    const parsed = parseTelegramApiResponse(data);
    if (!response.ok || parsed.ok !== true) {
      const description = parsed.ok === false ? parsed.description : undefined;
      throw new Error(`Telegram sendMessage failed${description ? `: ${description}` : ''}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
