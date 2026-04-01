const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLocks() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        pid, 
        now() - query_start AS duration, 
        query, 
        state 
      FROM pg_stat_activity 
      WHERE state != 'idle' AND query NOT LIKE '%pg_stat_activity%';
    `);
    console.log("Active Queries:", JSON.stringify(result, null, 2));

    const locks = await prisma.$queryRawUnsafe(`
      SELECT 
        t.relname, 
        l.locktype, 
        l.mode, 
        l.granted, 
        a.query, 
        a.query_start 
      FROM pg_stat_activity a 
      JOIN pg_locks l ON l.pid = a.pid 
      JOIN pg_class t ON l.relation = t.oid 
      WHERE a.state != 'idle' AND t.relname NOT LIKE 'pg_%';
    `);
    console.log("Locks:", JSON.stringify(locks, null, 2));
  } catch (error) {
    console.error("Error checking locks (may not have permissions):", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocks();
