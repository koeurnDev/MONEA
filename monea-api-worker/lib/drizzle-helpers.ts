/**
 * Drizzle Query Helpers
 * 
 * Common query patterns and utilities
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from './drizzle';
import { weddings, guests, activities, galleryItems, users } from '../drizzle/schema';

/**
 * Generate CUID-like ID (compatible with Prisma)
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomStr}`;
}

/**
 * Get user's wedding
 */
export async function getUserWedding(userId: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, userId))
    .orderBy(desc(weddings.createdAt))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get user's wedding with full data (activities + gallery)
 */
export async function getUserWeddingFull(userId: string, env?: any) {
  const db = getDb(env);
  
  const wedding = await getUserWedding(userId, env);
  if (!wedding) return null;
  
  const [activitiesData, galleryData] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(eq(activities.weddingId, wedding.id))
      .orderBy(activities.order),
    db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.weddingId, wedding.id))
      .orderBy(galleryItems.createdAt)
      .limit(50),
  ]);
  
  return {
    ...wedding,
    activities: activitiesData,
    galleryItems: galleryData,
  };
}

/**
 * Get wedding by ID
 */
export async function getWeddingById(weddingId: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(weddings)
    .where(eq(weddings.id, weddingId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get wedding by ID with full data
 */
export async function getWeddingByIdFull(weddingId: string, env?: any) {
  const db = getDb(env);
  
  const wedding = await getWeddingById(weddingId, env);
  if (!wedding) return null;
  
  const [activitiesData, galleryData] = await Promise.all([
    db
      .select()
      .from(activities)
      .where(eq(activities.weddingId, wedding.id))
      .orderBy(activities.order),
    db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.weddingId, wedding.id))
      .orderBy(galleryItems.createdAt)
      .limit(50),
  ]);
  
  return {
    ...wedding,
    activities: activitiesData,
    galleryItems: galleryData,
  };
}

/**
 * Get wedding guests with pagination
 */
export async function getWeddingGuests(
  weddingId: string, 
  limit: number = 50, 
  offset: number = 0, 
  env?: any
) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(guests)
    .where(eq(guests.weddingId, weddingId))
    .orderBy(desc(guests.createdAt))
    .limit(limit)
    .offset(offset);
  
  return result;
}

/**
 * Get wedding guests count
 */
export async function getWeddingGuestsCount(weddingId: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(guests)
    .where(eq(guests.weddingId, weddingId));
  
  return result[0]?.count || 0;
}

/**
 * Get wedding activities
 */
export async function getWeddingActivities(weddingId: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(activities)
    .where(eq(activities.weddingId, weddingId))
    .orderBy(activities.order);
  
  return result;
}

/**
 * Get wedding gallery items
 */
export async function getWeddingGallery(weddingId: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.weddingId, weddingId))
    .orderBy(galleryItems.createdAt)
    .limit(50);
  
  return result;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string, env?: any) {
  const db = getDb(env);
  
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return result[0] || null;
}
