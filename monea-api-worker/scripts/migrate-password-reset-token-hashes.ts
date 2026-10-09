/**
 * Hash existing plaintext password-reset tokens without invalidating the links
 * already delivered to users.
 *
 * Run once with DATABASE_URL and SECURITY_PEPPER configured:
 * npx tsx scripts/migrate-password-reset-token-hashes.ts
 */
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken, isHashedPasswordResetToken } from "@/lib/password-reset-token";

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required.");
    }
    if (
        !process.env.SECURITY_PEPPER ||
        process.env.SECURITY_PEPPER.length < 32 ||
        process.env.SECURITY_PEPPER === "monea-default-pepper-ch4ng3-me"
    ) {
        throw new Error("A non-default SECURITY_PEPPER of at least 32 characters is required.");
    }

    let cursor: string | undefined;
    let migrated = 0;

    while (true) {
        const tokens = await prisma.passwordResetToken.findMany({
            select: { id: true, email: true, token: true },
            orderBy: { id: "asc" },
            take: 100,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        if (tokens.length === 0) break;

        for (const resetToken of tokens) {
            if (isHashedPasswordResetToken(resetToken.token)) continue;
            const tokenHash = await hashPasswordResetToken(resetToken.token);
            migrated += (await prisma.passwordResetToken.updateMany({
                where: { id: resetToken.id, token: resetToken.token },
                data: { token: tokenHash },
            })).count;
        }

        cursor = tokens[tokens.length - 1].id;
    }

    console.log(`Hashed ${migrated} existing password-reset tokens.`);
}

main()
    .catch(error => {
        console.error("Password-reset token migration failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
