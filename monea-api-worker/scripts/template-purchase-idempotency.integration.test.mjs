import assert from "node:assert/strict";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";

// Integration tests for TemplatePurchase business logic idempotency.
//
// Goal:
// - Ensure backend cannot create duplicate ACTIVE licenses for the same
//   (weddingId, templateId).
// - Ensure second activation attempt fails (or updates a single record),
//   but never results in 2 records.
//
// We model the critical DB invariant using the real migration SQL
// for TemplateLicense (TemplateLicense has a UNIQUE(weddingId, templateId)).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, "..");

function readSql(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), "utf8");
}

test("TemplateLicense UNIQUE(weddingId, templateId) prevents duplicate ACTIVE license rows", async () => {
  const db = new PGlite();
  try {
    // Minimal schema required for foreign keys (if any migrations reference them).
    await db.exec(`
      CREATE TYPE "TemplateLicenseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
      CREATE TABLE IF NOT EXISTS "Wedding" (
        id text PRIMARY KEY,
        "userId" text
      );
      ${readSql("drizzle/migrations/0003_template_licensing.sql")}
    `);

    await db.exec(`
      INSERT INTO "Wedding" (id, "userId") VALUES ('w1', 'u1');
    `);

    const weddingId = "w1";
    const templateId = "modern-minimal";

    // First activation attempt creates record.
    await db.exec(`
      INSERT INTO "TemplateLicense" (id, "weddingId", "templateId", status, "purchaseDate", "amount", "currency")
      VALUES ('lic1', '${weddingId}', '${templateId}', 'ACTIVE', CURRENT_TIMESTAMP, 5, 'USD');
    `);

    // Second activation attempt should fail on UNIQUE constraint.
    let failed = false;
    try {
      await db.exec(`
        INSERT INTO "TemplateLicense" (id, "weddingId", "templateId", status, "purchaseDate", "amount", "currency")
        VALUES ('lic2', '${weddingId}', '${templateId}', 'ACTIVE', CURRENT_TIMESTAMP, 5, 'USD');
      `);
    } catch (e) {
      failed = true;
    }

    assert.equal(failed, true, "Second insert must fail to prevent duplicate license rows");

    const rows = await db.query(
      'SELECT COUNT(*)::int AS cnt FROM "TemplateLicense" WHERE "weddingId" = $1 AND "templateId" = $2',
      [weddingId, templateId]
    );
    assert.equal(rows.rows[0].cnt, 1);
  } finally {
    await db.close();
  }
});
