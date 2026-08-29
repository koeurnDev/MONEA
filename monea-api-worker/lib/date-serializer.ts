/**
 * Date serialization helpers to fix Prisma Date object serialization issues
 * 
 * Issue: Prisma returns DateTime fields as Date objects, which serialize to {}
 * Solution: Convert Date objects to ISO strings before sending to client
 */

/**
 * Recursively converts Date objects to ISO strings in an object
 */
export function serializeDates<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item)) as any;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDates(value);
    }
    return serialized;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Helper to safely serialize wedding data with date fields
 */
export function serializeWedding(wedding: any) {
  if (!wedding) return null;
  
  return {
    ...wedding,
    date: wedding.date instanceof Date ? wedding.date.toISOString() : wedding.date,
    createdAt: wedding.createdAt instanceof Date ? wedding.createdAt.toISOString() : wedding.createdAt,
    updatedAt: wedding.updatedAt instanceof Date ? wedding.updatedAt.toISOString() : wedding.updatedAt,
    expiresAt: wedding.expiresAt instanceof Date ? wedding.expiresAt.toISOString() : wedding.expiresAt,
  };
}
