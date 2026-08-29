/**
 * Database cleanup script to fix corrupted Wedding.date fields
 * 
 * Issue: Wedding.date contains {} or invalid values instead of valid date strings
 * Solution: Update database directly with raw SQL to fix corrupted values
 * 
 * Run: DATABASE_URL="..." npx tsx scripts/fix-wedding-dates.ts
 */

import 'dotenv/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('Usage: DATABASE_URL="postgresql://..." npx tsx scripts/fix-wedding-dates.ts');
  process.exit(1);
}

async function fixWeddingDates() {
  console.log('🔧 Starting Wedding.date cleanup using raw SQL...\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Step 1: Check ALL wedding dates with detailed type info
    console.log('📊 Checking ALL Wedding.date values with type information...\n');
    const checkResult = await pool.query(`
      SELECT 
        id, 
        "groomName", 
        "brideName", 
        date, 
        pg_typeof(date) as date_type,
        CAST(date AS TEXT) as date_as_text,
        LENGTH(CAST(date AS TEXT)) as text_length
      FROM "Wedding"
      ORDER BY "createdAt" DESC
    `);

    console.log(`Found ${checkResult.rowCount} total weddings:\n`);
    checkResult.rows.forEach((row: any) => {
      const dateAsText = row.date_as_text || 'NULL';
      console.log(`  ${row.id}: ${row.groomName} & ${row.brideName}`);
      console.log(`    type: ${row.date_type}, length: ${row.text_length}`);
      console.log(`    value as text: "${dateAsText}"`);
      console.log(`    raw value:`, row.date);
      console.log('');
    });

    // Step 2: Find corrupted entries using multiple checks
    console.log('\n🔍 Finding corrupted date entries...\n');
    
    const corruptedResult = await pool.query(`
      SELECT id, "groomName", "brideName", date, CAST(date AS TEXT) as date_text
      FROM "Wedding"
      WHERE 
        date IS NULL 
        OR CAST(date AS TEXT) = '{}'
        OR CAST(date AS TEXT) = ''
        OR CAST(date AS TEXT) = 'null'
        OR CAST(date AS TEXT) LIKE '{%'
        OR CAST(date AS TEXT) = '[]'
        OR LENGTH(CAST(date AS TEXT)) < 10
    `);

    const corruptedCount = corruptedResult.rowCount || 0;
    console.log(`Found ${corruptedCount} corrupted entries\n`);

    if (corruptedCount === 0) {
      console.log('✅ No corrupted dates found based on text casting!');
      console.log('\n⚠️  However, Prisma is still reporting errors.');
      console.log('This suggests the column type itself may be the issue.');
      console.log('\nℹ️  Database column type is: ' + checkResult.rows[0]?.date_type);
      return;
    }

    // Show corrupted entries
    corruptedResult.rows.forEach((row: any) => {
      console.log(`  ❌ ${row.id}: ${row.groomName} & ${row.brideName}`);
      console.log(`     Current date text: "${row.date_text}"`);
      console.log(`     Current date value:`, row.date);
    });

    // Step 3: Fix corrupted entries
    console.log('\n🔧 Fixing corrupted entries...\n');
    
    // Use a default date for corrupted entries (can be changed later by users)
    const defaultDate = '2026-06-01T00:00:00.000Z';
    
    const updateResult = await pool.query(`
      UPDATE "Wedding"
      SET date = $1::timestamp, "updatedAt" = NOW()
      WHERE 
        date IS NULL 
        OR CAST(date AS TEXT) = '{}'
        OR CAST(date AS TEXT) = ''
        OR CAST(date AS TEXT) = 'null'
        OR CAST(date AS TEXT) LIKE '{%'
        OR CAST(date AS TEXT) = '[]'
        OR LENGTH(CAST(date AS TEXT)) < 10
      RETURNING id, "groomName", "brideName"
    `, [defaultDate]);

    const updatedCount = updateResult.rowCount || 0;
    console.log(`✅ Updated ${updatedCount} wedding dates to: ${defaultDate}\n`);

    updateResult.rows.forEach((row: any) => {
      console.log(`  ✓ ${row.id}: ${row.groomName} & ${row.brideName}`);
    });

    // Step 4: Verify fix
    console.log('\n🔍 Verifying fix...\n');
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM "Wedding"
      WHERE 
        date IS NULL 
        OR CAST(date AS TEXT) = '{}'
        OR CAST(date AS TEXT) = ''
        OR CAST(date AS TEXT) LIKE '{%'
        OR LENGTH(CAST(date AS TEXT)) < 10
    `);

    const remainingCorrupted = parseInt(verifyResult.rows[0]?.count || '0');
    
    if (remainingCorrupted === 0) {
      console.log('✅ All Wedding.date values are now valid!');
      console.log(`\n📝 Note: ${updatedCount} weddings were set to default date ${defaultDate}`);
      console.log('   Users can update these dates through the UI.\n');
    } else {
      console.log(`⚠️  Warning: ${remainingCorrupted} corrupted entries still remain.`);
    }

  } catch (error: any) {
    console.error('\n❌ Error during cleanup:', error.message);
    console.error(error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
fixWeddingDates()
  .then(() => {
    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
