import { sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle";

type Database = ReturnType<typeof getDb>;

let schemaReady: Promise<void> | null = null;

export async function ensureUserTemplateAccessSchema(db: Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "UserTemplateAccess" (
          "id" text PRIMARY KEY,
          "userId" text NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
          "templateId" text NOT NULL,
          "grantedBy" text,
          "revokedAt" timestamp,
          "revokedBy" text,
          "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.execute(sql`
        ALTER TABLE "UserTemplateAccess"
          ADD COLUMN IF NOT EXISTS "grantedBy" text,
          ADD COLUMN IF NOT EXISTS "revokedAt" timestamp,
          ADD COLUMN IF NOT EXISTS "revokedBy" text,
          ADD COLUMN IF NOT EXISTS "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS "UserTemplateAccess_userId_templateId_key"
        ON "UserTemplateAccess"("userId", "templateId")
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "UserTemplateAccess_userId_revokedAt_idx"
        ON "UserTemplateAccess"("userId", "revokedAt")
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS "UserTemplateAccess_templateId_idx"
        ON "UserTemplateAccess"("templateId")
      `);
    })().catch((error: unknown) => {
      schemaReady = null;
      throw error;
    });
  }

  await schemaReady;
}
