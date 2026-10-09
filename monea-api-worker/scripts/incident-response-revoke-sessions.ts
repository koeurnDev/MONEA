/**
 * Incident response for the 2026-09-22 secret / database-backup exposure.
 *
 * Context: the public repository `koeurnDev/MONEA` exposed
 *   - `monea-api-worker/backups/backup-2026-08-27T03-14-12.sql` — 12 user rows with
 *     `password` hashes, `twoFactorSecret`, `twoFactorRecoveryCodes`, 3
 *     `PasswordResetToken` rows, `SignupOTP`, guest PII; and
 *   - committed `.env` files containing live third-party credentials.
 *
 * This script performs the *account-side* containment for that dump:
 *   1. revoke every active session (users + staff),
 *   2. clear TOTP secrets / recovery codes so affected users must re-enrol 2FA,
 *   3. invalidate outstanding password-reset and signup OTP codes,
 *   4. optionally force a password reset by nulling stored password hashes.
 *
 * Usage (run from monea-api-worker/, DATABASE_URL must point at production):
 *   npx tsx scripts/incident-response-revoke-sessions.ts --dry-run
 *   npx tsx scripts/incident-response-revoke-sessions.ts --apply
 *   npx tsx scripts/incident-response-revoke-sessions.ts --apply --force-password-reset
 */

import 'dotenv/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const forcePasswordReset = args.includes('--force-password-reset');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

if (!apply) {
  console.log('ℹ️  DRY RUN — nothing will be written. Re-run with --apply to execute.\n');
}

async function count(pool: Pool, sql: string): Promise<number> {
  const res = await pool.query(sql);
  return parseInt(res.rows[0]?.count ?? '0', 10);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const before = {
      users: await count(pool, 'SELECT COUNT(*)::text AS count FROM "User"'),
      usersWith2FA: await count(pool, 'SELECT COUNT(*)::text AS count FROM "User" WHERE "twoFactorEnabled" = true OR "twoFactorSecret" IS NOT NULL'),
      staff: await count(pool, 'SELECT COUNT(*)::text AS count FROM "Staff"'),
      resetTokens: await count(pool, 'SELECT COUNT(*)::text AS count FROM "PasswordResetToken"'),
    };

    console.log('📊 Current state');
    console.log(`   users: ${before.users} (with 2FA material: ${before.usersWith2FA})`);
    console.log(`   staff: ${before.staff}`);
    console.log(`   outstanding password-reset tokens: ${before.resetTokens}\n`);

    const statements: Array<{ label: string; sql: string }> = [
      {
        label: 'Revoke all user sessions',
        sql: 'UPDATE "User" SET "sessionsRevokedAt" = NOW(), "failedAttempts" = 0, "lockedUntil" = NULL',
      },
      {
        label: 'Revoke all staff sessions',
        sql: 'UPDATE "Staff" SET "sessionsRevokedAt" = NOW(), "failedAttempts" = 0, "lockedUntil" = NULL',
      },
      {
        label: 'Drop compromised TOTP secrets + recovery codes (force re-enrolment)',
        sql: 'UPDATE "User" SET "twoFactorSecret" = NULL, "twoFactorRecoveryCodes" = NULL, "twoFactorEnabled" = false',
      },
      {
        label: 'Invalidate outstanding password-reset tokens',
        sql: 'DELETE FROM "PasswordResetToken"',
      },
      {
        label: 'Invalidate outstanding signup OTP codes',
        sql: 'DELETE FROM "SignupOTP"',
      },
    ];

    if (forcePasswordReset) {
      statements.push({
        label: 'Force password reset (clear all password hashes)',
        sql: 'UPDATE "User" SET "password" = NULL WHERE "password" IS NOT NULL',
      });
    }

    await pool.query('BEGIN');
    try {
      for (const statement of statements) {
        if (apply) {
          const result = await pool.query(statement.sql);
          console.log(`✅ ${statement.label} — ${result.rowCount ?? 0} row(s)`);
        } else {
          console.log(`• would run: ${statement.label}`);
        }
      }
      if (apply) {
        await pool.query('COMMIT');
        console.log('\n✅ Incident-response containment committed.');
      } else {
        await pool.query('ROLLBACK');
        console.log('\nℹ️  Dry run complete (rolled back).');
      }
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    if (forcePasswordReset && apply) {
      console.log('\n⚠️  Every account now requires "Forgot password" before signing in again.');
      console.log('   Notify affected users and rotate SMTP/template content accordingly.');
    }
    console.log('\nNext: rotate all third-party credentials listed in');
    console.log('monea-webapp/docs/SECURITY_INCIDENT_2026-09-22_SECRET_LEAK.md before un-freezing access.');
  } finally {
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Incident response failed:', error);
    process.exit(1);
  });
