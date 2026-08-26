import { prisma } from "./prisma";

export const GOVERNANCE_ACTIONS = {
  PUBLISH: "PUBLISH",
  ROLLBACK: "ROLLBACK",
  CONFIG_UPDATE: "CONFIG_UPDATE",
  ENABLE_2FA: "ENABLE_2FA",
  DISABLE_2FA: "DISABLE_2FA",
  REVOKE_SESSIONS: "REVOKE_SESSIONS",
} as const;

export type GovernanceAction = typeof GOVERNANCE_ACTIONS[keyof typeof GOVERNANCE_ACTIONS];

export class SystemGovernance {
  /**
   * Logs administrative and governance actions for audit trails.
   */
  static async logAction(
    actorId: string,
    actorName: string,
    action: GovernanceAction | string,
    details: Record<string, any>,
    ip?: string,
    userAgent?: string
  ) {
    try {
      await prisma.governanceLog.create({
        data: {
          action: action as any,
          details: details || {},
          actorId,
          actorName,
          ip: ip ? ip.slice(0, 45) : null, // Support IPv6 max length
          userAgent: userAgent ? userAgent.slice(0, 255) : null,
        },
      });
    } catch (error) {
      console.error("[SystemGovernance] Logging Error:", error);
    }
  }

  /**
   * Captures a snapshot of current global configuration state.
   */
  static async createSnapshot(actorId: string, versionName: string, description?: string) {
    try {
      const currentConfig = await prisma.systemConfig.findUnique({
        where: { id: "GLOBAL" },
      });

      if (!currentConfig) {
        throw new Error("Central system configuration (GLOBAL) not found");
      }

      // Clone object without metadata fields
      const { id, createdAt, updatedAt, ...configPayload } = currentConfig as any;

      const snapshot = await prisma.systemVersion.create({
        data: {
          versionName: versionName.trim(),
          configData: configPayload,
          description: description ? description.trim() : null,
          createdBy: actorId,
        },
      });

      return snapshot;
    } catch (error) {
      console.error("[SystemGovernance] Snapshot Creation Error:", error);
      throw error;
    }
  }

  /**
   * Restores global system configuration from a specific snapshot version.
   */
  static async rollback(versionId: string, actorId: string, actorName: string) {
    try {
      const version = await prisma.systemVersion.findUnique({
        where: { id: versionId },
      });

      if (!version) {
        throw new Error("Target configuration version not found");
      }

      const rawConfig = (version.configData as Record<string, any>) || {};

      // Explicitly extract configurable settings safely
      const updatedConfig = await prisma.systemConfig.upsert({
        where: { id: "GLOBAL" },
        update: {
          maintenanceMode: rawConfig.maintenanceMode ?? false,
          allowNewSignups: rawConfig.allowNewSignups ?? true,
          globalCheckIn: rawConfig.globalCheckIn ?? true,
        },
        create: {
          id: "GLOBAL",
          maintenanceMode: rawConfig.maintenanceMode ?? false,
          allowNewSignups: rawConfig.allowNewSignups ?? true,
          globalCheckIn: rawConfig.globalCheckIn ?? true,
        },
      });

      // Audit Log Rollback Event
      await this.logAction(actorId, actorName, GOVERNANCE_ACTIONS.ROLLBACK, {
        versionId,
        versionName: version.versionName,
        restoredSettings: {
          maintenanceMode: updatedConfig.maintenanceMode,
          allowNewSignups: updatedConfig.allowNewSignups,
          globalCheckIn: updatedConfig.globalCheckIn,
        },
      });

      return updatedConfig;
    } catch (error) {
      console.error("[SystemGovernance] Rollback Error:", error);
      throw error;
    }
  }

  /**
   * Retrieves recent configuration versions/snapshots.
   */
  static async getHistory(limit = 20) {
    return await prisma.systemVersion.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Retrieves audit governance logs.
   */
  static async getLogs(limit = 50) {
    return await prisma.governanceLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}