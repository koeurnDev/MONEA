const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: This test script cannot be run in production environment.');
    process.exit(1);
  }

  try {
    const res = await prisma.wedding.findFirst({
      include: {
        galleryItems: { orderBy: { id: 'asc' } },
        activities: { orderBy: { order: 'asc' } }
      }
    });
    console.log('SUCCESS: Connection established and data retrieved.');
  } catch (e) {
    console.error('FAIL: Database connection failed. Check your environment variables.');
  } finally {
    await prisma.$disconnect();
  }
}

test();
