import assert from "node:assert/strict";
import test from "node:test";
import {
    MAX_ADMIN_REASON_LENGTH,
    MAX_WEDDING_PAGE,
    MAX_WEDDING_SEARCH_LENGTH,
    validateAdminReason,
    validateWeddingListParams,
    resolveAdminPackagePayment,
    escapeWeddingSearch
} from "../lib/adminMasterValidation.ts";
import { isPlatformOwner } from "../lib/constants.ts";

test("accepts supported wedding list parameters", () => {
    assert.deepEqual(validateWeddingListParams("Sokha", "2", "PREMIUM"), {
        valid: true,
        search: "Sokha",
        page: 2,
        packageFilter: "PREMIUM"
    });
});

test("rejects overlong wedding searches", () => {
    const result = validateWeddingListParams("x".repeat(MAX_WEDDING_SEARCH_LENGTH + 1), "1", "ALL");
    assert.equal(result.valid, false);
});

test("rejects invalid and excessive page numbers", () => {
    assert.equal(validateWeddingListParams("", "0", "ALL").valid, false);
    assert.equal(validateWeddingListParams("", "1.5", "ALL").valid, false);
    assert.equal(validateWeddingListParams("", String(MAX_WEDDING_PAGE + 1), "ALL").valid, false);
});

test("rejects unsupported package filters", () => {
    assert.equal(validateWeddingListParams("", "1", "ENTERPRISE").valid, false);
});

test("escapes SQL LIKE wildcard characters while preserving literal search", () => {
    assert.equal(escapeWeddingSearch("100%_done!"), "100!%!_done!!");
});

test("requires a trimmed administrative reason between 10 and 500 characters", () => {
    assert.equal(validateAdminReason("short"), false);
    assert.equal(validateAdminReason("          "), false);
    assert.equal(validateAdminReason("This reason is long enough."), true);
    assert.equal(validateAdminReason(`a${"b".repeat(MAX_ADMIN_REASON_LENGTH - 1)}`), true);
    assert.equal(validateAdminReason(`a${"b".repeat(MAX_ADMIN_REASON_LENGTH)}`), false);
});

test("requires a payment reference for paid non-free package upgrades", () => {
    assert.deepEqual(resolveAdminPackagePayment("PRO", "PAID", "  tx-1234  "), {
        valid: true,
        paymentStatus: "PAID",
        disposition: "PAID",
        reference: "tx-1234"
    });
    assert.equal(resolveAdminPackagePayment("PREMIUM", "PAID", "abc").valid, false);
    assert.equal(resolveAdminPackagePayment("PRO", "PAID", "x".repeat(121)).valid, false);
    assert.equal(resolveAdminPackagePayment("PRO", "PAID", null).valid, false);
});

test("allows explicitly waived paid packages and keeps free packages pending", () => {
    assert.deepEqual(resolveAdminPackagePayment("PREMIUM", "WAIVED", null), {
        valid: true,
        paymentStatus: "PAID",
        disposition: "WAIVED",
        reference: null
    });
    assert.deepEqual(resolveAdminPackagePayment("FREE", "NOT_APPLICABLE", null), {
        valid: true,
        paymentStatus: "PENDING",
        disposition: "NOT_APPLICABLE",
        reference: null
    });
    assert.equal(resolveAdminPackagePayment("ENTERPRISE", "WAIVED", null).valid, false);
    assert.equal(resolveAdminPackagePayment("PRO", "NOT_APPLICABLE", null).valid, false);
});

test("only the platform owner role qualifies for owner-only wedding directory access", () => {
    assert.equal(isPlatformOwner("SUPERADMIN"), true);
    assert.equal(isPlatformOwner("PLATFORM_OWNER"), false);
    assert.equal(isPlatformOwner("STAFF"), false);
    assert.equal(isPlatformOwner("ADMIN"), false);
});
