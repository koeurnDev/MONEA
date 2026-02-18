const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@konyg.com';
    const password = 'konyg_admin_2026';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'SUPERADMIN' // Platform Owner role
        },
        create: {
            email,
            password: hashedPassword,
            role: 'SUPERADMIN'
        }
    });

    console.log('--- Super Admin Account Created ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);
    console.log('-----------------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
