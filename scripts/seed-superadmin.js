const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("=== Seeding SUPERADMIN User ===\n");

    const email = "superadmin@konyg.com";
    const plainPassword = "Admin@1234"; // Change after first login!

    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: "SUPERADMIN",
            failedAttempts: 0,
            lockedUntil: null,
        },
        create: {
            id: "cmlmznhjp0000scw7f0shshg7", // Matches seed-real-data.js
            email,
            name: "Platform Owner",
            password: hashedPassword,
            role: "SUPERADMIN",
        }
    });

    console.log(`✅ SUPERADMIN upserted: ${user.email} (id: ${user.id})`);
    console.log(`\n👤 Login Credentials:`);
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${plainPassword}`);
    console.log(`\n⚠️  Please change the password after first login!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
