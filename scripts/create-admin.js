const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@konyg.com';
    const password = 'admin123'; // Stronger password

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log(`
  ✅ Admin Account Ready!
  ---------------------
  Email: ${user.email}
  Pass:  ${password}
  Role:  ${user.role}
  `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
