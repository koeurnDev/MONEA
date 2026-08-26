import { prisma } from "@/lib/prisma";
import { LogAction } from "@prisma/client";

/**
 * Safe Helper to validate if a string matches Prisma LogAction Enum
 */
function toValidLogAction(action: string): LogAction {
  const upperAction = action ? action.toUpperCase().trim() : "";
  const validActions = Object.values(LogAction) as string[];

  if (validActions.includes(upperAction)) {
    return upperAction as LogAction;
  }

  // Fallback default action if passed action string is invalid
  return (LogAction as any).OTHER || (LogAction as any).UPDATE || "OTHER";
}

/**
 * Non-blocking Activity Logging Utility for MONEA System Events
 */
export async function logActivity(
  weddingId: string,
  action: LogAction | string,
  description: string,
  actorName: string,
  details?: Record<string, any>
): Promise<void> {
  if (!weddingId) return;

  try {
    const validAction = typeof action === "string" ? toValidLogAction(action) : action;
    const cleanDescription = description ? description.trim().slice(0, 1000) : "";
    const cleanActorName = actorName ? actorName.trim().slice(0, 100) : "System";

    await prisma.log.create({
      data: {
        id: globalThis.crypto.randomUUID(),
        weddingId,
        action: validAction,
        description: cleanDescription,
        actorName: cleanActorName,
        ...(details && { details: details as any }),
      },
    });
  } catch (error) {
    // Non-blocking log failure — suppress exception to prevent disrupting primary transaction flow
    console.error("[LogActivity Error]:", error);
  }
}