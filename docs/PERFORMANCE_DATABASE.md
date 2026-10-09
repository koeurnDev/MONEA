# MONEA — Database Performance

**Scope:** `monea-api-worker` (Cloudflare Worker + Hono + Prisma/Neon over the HTTP driver) and
the mirrored copy at `monea-webapp/monea-worker`.

**Status: advisory.** Nothing in this document has been applied. Every recommendation below is
accompanied by the exact query that justifies it, so it can be reviewed before any migration runs.
**No schema change has been made and no migration has been executed.**

---

## 1. How queries reach the database

The Worker talks to Neon Postgres through the **HTTP driver** (`@neondatabase/serverless`), not a
TCP pool. Three consequences matter for performance work:

1. **Every Prisma call is its own HTTP round trip**, although a `Promise.all` batch is executed as a
   single HTTP request by the driver. This is why parallelism *inside* the Worker matters so much.
2. **There is no connection pool to warm.** Cost is dominated by (edge -> Neon region) latency plus
   the query plan, not by connection setup.
3. **Interactive `$transaction` callbacks are expensive.** Each statement inside the callback becomes
   a separate round trip. This affects `lib/GuestService.ts` and `lib/GiftService.ts`.

There are **three separate database modules** in `monea-api-worker/lib`:

| Module | Driver | Notes |
| --- | --- | --- |
| `lib/db.ts` | raw `neon()` | caches a client per connection string |
| `lib/drizzle.ts` | `drizzle-orm/neon-http` | caches one instance |
| `lib/prisma.ts` | `@prisma/client` + Neon adapter | used by most routers |

`db.ts` and `drizzle.ts` each construct their **own** `neon()` client for the same URL, so one
isolate can hold two clients for one database. Minor, but consolidating on a single accessor removes
a class of drift bug (there have already been cache-related 500s — commit `3229aa29`).

---

## 2. Existing index inventory (read from `prisma/schema.prisma`)

The schema is **already well indexed** for the hot read paths. That matters: it means the baseline
bottlenecks are *uncached reads*, *payload size* and *sequential round trips* — **not** missing
indexes on the obvious foreign keys.

```
User                   @@index([createdAt]) @@index([deletedAt]) @@index([role, createdAt desc])
Wedding                @@index([userId]) @@index([status]) @@index([createdAt])
                       @@index([paymentStatus]) @@index([packageType])
                       @@index([userId, status, createdAt desc]) @@index([status, paymentStatus])
InvitationAnalytics    @@index([weddingId]) @@index([createdAt]) @@index([weddingId, type, createdAt])
Activity               @@index([weddingId])
Guest                  @@unique([weddingId, guestCode]) @@index([weddingId]) @@index([hasArrived])
                       @@index([weddingId, createdAt desc]) @@index([weddingId, rsvpStatus])
                       @@index([weddingId, hasArrived]) @@index([weddingId, group])
Gift                   @@index([weddingId]) @@index([guestId]) @@index([method]) @@index([currency])
                       @@index([weddingId, createdAt desc])
GalleryItem            @@index([weddingId]) @@index([weddingId, createdAt desc])
GuestbookEntry         @@index([weddingId]) @@index([weddingId, createdAt desc])
Staff                  @@index([weddingId]) @@index([weddingId, role])
Log                    @@index([weddingId]) @@index([createdAt]) @@index([weddingId, createdAt desc])
SecurityLog            @@index([event]) @@index([createdAt]) @@index([ip]) @@index([email])
Broadcast              @@index([active, expiresAt])
SupportTicket          @@index([weddingId]) @@index([userId]) @@index([status, priority])
                       @@index([createdAt desc])
GovernanceLog          @@index([actorId]) @@index([createdAt desc]) @@index([action])
WeddingTemplateVersion @@index([weddingId])
PasswordResetToken     @@index([email])   (token is @unique)
SignupOTP              @@index([email])   (email is unique)
```

---

## 3. Recommended indexes (each justified by a real query)

These are the only gaps found. All are additive `CREATE INDEX` statements — no column is dropped, no
data is rewritten, and each is reversible with a single `DROP INDEX`.

