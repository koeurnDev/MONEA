/**
 * Example Router using Neon HTTP Driver
 * 
 * This demonstrates how to use Neon HTTP driver instead of Prisma
 * for Cloudflare Workers compatibility
 */
import { Hono } from 'hono';
import { getDb } from '@/lib/db';

const app = new Hono();

// Example 1: Simple SELECT query
app.get('/users/:id', async (c) => {
  const sql = getDb();
  const userId = c.req.param('id');
  
  try {
    const users = (await sql`
      SELECT id, email, name, role, "createdAt"
      FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `) as any[];
    
    if (!users || users.length === 0) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    
    return c.json({ success: true, user: users[0] });
  } catch (error: any) {
    console.error('[Example Neon User Error]:', error?.message || error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Example 2: Query with JOIN
app.get('/weddings/:id/stats', async (c) => {
  const sql = getDb();
  const weddingId = c.req.param('id');
  
  try {
    const stats = (await sql`
      SELECT 
        w.id,
        w."groomName",
        w."brideName",
        COUNT(DISTINCT g.id) as guest_count,
        COUNT(DISTINCT CASE WHEN g."attendanceStatus" = 'confirmed' THEN g.id END) as confirmed_count,
        COUNT(DISTINCT gb.id) as guestbook_count
      FROM "Wedding" w
      LEFT JOIN "Guest" g ON g."weddingId" = w.id
      LEFT JOIN "GuestbookEntry" gb ON gb."weddingId" = w.id
      WHERE w.id = ${weddingId}
      GROUP BY w.id, w."groomName", w."brideName"
    `) as any[];
    
    if (!stats || stats.length === 0) {
      return c.json({ success: false, error: 'Wedding not found' }, 404);
    }

    return c.json({ success: true, stats: stats[0] });
  } catch (error: any) {
    console.error('[Example Neon Stats Error]:', error?.message || error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Example 3: INSERT query
app.post('/guests', async (c) => {
  const sql = getDb();
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON format' }, 400);
  }

  const { weddingId, name, email, phone } = body;
  if (!weddingId || !name) {
    return c.json({ success: false, error: 'weddingId and name are required' }, 400);
  }
  
  try {
    const result = (await sql`
      INSERT INTO "Guest" (
        id,
        "weddingId",
        name,
        email,
        phone,
        "attendanceStatus",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        gen_random_uuid(),
        ${weddingId},
        ${name},
        ${email || null},
        ${phone || null},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
    `) as any[];
    
    return c.json({ success: true, guest: result[0] }, 201);
  } catch (error: any) {
    console.error('[Example Neon Insert Guest Error]:', error?.message || error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Example 4: UPDATE query
app.patch('/guests/:id/status', async (c) => {
  const sql = getDb();
  const guestId = c.req.param('id');
  
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON format' }, 400);
  }

  const { status } = body;
  if (!status) {
    return c.json({ success: false, error: 'Status is required' }, 400);
  }
  
  try {
    const result = (await sql`
      UPDATE "Guest"
      SET 
        "attendanceStatus" = ${status},
        "updatedAt" = NOW()
      WHERE id = ${guestId}
      RETURNING *
    `) as any[];
    
    if (!result || result.length === 0) {
      return c.json({ success: false, error: 'Guest not found' }, 404);
    }
    
    return c.json({ success: true, guest: result[0] });
  } catch (error: any) {
    console.error('[Example Neon Update Guest Error]:', error?.message || error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

// Example 5: Transaction-like Batch Insert
app.post('/weddings/:id/invite-batch', async (c) => {
  const sql = getDb();
  const weddingId = c.req.param('id');
  
  let body;
  try {
    body = await c.req.json<{ guests: Array<{ name: string; email?: string }> }>();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON format' }, 400);
  }

  const { guests } = body;
  if (!Array.isArray(guests) || guests.length === 0) {
    return c.json({ success: false, error: 'Guests array is required' }, 400);
  }
  
  try {
    const insertPromises = guests.map(guest =>
      sql`
        INSERT INTO "Guest" (
          id,
          "weddingId",
          name,
          email,
          "attendanceStatus",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${weddingId},
          ${guest.name},
          ${guest.email || null},
          'pending',
          NOW(),
          NOW()
        )
        RETURNING id, name, email
      `
    );
    
    const results = await Promise.all(insertPromises);
    const insertedGuests = results.flat();
    
    return c.json({ 
      success: true,
      count: insertedGuests.length,
      guests: insertedGuests
    }, 201);
  } catch (error: any) {
    console.error('[Example Neon Batch Insert Error]:', error?.message || error);
    return c.json({ success: false, error: 'Database error' }, 500);
  }
});

export default app;