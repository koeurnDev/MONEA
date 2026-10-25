/**
 * One-Time Migration Script
 * Auto-grants template licenses to existing PRO/PREMIUM package users
 * 
 * Usage:
 * 1. Run via wrangler: wrangler dev --local
 * 2. Or integrate into cron job: POST /api/admin/master/migrate-legacy-users
 * 
 * Safety:
 * - Idempotent: safe to run multiple times
 * - Uses UNIQUE constraint to prevent duplicates
 * - Only affects users with packageType = PRO or PREMIUM
 */

import { prisma } from '@/lib/prisma';
import { generateId } from '@/lib/drizzle-helpers';

interface MigrationResult {
  success: boolean;
  usersProcessed: number;
  licensesCreated: number;
  errors: string[];
}

/**
 * Get all templates that should be granted to legacy package users
 */
const LEGACY_PACKAGE_TEMPLATES = [
  'khmer-legacy',      // Paid template; grant access to legacy paid-package users
  'modern-minimal',    // Grant to PRO/PREMIUM
  'fortune-harmony',   // Grant to PREMIUM only
  'royal-elegance',    // Grant to PREMIUM only
  'contemporary',      // Grant to PRO/PREMIUM
  'minimalist',        // Grant to PRO/PREMIUM
  'romantic-blush',    // Grant to PREMIUM only
  'sophisticated',     // Always free (but grant for consistency)
];

/**
 * Migrate a single user's package to template licenses
 */
async function migrateUser(wedding: any): Promise<number> {
  const { id: weddingId, packageType } = wedding;
  
  // Determine which templates to grant
  let templatesToGrant: string[];
  
  if (packageType === 'PREMIUM') {
    // PREMIUM users get all templates
    templatesToGrant = LEGACY_PACKAGE_TEMPLATES;
  } else if (packageType === 'PRO') {
    // PRO users get basic paid templates
    templatesToGrant = [
      'khmer-legacy',
      'modern-minimal',
      'contemporary',
      'minimalist',
      'sophisticated',
    ];
  } else {
    return 0; // FREE users - no migration needed
  }
  
  let createdCount = 0;
  
  for (const templateId of templatesToGrant) {
    try {
      // Check if license already exists
      const existing = await prisma.templateLicense.findUnique({
        where: {
          weddingId_templateId: {
            weddingId,
            templateId,
          },
        },
      });
      
      if (existing) {
        console.log(`[Migration] License already exists: ${weddingId} -> ${templateId}`);
        continue;
      }
      
      // Create template license
      await prisma.templateLicense.create({
        data: {
          id: generateId(),
          weddingId,
          templateId,
          status: 'ACTIVE',
          purchaseDate: new Date(),
          expiresAt: null, // Lifetime access (legacy behavior)
          amount: 0, // Granted, not purchased
          currency: 'USD',
          paymentOrderId: `LEGACY_MIGRATION_${packageType}`,
          publishedAt: new Date(),
        },
      });
      
      createdCount++;
      console.log(`[Migration] Created license: ${weddingId} -> ${templateId}`);
    } catch (error: any) {
      // Ignore duplicate errors (race condition protection)
      if (error.code === 'P2002') {
        console.warn(`[Migration] Duplicate license (race condition): ${weddingId} -> ${templateId}`);
      } else {
        throw error;
      }
    }
  }
  
  return createdCount;
}

/**
 * Main migration function
 */
export async function migrateLegacyUsersToTemplateLicensing(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    usersProcessed: 0,
    licensesCreated: 0,
    errors: [],
  };
  
  try {
    console.log('[Migration] Starting legacy user migration...');
    
    // Find all weddings with PRO or PREMIUM packages
    const legacyWeddings = await prisma.wedding.findMany({
      where: {
        packageType: {
          in: ['PRO', 'PREMIUM'],
        },
      },
      select: {
        id: true,
        packageType: true,
        userId: true,
        groomName: true,
        brideName: true,
      },
    });
    
    console.log(`[Migration] Found ${legacyWeddings.length} legacy package weddings`);
    
    // Process each wedding
    for (const wedding of legacyWeddings) {
      try {
        const created = await migrateUser(wedding);
        result.licensesCreated += created;
        result.usersProcessed++;
        
        console.log(`[Migration] Processed ${wedding.id} (${wedding.packageType}): ${created} licenses created`);
      } catch (error: any) {
        const errorMsg = `Failed to migrate wedding ${wedding.id}: ${error.message}`;
        console.error(`[Migration] ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }
    
    result.success = result.errors.length === 0;
    
    console.log('[Migration] Migration complete:', {
      usersProcessed: result.usersProcessed,
      licensesCreated: result.licensesCreated,
      errors: result.errors.length,
    });
    
    return result;
  } catch (error: any) {
    console.error('[Migration] Fatal migration error:', error);
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Dry run - preview what would be migrated without making changes
 */
export async function previewMigration(): Promise<any> {
  const legacyWeddings = await prisma.wedding.findMany({
    where: {
      packageType: {
        in: ['PRO', 'PREMIUM'],
      },
    },
    select: {
      id: true,
      packageType: true,
      groomName: true,
      brideName: true,
    },
  });
  
  const preview = [];
  
  for (const wedding of legacyWeddings) {
    const templatesToGrant = wedding.packageType === 'PREMIUM' 
      ? LEGACY_PACKAGE_TEMPLATES 
      : LEGACY_PACKAGE_TEMPLATES.filter(t => !['fortune-harmony', 'royal-elegance', 'romantic-blush'].includes(t));
    
    preview.push({
      weddingId: wedding.id,
      packageType: wedding.packageType,
      groomName: wedding.groomName,
      brideName: wedding.brideName,
      templatesWillBeGranted: templatesToGrant,
      count: templatesToGrant.length,
    });
  }
  
  return {
    totalWeddings: legacyWeddings.length,
    totalLicensesToCreate: preview.reduce((sum, p) => sum + p.count, 0),
    preview,
  };
}

// Export for use in admin endpoint or cron job
export default {
  migrate: migrateLegacyUsersToTemplateLicensing,
  preview: previewMigration,
};