### 3.1 `User.lockedUntil` — **highest value**

```prisma
model User {
  // ...
  @@index([lockedUntil])
}
```

Justification — a full-table range scan on every admin security view and every daily cron run:

| Call site | Query |
| --- | --- |
| `routers/admin.ts:379` | `prisma.user.count({ where: { lockedUntil: { gt: new Date() } } })` |
| `routers/adminMaster.ts:555` | same |
| `routers/cron.ts:63` | same |

### 3.2 `Staff.lockedUntil`

```prisma
model Staff {
  // ...
  @@index([lockedUntil])
}
```

Justification: `routers/adminMaster.ts:556` and `routers/cron.ts:62` both run
`staff.count({ where: { lockedUntil: { gt: now } } })`.

### 3.3 `IpSecurity.blockedUntil`

```prisma
model IpSecurity {
  // ...
  @@index([blockedUntil])
}
```

Justification: `routers/cron.ts:64` runs
`ipSecurity.count({ where: { blockedUntil: { gt: now } } })`. This model only has a unique index on
`ip`, so the active-lockout count is a sequential scan. On a table that grows with every attacking
IP, this is the query most likely to degrade over time.

### 3.4 `User.failedAttempts` and `Staff.failedAttempts`

```prisma
@@index([failedAttempts])
```

Justification: `routers/adminMaster.ts:553-554`:

```ts
prisma.user.findMany({ where: { failedAttempts: { gt: 0 } }, select: { ... } })
prisma.staff.findMany({ where: { failedAttempts: { gt: 0 } }, select: { ... } })
```

### 3.5 `SecurityLog(event, createdAt)` — composite

```prisma
model SecurityLog {
  // ...
  @@index([event, createdAt])
}
```

Justification: `routers/cron.ts` runs five aggregates with the **same** predicate shape
`WHERE event = <x> AND createdAt >= yesterday AND createdAt < today`:

* `count({ where: { event: "LOGIN_SUCCESS", createdAt: dateRange } })` — line 51
* `count({ where: { event: "LOGIN_FAILED", createdAt: dateRange } })` — line 54
* `findMany({ where: { …, distinct: ['ip'] } })` — line 57
* `groupBy({ by: ['geoIp'], where: { … } })` — line 65
* `groupBy({ by: ['email'], where: { … } })` — line 71

Today Postgres must pick either `@@index([event])` or `@@index([createdAt])` and filter the rest; a
composite index matches the predicate exactly.

Optional follow-up, **only** if the two `groupBy` calls show up hot in `EXPLAIN ANALYZE`:

```prisma
@@index([event, createdAt, geoIp])
@@index([event, createdAt, email])
```

These make the aggregates index-only. They are deliberately *not* recommended up front: two extra
indexes on the highest-write table is a real write cost, and the rules say add indexes only when
justified by actual query patterns.

### 3.6 `Activity(weddingId, order)` — low priority

```prisma
model Activity {
  // ...
  @@index([weddingId, order])
}
```

Justification: `routers/wedding.ts` loads `activities: { orderBy: { order: 'asc' } }` inside the
public wedding payload; `routers/admin.ts:150` uses `orderBy: { time: 'asc' }`. Rows per wedding are
in the single digits so the benefit is small — listed for completeness only.

---

## 4. Migration procedure for the recommendations above

The project uses **Prisma Migrate** (`prisma/migrations`, latest
`20260325054504_add_bakong_fields`). Because these are pure `CREATE INDEX` operations they are
non-destructive and can be applied online.

```bash
cd monea-webapp          # prisma schema lives here
npx prisma migrate dev --name add_lockout_and_securitylog_indexes   # generates + reviews SQL
npx prisma migrate deploy                                           # production
```

