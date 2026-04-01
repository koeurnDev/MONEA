const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStatus() {
  const userId = "cmn5n3p1f0003lct7etkzozw4";
  console.log(`Checking status for user: ${userId}`);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log("User:", JSON.stringify(user, null, 2));

    const weddings = await prisma.wedding.findMany({ where: { id: "cmn5n4f3r0004lct7t9969zrq" } }); // Try use ID from wedding context found in log if possible, but I don't have it yet.
    // Wait! In the log, Body weddingId was not visible, context had userId.
    
    const weddingsByUser = await prisma.wedding.findMany({ where: { userId } });
    console.log("Weddings by User count:", weddingsByUser.length);
    
    for (const w of weddingsByUser) {
      const guestsCount = await prisma.guest.count({ where: { weddingId: w.id } });
      const giftsCount = await prisma.gift.count({ where: { weddingId: w.id } });
      console.log(`Wedding ${w.id}: Guests=${guestsCount}, Gifts=${giftsCount}`);
    }
  } catch (error) {
    console.error("Error checking status:", error);
  } finally {
    const p = await prisma.$disconnect();
  }
}

checkStatus();
