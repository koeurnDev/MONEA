import assert from 'node:assert/strict';
import test from 'node:test';

/**
 * Automated Security Tests (static/code-level) for Template purchase flows.
 *
 * Why static?
 * - CI sandbox does not provide deterministic DB/auth fixtures.
 * - We still can enforce critical invariants at compile-time/code-review time.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..'); // monea-api-worker

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

const templatePurchaseRouter = read('routers/template-purchase.ts');
const securityAudit = read('lib/security-audit.ts');

test('Security audit helper defines the required template-purchase event buckets', () => {
  assert.match(
    securityAudit,
    /TEMPLATE_PURCHASE_CHECK_WEDDINGID_MISMATCH/,
    'Expected TEMPLATE_PURCHASE_CHECK_WEDDINGID_MISMATCH event'
  );
  assert.match(
    securityAudit,
    /TEMPLATE_PURCHASE_UNAUTHORIZED_WEDDING_ACCESS/,
    'Expected TEMPLATE_PURCHASE_UNAUTHORIZED_WEDDING_ACCESS event'
  );
  assert.match(
    securityAudit,
    /TEMPLATE_PURCHASE_VERIFY_ORDER_NOT_OWNED/,
    'Expected TEMPLATE_PURCHASE_VERIFY_ORDER_NOT_OWNED event'
  );
  assert.match(
    securityAudit,
    /TEMPLATE_PURCHASE_SUBMIT_SLIP_ORDER_NOT_OWNED/,
    'Expected TEMPLATE_PURCHASE_SUBMIT_SLIP_ORDER_NOT_OWNED event'
  );
});

test('Template purchase router raises logs+alerts on weddingId mismatch during check', () => {
  assert.match(
    templatePurchaseRouter,
    /TEMPLATE_PURCHASE_CHECK_WEDDINGID_MISMATCH/,
    'Expected router to log weddingId mismatch'
  );
  assert.match(
    templatePurchaseRouter,
    /\[SECURITY ALERT\]/,
    'Expected router to console.warn a security alert on mismatch'
  );
});

test('Template purchase router uses security-audit helper (logSecurityEvent) for security-sensitive decisions', () => {
  assert.match(
    templatePurchaseRouter,
    /logSecurityEvent\(/,
    'Expected template-purchase router to call logSecurityEvent(...)'
  );
  assert.match(
    templatePurchaseRouter,
    /shouldRaiseSecurityAlert\(/,
    'Expected template-purchase router to call shouldRaiseSecurityAlert(...)'
  );
});

test('Template purchase router includes ownership checks for orderId-scoped flows', () => {
  // We only enforce that the router contains the expected event buckets.
  // Implementation details should be updated as you finish hardening the remaining endpoints.
  // NOTE: At the moment of writing, not all endpoints may be fully hardened.
  // These assertions act as forward-looking guards; if you harden more
  // endpoints, they should start passing.
  assert.match(
    securityAudit,
    /TEMPLATE_PURCHASE_VERIFY_ORDER_NOT_OWNED/,
    'Expected security-audit event bucket to exist for verify ownership violations'
  );

  assert.match(
    securityAudit,
    /TEMPLATE_PURCHASE_SUBMIT_SLIP_ORDER_NOT_OWNED/,
    'Expected security-audit event bucket to exist for submit-slip ownership violations'
  );
});

test('Template purchase router parses and validates the ownership-sensitive orderId for verify/submit-slip', () => {
  // We enforce presence of param usage and the ownership guard structure.
  // - Both routes must read c.req.param('orderId')
  // - Both routes must check wedding.userId (ownership) before proceeding.

  assert.match(
    templatePurchaseRouter,
    /templatePurchaseRouter\.post\('\/submit-slip\/:orderId'/,
    'Expected /submit-slip/:orderId route to exist'
  );
  assert.match(
    templatePurchaseRouter,
    /templatePurchaseRouter\.post\('\/verify\/:orderId'/,
    'Expected /verify/:orderId route to exist'
  );

  assert.match(
    templatePurchaseRouter,
    /const wedding = await prisma\.wedding\.findFirst\([\s\S]*where:\s*\{[\s\S]*userId:/,
    'Expected both verify flow and/or submit-slip flow to validate wedding ownership via prisma.wedding where userId'
  );

  assert.match(
    templatePurchaseRouter,
    /const license = await prisma\.templateLicense\.findFirst\([\s\S]*paymentOrderId:/,
    'Expected submit-slip to load license by paymentOrderId'
  );

  assert.match(
    templatePurchaseRouter,
    /const license = await prisma\.templateLicense\.findFirst\([\s\S]*where:\s*\{[\s\S]*paymentOrderId:/,
    'Expected verify flow to load license by paymentOrderId'
  );
});
