# Security Incident — MONEA secret & database-backup exposure (2026-09-22)

Status: **open — containment in progress**
Severity: **critical** (public exposure of production credentials, password hashes, TOTP seeds and guest PII)

## 1. What happened

The repository `github.com/koeurnDev/MONEA` is **public** and, at the time of writing,
publishes both of the following:

| Exposure | Evidence (verified 2026-09-22) |
| --- | --- |
| Production database dump `monea-api-worker/backups/backup-2026-08-27T03-14-12.sql` (80,577 bytes) | `curl -I https://raw.githubusercontent.com/koeurnDev/MONEA/main/monea-api-worker/backups/backup-2026-08-27T03-14-12.sql` → **HTTP 200** |
| `.env` files committed in history (`fd233211`, `466740ca`, `7f27308f`, `93776f97`) | `curl -I https://raw.githubusercontent.com/koeurnDev/MONEA/fd233211/.env` → **HTTP 200** |
| `.wrangler/cache/wrangler-account.json` (Cloudflare account id + owner email) | `curl -I .../main/monea-api-worker/.wrangler/cache/wrangler-account.json` → **HTTP 200** |
| Cloudinary key/secret/cloud-name hard-coded in tracked source | `monea-api-worker/routers/adminMaster.ts`, `monea-webapp/monea-worker/routers/adminMaster.ts` |

The dump contains **12 `User` rows** including the columns `password`,
`twoFactorSecret`, `twoFactorRecoveryCodes`, `googleId`, `telegramId`, `phone`,
`email`; **3 `PasswordResetToken`** rows; **1 `SignupOTP`** row; 19 `SecurityLog`;
28 `GovernanceLog`; **14 `Guest`** rows (attendee PII).

## 2. Which secrets are compromised

Two independent factors matter: *is it in the public repo?* and *is it still the live
value?* (compared by SHA-256 of the value, so no secret was printed).

| Secret | Publicly exposed | Still the live value | Action |
| --- | --- | --- | --- |
| `CLOUDINARY_API_SECRET` (+ API key / cloud name) | **yes** — `.env` history **and** hard-coded in `main` source | **yes** | Rotate immediately |
| `TELEGRAM_BOT_TOKEN` | **yes** — `.env` history (`7f27308f`, `93776f97`) | **yes** | Revoke via BotFather |
| `ENCRYPTION_KEY` | yes, in commit `5142c80d` (not reachable on the public remote, but present in the local repo/pushes) | **yes** | Rotate + re-encrypt PII |
| `TURNSTILE_SECRET_KEY` | commit `5142c80d` only | **yes** | Rotate |
| `GOOGLE_CLIENT_SECRET` | commit `5142c80d` only | **yes** | Rotate |
| `UPSTASH_REDIS_REST_TOKEN` | commit `5142c80d` only | **yes** | Rotate |
| `JWT_SECRET` | history (old value) | no (rotated) | Confirm all sessions revoked |
| `DATABASE_URL` / Neon password | history (old value) | no (rotated) | Confirm the old role password is deleted |
| `SECURITY_PEPPER` | history (old value) | no (rotated) | none |
| `SMTP_PASS`, `BAKONG_API_TOKEN`, `CSRF_SECRET` | **not found in any commit** | — | no evidence of leak |

Treat every "yes/yes" row as **already in the attacker's hands**.

## 3. P0 — containment checklist (do these first, in order)

1. **Make both repositories private** (`koeurnDev/MONEA`, `koeurnDev/MONEA_`). This is
   mitigation, not remediation: the values are already scraped.
2. **Rotate, in this order**, updating both the Cloudflare Worker secrets and the
   Vercel/Pages environment:
   1. Cloudinary — new API key + secret, then delete the old key in the console.
   2. Telegram — `/revoke` in BotFather, issue a new bot token, update `TELEGRAM_CHAT_ID` owner.
   3. Google OAuth client secret (Cloud console → rotate secret, update the OAuth app).
   4. Cloudflare Turnstile secret key.
   5. Upstash Redis REST token.
   6. Cloudflare API tokens (the account id is already public; never rely on it).
   7. `ENCRYPTION_KEY` **last**, because rotating it requires re-encrypting every
      `encrypt()`-protected field: decrypt with the old key and re-encrypt with the new
      one in one batch job (`lib/encryption.ts`, AES-GCM, key = SHA-256(value)).
3. **Contain the accounts in the leaked dump** (any of the 12 users, plus anyone who
   could reuse a leaked reset token):
   ```bash
   cd monea-api-worker
   npx tsx scripts/incident-response-revoke-sessions.ts --dry-run   # review
   npx tsx scripts/incident-response-revoke-sessions.ts --apply --force-password-reset
   ```
   This revokes all user + staff sessions, clears TOTP secrets/recovery codes (users
   must re-enrol; their seeds are public), deletes outstanding `PasswordResetToken`
   and `SignupOTP` rows, and (with `--force-password-reset`) clears password hashes so
   every account must use **Forgot password**.
4. **Notify** the affected users and record the incident (dates, actions, operators).
## 4. P1 — purge the history and prevent recurrence

The backup is still in `main`'s history, so deleting the file is not enough.

