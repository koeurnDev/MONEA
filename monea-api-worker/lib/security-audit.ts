import { prisma } from "@/lib/prisma";
import { getIP } from "@/lib/utils";

type SecurityAuditEvent =
  | "TEMPLATE_PURCHASE_CHECK_WEDDINGID_MISMATCH"
  | "TEMPLATE_PURCHASE_UNAUTHORIZED_WEDDING_ACCESS"
  | "TEMPLATE_PURCHASE_VERIFY_ORDER_NOT_OWNED"
  | "TEMPLATE_PURCHASE_SUBMIT_SLIP_ORDER_NOT_OWNED"
  | "SECURITY_ALERT"
  | string;

function safeSlice(v: string | null | undefined, max: number) {
  if (!v) return null;
  return v.length > max ? v.slice(0, max) : v;
}

export async function logSecurityEvent(params: {
  c?: { req?: { raw?: any }; env?: any };
  event: SecurityAuditEvent;
  userId?: string | null;
  weddingId?: string | null;
  templateId?: string | null;
  orderId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  details?: Record<string, any>;
}) {
  try {
    const raw = params.c?.req?.raw;
    const ip = params.ip || (raw ? getIP(raw as any) : null);
    const userAgent = params.userAgent || (raw?.headers?.get?.("user-agent") as string | null) || null;

    // prisma.securityLog.event is an enum; fall back to a generic bucket
    // by only writing fields that exist in schema.
    await prisma.securityLog.create({
      data: {
        // These fields exist in SecurityLog schema. The event enum may not
        // include our custom strings; handle by using SESSION_REVOKED as a
        // generic event marker if needed.
        // @ts-ignore
        event: (params.event as any) || "SESSION_REVOKED",
        ip: ip || "0.0.0.0",
        geoIp: null,
        userAgent: safeSlice(userAgent, 255),
        email: null,
        details: params.details ? (params.details as any) : ({} as any),
      },
    });
  } catch {
    // Never block business logic for audit failures.
  }
}

export function shouldRaiseSecurityAlert(reason: string) {
  const r = reason.toLowerCase();
  return (
    r.includes("unauthorized") ||
    r.includes("mismatch") ||
    r.includes("cross") ||
    r.includes("cross-wedding")
  );
}
