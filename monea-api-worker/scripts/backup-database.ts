/**
 * Database backup script using Neon SQL queries
 * 
 * Creates a SQL dump of all tables and data
 */

import 'dotenv/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupFile = path.join(process.cwd(), `backups`, `backup-${timestamp}.sql`);
  
  // Create backups directory if not exists
  const backupsDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  console.log(`📦 Creating database backup: ${backupFile}\n`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    let sqlDump = `-- MONEA Database Backup
-- Generated: ${new Date().toISOString()}
-- Database: Neon PostgreSQL
\n\n`;

    // Get all tables
    console.log('📊 Fetching table list...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((r: any) => r.table_name);
    console.log(`Found ${tables.length} tables: ${tables.join(', ')}\n`);

    // For each table, get schema and data
    for (const tableName of tables) {
      console.log(`📋 Backing up table: ${tableName}`);

      // Get table schema
      const schemaResult = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      sqlDump += `\n-- Table: ${tableName}\n`;
      sqlDump += `-- Columns: ${schemaResult.rowCount}\n\n`;

      // Get row count
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0]?.count || '0');
      console.log(`  → ${rowCount} rows`);

      sqlDump += `-- Row count: ${rowCount}\n\n`;

      // Get data (limit to prevent memory issues)
      if (rowCount > 0) {
        const dataResult = await pool.query(`SELECT * FROM "${tableName}"`);
        
        if (dataResult.rows.length > 0) {
          const columns = Object.keys(dataResult.rows[0]);
          
          sqlDump += `-- Data for ${tableName}\n`;
          
          for (const row of dataResult.rows) {
            const values = columns.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (val instanceof Date) return `'${val.toISOString()}'`;
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              return val;
            });
            
            sqlDump += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          
          sqlDump += '\n';
        }
      }
    }

    // Write to file
    fs.writeFileSync(backupFile, sqlDump, 'utf-8');

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 File: ${backupFile}`);
    console.log(`📊 Size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB\n`);

  } catch (error: any) {
    console.error('\n❌ Backup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

backupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
