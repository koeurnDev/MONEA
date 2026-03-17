const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking database connection...");
  try {
    const userCount = await prisma.user.count();
    console.log(`Connection successful. Total users: ${userCount}`);
    
    const weddingCount = await prisma.wedding.count();
    console.log(`Total weddings: ${weddingCount}`);
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