Equivalent raw SQL, so it can be audited before it is run:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_lockedUntil_idx"            ON "User"("lockedUntil");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_failedAttempts_idx"         ON "User"("failedAttempts");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Staff_lockedUntil_idx"           ON "Staff"("lockedUntil");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Staff_failedAttempts_idx"        ON "Staff"("failedAttempts");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IpSecurity_blockedUntil_idx"     ON "IpSecurity"("blockedUntil");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "SecurityLog_event_createdAt_idx" ON "SecurityLog"("event","createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Activity_weddingId_order_idx"    ON "Activity"("weddingId","order");
```

Rollback (single statement per index, no data loss):

```sql
DROP INDEX IF EXISTS "User_lockedUntil_idx";
DROP INDEX IF EXISTS "User_failedAttempts_idx";
DROP INDEX IF EXISTS "Staff_lockedUntil_idx";
DROP INDEX IF EXISTS "Staff_failedAttempts_idx";
DROP INDEX IF EXISTS "IpSecurity_blockedUntil_idx";
DROP INDEX IF EXISTS "SecurityLog_event_createdAt_idx";
DROP INDEX IF EXISTS "Activity_weddingId_order_idx";
```

`CONCURRENTLY` cannot run inside a transaction, so `prisma migrate deploy` will not emit it — apply by
hand if you want zero write blocking, otherwise let Prisma build them normally (these tables are
small today, so either is fine).

> If these indexes are added, remember to mirror `schema.prisma` into `monea-api-worker/prisma` so the
> two copies do not drift.

---

## 5. Query-shape issues (no migration needed, but real cost)

### 5.1 Offset pagination instead of cursor pagination

`lib/GuestService.ts` and `lib/GiftService.ts` paginate with `skip`/`take`:

```ts
prisma.guest.findMany({ where: { weddingId }, orderBy: { createdAt: "desc" }, take: limit, skip: offset })
prisma.gift.findMany({  where: { weddingId }, orderBy: { createdAt: "desc" }, take: limit, skip: offset })
```

Postgres must scan and discard `offset` rows every time, so page 20 costs ~20× page 1. The indexes
needed for cursor pagination **already exist** (`Guest(weddingId, createdAt desc)`,
`Gift(weddingId, createdAt desc)`), so this is a code change with no migration:

```ts
// first page
where: { weddingId }
orderBy: { createdAt: 'desc' }
take: limit + 1
// next page
where: { weddingId, createdAt: { lt: cursor.createdAt } }
```

`GuestService` already exposes a `cursor` parameter in its signature, so the API shape does not have
to change. This is a recommendation, not applied — it changes response semantics for clients, so it
needs a deliberate decision.

### 5.2 Derived sequence numbers are read-modify-write

```ts
// lib/GuestService.ts:60        const count = await prisma.guest.count({ where: { weddingId } });
//                               const guestCode = `G${String(count + 1).padStart(3, "0")}`;
// lib/GiftService.ts:143        const giftCount = await prisma.gift.count({ where: { weddingId } });
//                               const sequenceNumber = giftCount + 1;
```

The comment in `GiftService.ts` already flags this as a *"Non-transactional read"*. Beyond the extra
`count()` round trip, two concurrent writers can produce the same `guestCode`/`sequenceNumber`.
`Guest` happens to be protected by `@@unique([weddingId, guestCode])`, so a collision errors instead
of corrupting data — but only because a unique constraint catches it, and `Gift.sequenceNumber` has
**no such constraint**. Flagged as a **data-integrity risk**, deliberately not changed here: fixing it
requires a sequence/counter column or a retry-with-constraint strategy and therefore a migration and
a decision about numbering semantics.

### 5.3 `count()` calls used only for display

`routers/dashboard.ts` and `routers/gifts.ts` issue several `count()` queries per dashboard load
(`guest.count`, `guest.count({hasArrived:true})`, `gift.count`, `guestbookEntry.count`, plus two
`gift.aggregate` calls). They are already inside `Promise.all`, so they batch into one HTTP request —
but they are still five index-only scans per dashboard view. If dashboard TTFB becomes a problem, the
cheapest fix is a short-lived per-wedding Redis cache (the Worker already has Upstash wired up in
`lib/redis.ts` and uses it for `public_stats`), not a schema change.

### 5.4 Two DB client modules for one database

See §1. Consolidating `lib/db.ts` and `lib/drizzle.ts` onto one shared `neon()` client would remove
one client construction per isolate and one source of drift.
