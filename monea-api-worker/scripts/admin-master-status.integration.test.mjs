import assert from "node:assert/strict";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import {
    UPDATE_WEDDING_PACKAGE_SQL,
    UPDATE_WEDDING_STATUS_SQL
} from "../lib/adminMasterSql.ts";

test("archive and restore status updates are idempotent and audited atomically", async () => {
    const db = new PGlite();

    try {
        await db.exec(`
            CREATE TYPE "WeddingStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
            CREATE TYPE "PackageType" AS ENUM ('FREE', 'PRO', 'PREMIUM');
            CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'AWAITING_VERIFICATION');
            CREATE TYPE "GovernanceAction" AS ENUM ('CONFIG_UPDATE');
            CREATE TYPE "LogAction" AS ENUM ('UPDATE');
            CREATE TABLE "Wedding" (
                id text PRIMARY KEY,
                status "WeddingStatus" NOT NULL,
                "packageType" "PackageType" NOT NULL,
                "paymentStatus" "PaymentStatus" NOT NULL
            );
            CREATE TABLE "GovernanceLog" (
                id text PRIMARY KEY,
                action "GovernanceAction" NOT NULL,
                details jsonb NOT NULL,
                "actorId" text NOT NULL,
                "actorName" text NOT NULL,
                ip text,
                "userAgent" text
            );
            CREATE TABLE "Log" (
                id text PRIMARY KEY,
                action "LogAction" NOT NULL,
                description text NOT NULL,
                "actorName" text NOT NULL,
                ip text,
                "userAgent" text,
                "weddingId" text NOT NULL
            );
            INSERT INTO "Wedding" (id, status, "packageType", "paymentStatus")
            VALUES ('wedding-1', 'ACTIVE', 'FREE', 'PENDING');
        `);

        const changeStatus = async (id, status, reason, auditId) => db.query(UPDATE_WEDDING_STATUS_SQL, [
            id,
            status,
            "admin-1",
            "Test Admin",
            "127.0.0.1",
            "integration-test",
            `governance-${auditId}`,
            reason,
            `wedding-log-${auditId}`
        ]);

        const archived = await changeStatus("wedding-1", "ARCHIVED", "integration archive reason", "archive");
        assert.deepEqual(archived.rows, [{ id: "wedding-1", changed: true }]);
        assert.equal((await db.query('SELECT status FROM "Wedding" WHERE id = $1', ["wedding-1"])).rows[0].status, "ARCHIVED");

        const duplicateArchive = await changeStatus("wedding-1", "ARCHIVED", "duplicate request reason", "duplicate");
        assert.deepEqual(duplicateArchive.rows, [{ id: "wedding-1", changed: false }]);
        assert.equal((await db.query('SELECT count(*)::int AS count FROM "GovernanceLog"')).rows[0].count, 1);
        assert.equal((await db.query('SELECT count(*)::int AS count FROM "Log"')).rows[0].count, 1);

        const restored = await changeStatus("wedding-1", "ACTIVE", "integration restore reason", "restore");
        assert.deepEqual(restored.rows, [{ id: "wedding-1", changed: true }]);
        assert.equal((await db.query('SELECT status FROM "Wedding" WHERE id = $1', ["wedding-1"])).rows[0].status, "ACTIVE");
        assert.equal((await db.query('SELECT count(*)::int AS count FROM "GovernanceLog"')).rows[0].count, 2);
        assert.equal((await db.query('SELECT count(*)::int AS count FROM "Log"')).rows[0].count, 2);

        const governanceDetails = (await db.query('SELECT details FROM "GovernanceLog" ORDER BY id LIMIT 1')).rows[0].details;
        const weddingLog = (await db.query('SELECT description FROM "Log" ORDER BY id LIMIT 1')).rows[0].description;
        assert.equal(governanceDetails.reason, "integration archive reason");
        assert.equal(weddingLog.includes("integration archive reason"), false);

        const missingWedding = await changeStatus("missing-wedding", "ARCHIVED", "missing wedding test reason", "missing");
        assert.deepEqual(missingWedding.rows, []);

        const archiveForPackageUpdate = await changeStatus("wedding-1", "ARCHIVED", "archive before package update", "package-archive");
        assert.deepEqual(archiveForPackageUpdate.rows, [{ id: "wedding-1", changed: true }]);

        const packageUpdate = await db.query(UPDATE_WEDDING_PACKAGE_SQL, [
            "wedding-1",
            "PREMIUM",
            "PAID",
            "admin-1",
            "Test Admin",
            "127.0.0.1",
            "integration-test",
            "governance-package",
            "wedding-log-package",
            "authorized manual package change",
            "PAID",
            "tx-ref-integration-123"
        ]);
        assert.deepEqual(packageUpdate.rows, [{ id: "wedding-1" }]);
        const updatedWedding = (await db.query(
            'SELECT status, "packageType", "paymentStatus" FROM "Wedding" WHERE id = $1',
            ["wedding-1"]
        )).rows[0];
        assert.deepEqual(updatedWedding, {
            status: "ARCHIVED",
            packageType: "PREMIUM",
            paymentStatus: "PAID"
        });

        const packageGovernance = (await db.query(
            `SELECT details FROM "GovernanceLog" WHERE details->>'target' = 'WEDDING_PACKAGE'`
        )).rows[0].details;
        const packageActivity = (await db.query(
            `SELECT description FROM "Log" WHERE id = 'wedding-log-package'`
        )).rows[0].description;
        assert.equal(packageGovernance.reason, "authorized manual package change");
        assert.equal(packageGovernance.oldValues.packageType, "FREE");
        assert.equal(packageGovernance.newValues.packageType, "PREMIUM");
        assert.equal(packageGovernance.oldValues.status, "ARCHIVED");
        assert.equal(packageGovernance.newValues.status, "ARCHIVED");
        assert.equal(packageGovernance.paymentDisposition, "PAID");
        assert.equal(packageGovernance.paymentReference, "tx-ref-integration-123");
        assert.equal(packageActivity.includes("authorized manual package change"), false);
        assert.equal(packageActivity.includes("tx-ref-integration-123"), false);

        await db.query(UPDATE_WEDDING_PACKAGE_SQL, [
            "wedding-1",
            "PRO",
            "PAID",
            "admin-1",
            "Test Admin",
            "127.0.0.1",
            "integration-test",
            "governance-waiver",
            "wedding-log-waiver",
            "complimentary upgrade approved for documented service recovery",
            "WAIVED",
            null
        ]);
        const waiverDetails = (await db.query(
            `SELECT details FROM "GovernanceLog" WHERE id = 'governance-waiver'`
        )).rows[0].details;
        assert.equal(waiverDetails.paymentDisposition, "WAIVED");
        assert.equal(waiverDetails.paymentReference, null);
        assert.equal(waiverDetails.reason, "complimentary upgrade approved for documented service recovery");
    } finally {
        await db.close();
    }
});
