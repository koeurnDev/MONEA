# Validation & Testing Phase

Before releasing `v1.0.0`, it is critical to run these structured validation tests to ensure the platform can handle both traffic spikes and aggressive brute-force attacks.

## 1. Load Testing (Concurrent Users)
We use `k6` to simulate high traffic against the Login API. 
1. Install k6: `choco install k6` or download from [k6.io](https://k6.io)
2. Ensure your local server is running: `npm run dev`
3. Execute the load test:
   ```bash
   k6 run tests/load/login_load_test.js
   ```
*Expected Outcome:* The API should remain responsive (under 500ms for 95% of requests) even at 50 concurrent virtual users.

## 2. Security Stress Testing (IP Ban & Telegram)
This script simulates an attacker firing repeated rapid requests to breach an account.
1. Run the script:
   ```bash
   node tests/security/bruteforce_test.js
   ```
*Expected Outcome:* 
- The initial requests will return `401 Unauthorized`.
- After 3 failures, it will return `428` demanding a CAPTCHA.
- Around the 5th attempt, the backoff delay will be noticeably long.
- At the 10th attempt, the system will return `403/429` (IP Blocked) and dispatch a red `🚨 HIGH RISK ESCALATION` alert to Telegram.

## 3. Database Failure & Recovery Strategy

### Connection Drops
If the Neon Database connection drops (or `DATABASE_URL` is wrong), Prisma will throw connection errors. The system is designed to catch these in `try/catch` and return safe `500 Internal Server Errors` without leaking stack traces to the public.

### PostgreSQL Backup & Restore (Neon)
If test data becomes corrupted, or an emergency restore is needed:
- **Backup:** Neon Database automatically handles point-in-time recovery. You can branch your production database in the Neon Dashboard instantly.
- **Manual Dump:** Use standard `pg_dump`:
  `pg_dump $DATABASE_URL -F c -f backup.dump`
- **Manual Restore:** Drop the public schema and use `pg_restore`:
  `pg_restore -d $DATABASE_URL backup.dump`
