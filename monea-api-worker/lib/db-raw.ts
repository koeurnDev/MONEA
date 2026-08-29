/**
 * Raw SQL database queries using @neondatabase/serverless
 * 
 * Bypass Prisma adapter issues by querying PostgreSQL directly
 */

import { neon } from '@neondatabase/serverless';

let cachedSql: ReturnType<typeof neon> | null = null;
let cachedDbUrl = '';

function getDatabaseUrl(env?: any): string {
  if (env && env.DATABASE_URL) return env.DATABASE_URL;
  if (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL || '';
  }
  return '';
}

export function getRawSql(env?: any) {
  const dbUrl = getDatabaseUrl(env);
  
  if (cachedSql && cachedDbUrl === dbUrl) {
    return cachedSql;
  }
  
  if (!dbUrl) {
    throw new Error('[DB Raw] DATABASE_URL is missing');
  }
  
  cachedSql = neon(dbUrl, {
    arrayMode: false,
    fullResults: false,
  });
  cachedDbUrl = dbUrl;
  
  return cachedSql;
}

/**
 * Get user's wedding with proper date handling
 */
export async function getUserWedding(userId: string, env?: any) {
  const sql = getRawSql(env);
  
  const result = (await sql`
    SELECT 
      id, 
      "userId",
      "groomName", 
      "brideName",
      "location",
      to_char(date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as date,
      "eventType",
      "templateId",
      "themeSettings",
      notes,
      "weddingCode",
      status,
      "packageType",
      "paymentStatus",
      to_char("expiresAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "expiresAt",
      "telegramLink",
      "paymentInfo",
      "paymentHash",
      "bakongTrxId",
      to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
      to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "updatedAt"
    FROM "Wedding"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `) as any[];
  
  return result[0] || null;
}

/**
 * Get wedding by ID
 */
export async function getWeddingById(weddingId: string, env?: any) {
  const sql = getRawSql(env);
  
  const result = (await sql`
    SELECT 
      id, 
      "userId",
      "groomName", 
      "brideName",
      "location",
      to_char(date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as date,
      "eventType",
      "templateId",
      "themeSettings",
      notes,
      "weddingCode",
      status,
      "packageType",
      "paymentStatus",
      to_char("expiresAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "expiresAt",
      "telegramLink",
      "paymentInfo",
      "paymentHash",
      "bakongTrxId",
      to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
      to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "updatedAt"
    FROM "Wedding"
    WHERE id = ${weddingId}
    LIMIT 1
  `) as any[];
  
  return result[0] || null;
}

/**
 * Get guests for a wedding
 */
export async function getWeddingGuests(weddingId: string, limit: number = 50, offset: number = 0, env?: any) {
  const sql = getRawSql(env);
  
  const result = await sql`
    SELECT 
      id,
      "weddingId",
      name,
      phone,
      email,
      "rsvpStatus",
      "adultsCount",
      "childrenCount",
      "rsvpNotes",
      to_char("rsvpAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "rsvpAt",
      source,
      to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt",
      to_char("updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "updatedAt"
    FROM "Guest"
    WHERE "weddingId" = ${weddingId}
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return result;
}

/**
 * Get activities for a wedding
 */
export async function getWeddingActivities(weddingId: string, env?: any) {
  const sql = getRawSql(env);
  
  const result = await sql`
    SELECT 
      id,
      "weddingId",
      title,
      time,
      description,
      icon,
      "publicId",
      "order"
    FROM "Activity"
    WHERE "weddingId" = ${weddingId}
    ORDER BY "order" ASC
  `;
  
  return result;
}

/**
 * Get gallery items for a wedding
 */
export async function getWeddingGallery(weddingId: string, env?: any) {
  const sql = getRawSql(env);
  
  const result = await sql`
    SELECT 
      id,
      "weddingId",
      url,
      "publicId",
      type,
      caption,
      to_char("createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "createdAt"
    FROM "GalleryItem"
    WHERE "weddingId" = ${weddingId}
    ORDER BY "createdAt" ASC
    LIMIT 50
  `;
  
  return result;
}