```bash
# 1. Remove the tracked artefacts (backup + local deploy state)
git rm -r --cached monea-api-worker/backups
git rm -r --cached monea-api-worker/.wrangler
git commit -m "chore(security): stop tracking backups and wrangler state"

# 2. Rewrite history (install git-filter-repo first: pip install git-filter-repo)
git filter-repo --invert-paths \
  --path monea-api-worker/backups/ \
  --path monea-api-worker/.wrangler/ \
  --path .env

# 3. Force-push, then re-clone everywhere (old objects remain in other clones/forks)
git push --force --all
git push --force --tags
```

Then, after the purge, **rotate the credentials once more** — assume everything in the
old objects is compromised.

Prevent recurrence:

- GitHub → Settings → Code security: enable **secret scanning** and **push protection**.
- Add a pre-commit hook with `gitleaks` (`gitleaks protect --staged`).
- Never store cloud SDK credentials as code fallbacks (see §5).
- Keep `backups/`, `.env`, `.dev.vars`, `.wrangler/`, `.vercel/` in `.gitignore` (already done in the root `.gitignore`).

## 5. Code remediation applied in this change set

| Area | Change | Files |
| --- | --- | --- |
| **C-04 broken access control (privilege escalation)** | `isAuthorizedMaster` accepted `"ADMIN"`, which **is** `ROLES.EVENT_MANAGER` — the default role of every self-registered customer — so any customer could call the platform master API (cross-tenant directories, broadcasts, media maintenance, **DB backup/restore**). Now platform-owner only. | `monea-api-worker/routers/adminMaster.ts`, `monea-webapp/monea-worker/routers/adminMaster.ts` |
| C-04 (same class) | `routers/admin.ts`: user directory (list/detail/delete), wedding catalogue writes, security telemetry, platform health and governance snapshot/rollback are platform-owner only; manager-facing reads (`/stats`, `/weddings`, `/logs`) are scoped to the caller's own weddings; `/security/revoke` no longer lets a customer revoke every staff session (`GLOBAL_STAFF`). | `monea-api-worker/routers/admin.ts` |
| C-04 (UI) | Master-only navigation entries are hidden from non-owners instead of producing dead links. | `monea-webapp/src/app/admin/client-layout.tsx` |
| **Hard-coded credentials** | Removed every literal Cloudinary fallback (cloud name, API key, API secret) and replaced them with env resolution that fails loudly. | `adminMaster.ts` (both copies), `monea-webapp/src/lib/multi-cdn.ts` |
| **CSRF enforcement** | `isValidCSRFToken` had *zero* call sites while cookies are issued `SameSite=None`. Added `csrfProtection()` middleware validating `X-CSRF-Token` (session-bound) on POST/PUT/PATCH/DELETE for cookie-authenticated requests, registered in `hono.ts`; the SPA interceptor now attaches the header for raw `fetch()` calls. | `monea-api-worker/lib/csrf.ts`, `monea-api-worker/hono.ts`, `monea-webapp/src/lib/fetch-interceptor.ts` |
| **Fail-closed auth** | `getSecretStr()` returned `""` when `JWT_SECRET` was missing (empty signing key ⇒ auth bypass) and `secrets.getJwtSecret()` fell back to a published literal; `isTokenRevoked()` failed open on Redis errors. All three now fail closed in production. | `monea-api-worker/lib/auth.ts`, `lib/secrets.ts`, `monea-webapp/src/lib/auth.ts` |
| **CSRF secret** | `"default-csrf-secret"` / `"monea-default-csrf-secret-change-me"` fallbacks removed; production now refuses to issue/validate tokens without `CSRF_SECRET`. | `monea-api-worker/lib/csrf.ts` |

### Rollout valves (set as Worker secrets)

| Variable | Default | Purpose |
| --- | --- | --- |
| `CSRF_ENFORCEMENT` | `enforce` | Set to `monitor` to log violations without blocking (staged rollout or emergency rollback). Watch for `[CSRF][MONITOR]` log lines. |
| `AUTH_REVOCATION_FAIL_MODE` | fail closed | Set to `open` only if a Redis/Upstash outage would otherwise lock out all users. |

`CSRF_SECRET` must be set (≥ 32 random bytes) in production, and the same value must be
used by the issuer (`/api/auth/csrf`) and the middleware.

## 6. Residual risk / not yet done

- **JWT is still stored in `localStorage`** (`sign-in`, `sign-up`, `AuthCallbackPage`,
  `api-client`, `fetch-interceptor`, `useAuth`, `DashboardLayout`) and sent as a Bearer
  header. Any XSS is a full account takeover. Move to cookie-only auth and delete
  `auth_token` handling (tracked as the next work item).
- **Fingerprint validation is still a no-op** (`lib/auth.ts` logs a mismatch but does not
  block) — deliberately relaxed for SSO; revisit with a proper device-binding strategy.
- **Duplicate API implementation** at `monea-webapp/monea-worker/**` is a stale copy of
  the worker. It has been patched for the same issues, but it should be deleted or
  generated from a single source to avoid drift.
- `UNAUTHENTICATED /api/gallery/:weddingId` and `/api/broadcast` remain public by
  design (wedding pages are public) — review whether gallery items should require the
  wedding code.
- History purge (§4) has **not** been executed; the leaked dump is still downloadable
  until the repositories are made private and the history rewritten.
