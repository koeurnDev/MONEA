import { prisma } from "../src/lib/prisma";

async function debug() {
    console.log("--- DB DEBUG START ---");
    const weddingsCount = await prisma.wedding.count();
    console.log(`Total Weddings in DB: ${weddingsCount}`);
    
    const allWeddings = await prisma.wedding.findMany({
        take: 10,
        select: { id: true, userId: true, groomName: true }
    });
    
    for (const w of allWeddings) {
        const u = await prisma.user.findUnique({ where: { id: w.userId } });
        console.log(`Wedding: ${w.groomName} (ID: ${w.id}). Linked to User: ${u ? u.email : "MISSING USER (" + w.userId + ")"}`);
    }
    
    const allUsers = await prisma.user.findMany({
        take: 10,
        select: { id: true, email: true, role: true }
    });
    console.log("--- Users ---");
    for (const u of allUsers) {
        console.log(`User: ${u.email} (ID: ${u.id}) Role: ${u.role}`);
    }
    console.log("--- DB DEBUG END ---");
}

debug().catch(console.error);
