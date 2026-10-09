/**
 * Encrypt existing plaintext TOTP seeds in User and Staff rows.
 * Run once with DATABASE_URL and ENCRYPTION_KEY configured:
 * npx tsx scripts/migrate-totp-secrets.ts
 */
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { encryptTotpSecret, isEncryptedTotpSecret } from "@/lib/totp-secret";

type SecretRow = { id: string; twoFactorSecret: string | null };

async function migrateSecrets(
    findBatch: (cursor?: string) => Promise<SecretRow[]>,
    updateSecret: (
        id: string,
        oldSecret: string,
        encryptedSecret: string,
    ) => Promise<{ count: number }>,
): Promise<number> {
    let cursor: string | undefined;
    let migrated = 0;

    while (true) {
        const rows = await findBatch(cursor);
        if (rows.length === 0) return migrated;

        for (const row of rows) {
            if (!row.twoFactorSecret || isEncryptedTotpSecret(row.twoFactorSecret)) continue;
            const encryptedSecret = await encryptTotpSecret(row.twoFactorSecret);
            migrated += (await updateSecret(row.id, row.twoFactorSecret, encryptedSecret)).count;
        }

        cursor = rows[rows.length - 1].id;
    }
}

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required.");
    }
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
        throw new Error("ENCRYPTION_KEY must be configured with at least 32 characters.");
    }

    const userSecrets = await migrateSecrets(
        cursor => prisma.user.findMany({
            where: { twoFactorSecret: { not: null } },
            select: { id: true, twoFactorSecret: true },
            orderBy: { id: "asc" },
            take: 100,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        }),
        (id, oldSecret, encryptedSecret) => prisma.user.updateMany({
            where: { id, twoFactorSecret: oldSecret },
            data: { twoFactorSecret: encryptedSecret },
        }),
    );

    const staffSecrets = await migrateSecrets(
        cursor => prisma.staff.findMany({
            where: { twoFactorSecret: { not: null } },
            select: { id: true, twoFactorSecret: true },
            orderBy: { id: "asc" },
            take: 100,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        }),
        (id, oldSecret, encryptedSecret) => prisma.staff.updateMany({
            where: { id, twoFactorSecret: oldSecret },
            data: { twoFactorSecret: encryptedSecret },
        }),
    );

    console.log(`Encrypted ${userSecrets} user TOTP seeds and ${staffSecrets} staff TOTP seeds.`);
}

main()
    .catch(error => {
        console.error("TOTP secret migration failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
