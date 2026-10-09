export const UPDATE_WEDDING_STATUS_SQL = `
    WITH current_wedding AS MATERIALIZED (
        SELECT id, status
        FROM "Wedding"
        WHERE id = $1
        FOR UPDATE
    ),
    updated_wedding AS (
        UPDATE "Wedding" w
        SET status = $2::"WeddingStatus"
        FROM current_wedding old
        WHERE w.id = old.id
          AND old.status IS DISTINCT FROM $2::"WeddingStatus"
        RETURNING w.id
    ),
    governance_audit AS (
        INSERT INTO "GovernanceLog" ("id", action, details, "actorId", "actorName", ip, "userAgent")
        SELECT $7, 'CONFIG_UPDATE'::"GovernanceAction",
            jsonb_build_object(
                'target', 'WEDDING_STATUS',
                'weddingId', old.id,
                'oldStatus', old.status,
                'newStatus', $2,
                'reason', $8::text
            ),
            $3, $4, $5, $6
        FROM current_wedding old
        JOIN updated_wedding updated ON updated.id = old.id
        RETURNING id
    ),
    wedding_audit AS (
        INSERT INTO "Log" ("id", action, description, "actorName", ip, "userAgent", "weddingId")
        SELECT $9, 'UPDATE'::"LogAction",
            'Status changed from ' || old.status::text || ' to ' || $2,
            $4, $5, $6, old.id
        FROM current_wedding old
        JOIN updated_wedding updated ON updated.id = old.id
        RETURNING id
    )
    SELECT id, true AS changed FROM updated_wedding
    UNION ALL
    SELECT id, false AS changed
    FROM current_wedding
    WHERE NOT EXISTS (SELECT 1 FROM updated_wedding)
`;

export const UPDATE_WEDDING_PACKAGE_SQL = `
    WITH current_wedding AS MATERIALIZED (
        SELECT id, "packageType", "paymentStatus", status
        FROM "Wedding"
        WHERE id = $1
        FOR UPDATE
    ),
    updated_wedding AS (
        UPDATE "Wedding" w
        SET "packageType" = $2::"PackageType",
            "paymentStatus" = $3::"PaymentStatus"
        FROM current_wedding old
        WHERE w.id = old.id
        RETURNING w.id
    ),
    governance_audit AS (
        INSERT INTO "GovernanceLog" ("id", action, details, "actorId", "actorName", ip, "userAgent")
        SELECT
            $8,
            'CONFIG_UPDATE'::"GovernanceAction",
            jsonb_build_object(
                'target', 'WEDDING_PACKAGE',
                'weddingId', old.id,
                'oldValues', jsonb_build_object(
                    'packageType', old."packageType",
                    'paymentStatus', old."paymentStatus",
                    'status', old.status
                ),
                'newValues', jsonb_build_object(
                    'packageType', $2,
                    'paymentStatus', $3,
                    'status', old.status
                ),
                'reason', $10::text,
                'paymentDisposition', $11::text,
                'paymentReference', $12::text
            ),
            $4, $5, $6, $7
        FROM current_wedding old
        JOIN updated_wedding updated ON updated.id = old.id
        RETURNING id
    ),
    wedding_audit AS (
        INSERT INTO "Log" ("id", action, description, "actorName", ip, "userAgent", "weddingId")
        SELECT
            $9,
            'UPDATE'::"LogAction",
            'Package changed from ' || old."packageType"::text || '/' || old."paymentStatus"::text ||
                ' to ' || $2 || '/' || $3 || '; status remains ' || old.status::text,
            $5, $6, $7, old.id
        FROM current_wedding old
        JOIN updated_wedding updated ON updated.id = old.id
        RETURNING id
    )
    SELECT id FROM updated_wedding
`;
