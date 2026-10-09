import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { fileURLToPath } from "node:url";
import { generateWeddingCode } from "../lib/wedding-code.ts";

config({ path: fileURLToPath(new URL("../.dev.vars", import.meta.url)) });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured in monea-api-worker/.dev.vars");
}

const sql = neon(process.env.DATABASE_URL);
const missing = await sql`
    SELECT id
    FROM "Wedding"
    WHERE "weddingCode" IS NULL OR btrim("weddingCode") = ''
    ORDER BY "createdAt", id
`;

if (!process.argv.includes("--apply")) {
    console.log(`Found ${missing.length} wedding(s) without a code. Run with --apply to assign codes.`);
    process.exit(0);
}

let updated = 0;
for (const wedding of missing) {
    let assigned = false;

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const weddingCode = generateWeddingCode();
        try {
            const result = await sql`
                UPDATE "Wedding"
                SET "weddingCode" = ${weddingCode}
                WHERE id = ${wedding.id}
                  AND ("weddingCode" IS NULL OR btrim("weddingCode") = '')
                RETURNING id
            `;
            if (result.length > 0) updated += 1;
            assigned = true;
            break;
        } catch (error) {
            if (error?.code !== "23505") throw error;
        }
    }

    if (!assigned) {
        throw new Error(`Unable to assign a unique wedding code to wedding ${wedding.id}`);
    }
}

const remaining = await sql`
    SELECT COUNT(*)::int AS count
    FROM "Wedding"
    WHERE "weddingCode" IS NULL OR btrim("weddingCode") = ''
`;

console.log(JSON.stringify({ updated, remaining: remaining[0].count }));
