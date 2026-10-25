import { sendTelegramAlert, escapeHtml } from "@/lib/telegram";
import { getSecurityConfig } from "@/lib/config";

export type LifecycleTelegramEvent =
  | "ACCOUNT_CREATED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_CONFIRMED"
  | "TEMPLATE_RECEIPT_SUBMITTED"
  | "TEMPLATE_PAYMENT_CONFIRMED"
  | "TEMPLATE_RECEIPT_REVIEWED";

export interface LifecycleTelegramPayload {
  event: LifecycleTelegramEvent;
  dedupKey: string;
  weddingId?: string | null;
  userId?: string | null;
  orderId?: string | null;
  packageType?: string | null;
  templateId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  decision?: "APPROVED" | "REJECTED" | null;
  actorName?: string | null;
  amount?: number | null;
  currency?: string | null;
  method?: string | null;
}

const DEFAULT_HEADER = "📣 <b>MONEA Updates</b> 📣";
const TEMPLATE_SALES_HEADER = "📣 <b>MONEA Template Sales Alert</b> 📣";

/**
 * Best-effort lifecycle notifications.
 * - Always non-blocking: never throw.
 * - Dedup is handled by caller via dedupKey (we don't have a shared storage here).
 */
export async function notifyTelegramLifecycle(payload: LifecycleTelegramPayload, opts?: { env?: any; dedupAlreadySent?: boolean }) {
  try {
    if (opts?.dedupAlreadySent) return;

    const securityConfig = getSecurityConfig(opts?.env);
    if (!securityConfig.enableAlerts || !securityConfig.channels.telegram) return;

    const lines: string[] = [];
    const eventLabels: Record<LifecycleTelegramEvent, string> = {
      ACCOUNT_CREATED: "Account created",
      PAYMENT_INITIATED: "Payment initiated",
      PAYMENT_CONFIRMED: "Payment confirmed",
      TEMPLATE_RECEIPT_SUBMITTED: "New template payment receipt submitted",
      TEMPLATE_PAYMENT_CONFIRMED: "Template payment confirmed",
      TEMPLATE_RECEIPT_REVIEWED: `Template receipt ${
        payload.decision === "APPROVED" ? "approved" : payload.decision === "REJECTED" ? "rejected" : "reviewed"
      }`,
    };
    lines.push(`🧾 <b>Event:</b> ${escapeHtml(eventLabels[payload.event])}`);
    lines.push(`🔑 <b>Dedup:</b> ${escapeHtml(payload.dedupKey)}`);

    if (payload.userId) lines.push(`👤 <b>User:</b> ${escapeHtml(payload.userId)}`);
    if (payload.userName) lines.push(`🙍 <b>Customer:</b> ${escapeHtml(payload.userName)}`);
    if (payload.userEmail) lines.push(`✉️ <b>Email:</b> ${escapeHtml(payload.userEmail)}`);
    if (payload.weddingId) lines.push(`💍 <b>Wedding:</b> ${escapeHtml(payload.weddingId)}`);
    if (payload.orderId) lines.push(`📦 <b>Order:</b> ${escapeHtml(payload.orderId)}`);
    if (payload.templateId) lines.push(`🎨 <b>Template:</b> ${escapeHtml(payload.templateId)}`);
    else if (payload.packageType) lines.push(`🎁 <b>Package:</b> ${escapeHtml(payload.packageType)}`);
    if (typeof payload.amount === "number") lines.push(`💰 <b>Amount:</b> ${escapeHtml(String(payload.amount))} ${escapeHtml(payload.currency || "")}`);
    if (payload.method) lines.push(`✅ <b>Method:</b> ${escapeHtml(payload.method)}`);
    if (payload.actorName) lines.push(`🛡️ <b>Reviewed by:</b> ${escapeHtml(payload.actorName)}`);

    // sendTelegramAlert already escapes via formatting expectations (we feed escaped content)
    const body = lines.join("\n");
    const header = payload.event.startsWith("TEMPLATE_") ? TEMPLATE_SALES_HEADER : DEFAULT_HEADER;
    await sendTelegramAlert(body, header, opts?.env);
  } catch (err: any) {
    console.error("[Telegram Lifecycle Notification]", err?.message || err);
  }
}
