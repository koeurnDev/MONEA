import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const pepper = process.env.SECURITY_PEPPER || "monea-default-pepper-ch4ng3-me";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password + pepper, 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@monea.com' },
        update: {},
        create: {
            email: 'admin@monea.com',
            name: 'System Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
