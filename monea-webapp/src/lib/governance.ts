import { prisma } from "./prisma";

export const GOVERNANCE_ACTIONS = {
    PUBLISH: "PUBLISH",
    ROLLBACK: "ROLLBACK",
    CONFIG_UPDATE: "CONFIG_UPDATE",
    ENABLE_2FA: "ENABLE_2FA",
    DISABLE_2FA: "DISABLE_2FA",
    REVOKE_SESSIONS: "REVOKE_SESSIONS",
};

export class SystemGovernance {
    static async logAction(actorId: string, actorName: string, action: string, details: any, ip?: string, userAgent?: string) {
        try {
            await prisma.governanceLog.create({
                data: {
                    action: action as any,
                    details: details as any,
                    actorId,
                    actorName,
                    ip,
                    userAgent,
                },
            });
        } catch (error) {
            console.error("Governance Logging Error:", error);
        }
    }

    static async createSnapshot(actorId: string, versionName: string, description?: string) {
        try {
            const currentConfig = await prisma.systemConfig.findUnique({
                where: { id: "GLOBAL" },
            });

            if (!currentConfig) throw new Error("Central configuration not found");

            const snapshot = await prisma.systemVersion.create({
                data: {
                    versionName,
                    configData: currentConfig as any,
                    description,
                    createdBy: actorId,
                },
            });

            return snapshot;
        } catch (error) {
            console.error("Snapshot Creation Error:", error);
            throw error;
        }
    }

    static async rollback(versionId: string, actorId: string, actorName: string) {
        try {
            const version = await prisma.systemVersion.findUnique({
                where: { id: versionId },
            });

            if (!version) throw new Error("Version not found");

            const configData = (version.configData as any) || {};
            delete (configData as any).updatedAt; // Don't overwrite updatedAt with old value

            const updatedConfig = await prisma.systemConfig.update({
                where: { id: "GLOBAL" },
                data: {
                    maintenanceMode: configData.maintenanceMode,
                    allowNewSignups: configData.allowNewSignups,
                    globalCheckIn: configData.globalCheckIn,
                },
            });

            await this.logAction(actorId, actorName, GOVERNANCE_ACTIONS.ROLLBACK, {
                versionId,
                versionName: version.versionName,
            });

            return updatedConfig;
        } catch (error) {
            console.error("Rollback Error:", error);
            throw error;
        }
    }

    static async getHistory() {
        return await prisma.systemVersion.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
        });
    }

    static async getLogs() {
        return await prisma.governanceLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    }
}
