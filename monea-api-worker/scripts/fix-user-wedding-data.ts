/**
 * Fix corrupted date fields for specific user's wedding
 * 
 * Run: DATABASE_URL="..." npx tsx scripts/fix-user-wedding-data.ts
 */

import 'dotenv/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const USER_ID = 'cmn6d1rw3000d6541viuyttii'; // The logged-in user

async function fixUserWeddingData() {
  console.log(`🔧 Fixing wedding data for user: ${USER_ID}\n`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Find user's wedding with raw data inspection
    console.log('📊 Checking user wedding data...\n');
    
    const result = await pool.query(`
      SELECT 
        id, 
        "userId",
        "groomName", 
        "brideName", 
        date,
        "createdAt",
        "updatedAt",
        pg_typeof(date) as date_type,
        pg_typeof("createdAt") as created_type,
        pg_typeof("updatedAt") as updated_type
      FROM "Wedding"
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 1
    `, [USER_ID]);

    if (result.rowCount === 0) {
      console.log('⚠️  No wedding found for this user!');
      return;
    }

    const wedding = result.rows[0];
    console.log('Found wedding:');
    console.log(`  ID: ${wedding.id}`);
    console.log(`  Groom: ${wedding.groomName}, Bride: ${wedding.brideName}`);
    console.log(`  date type: ${wedding.date_type}`);
    console.log(`  date value:`, wedding.date);
    console.log(`  createdAt type: ${wedding.created_type}`);
    console.log(`  createdAt value:`, wedding.createdAt);
    console.log(`  updatedAt type: ${wedding.updated_type}`);
    console.log(`  updatedAt value:`, wedding.updatedAt);
    console.log('');

    // Check if date needs fixing
    let needsFix = false;
    const dateStr = String(wedding.date || '');
    
    if (!wedding.date || dateStr === '{}' || dateStr === '' || dateStr === 'null' || dateStr.startsWith('{')) {
      console.log('❌ Wedding.date is corrupted!');
      needsFix = true;
    } else {
      console.log('✅ Wedding.date looks valid');
    }

    // Check User table for this user
    console.log('\n📊 Checking User data...\n');
    const userResult = await pool.query(`
      SELECT 
        id,
        email,
        "createdAt",
        "updatedAt",
        pg_typeof("createdAt") as created_type
      FROM "User"
      WHERE id = $1
    `, [USER_ID]);

    if ((userResult.rowCount ?? 0) > 0) {
      const user = userResult.rows[0];
      console.log('Found user:');
      console.log(`  Email: ${user.email}`);
      console.log(`  createdAt type: ${user.created_type}`);
      console.log(`  createdAt value:`, user.createdAt);
      console.log('');
    }

    if (!needsFix) {
      console.log('✅ No corruption detected. Data looks good!');
      return;
    }

    // Fix the corrupted date
    console.log('🔧 Fixing corrupted Wedding.date...\n');
    
    const defaultDate = '2026-06-01T00:00:00.000Z';
    
    const updateResult = await pool.query(`
      UPDATE "Wedding"
      SET 
        date = $1::timestamp,
        "updatedAt" = NOW()
      WHERE id = $2
      RETURNING id, "groomName", "brideName", date
    `, [defaultDate, wedding.id]);

    if ((updateResult.rowCount ?? 0) > 0) {
      const updated = updateResult.rows[0];
      console.log('✅ Fixed wedding:');
      console.log(`  ID: ${updated.id}`);
      console.log(`  ${updated.groomName} & ${updated.brideName}`);
      console.log(`  New date: ${updated.date}`);
      console.log('');
    }

    // Verify
    console.log('🔍 Verifying fix...\n');
    const verifyResult = await pool.query(`
      SELECT id, date, pg_typeof(date) as date_type
      FROM "Wedding"
      WHERE id = $1
    `, [wedding.id]);

    if ((verifyResult.rowCount ?? 0) > 0) {
      const verified = verifyResult.rows[0];
      console.log(`✅ Verification:  date type: ${verified.date_type}, value: ${verified.date}`);
    }

    console.log('\n✅ Fix completed!');
    console.log(`📝 Note: Wedding date set to ${defaultDate}`);
    console.log('   User can update this through the UI.\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixUserWeddingData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
