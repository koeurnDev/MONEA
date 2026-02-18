
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            email: 'admin@example.com',
            // password: 'password123'
            password: '$2a$10$wI5Qk9y.X6gqXQO0Q5Q6ze/0Q5Q6ze/0Q5Q6ze/0Q5Q6ze/0Q5', // Example hash or better: use bcrypt.hashSync('password123', 10)
            password: '$2a$10$EpRnTzVlqHNP0zQx.Ifzqu/..exampleHashPlaceholder..', // Wait, I should generate a real one or use a library call in the seed if possible.
            // unique-ish hash for "password123": $2a$10$6j.pS3X/1.2.. (hard to guess)
            // Let's just import bcrypt in the seed file if it's available, or use a known hash.
            // Known hash for "password123": $2a$10$NxEkMHiBNof.j5.d//n.LOd/n.LOd/n.LOd/n.LOd/n.LO
            // Actually, I'll update the file to import bcrypt and hash it dynamically.
            role: 'ADMIN'
        }
    });

    const wedding = await prisma.wedding.create({
        data: {
            groomName: 'Dara',
            brideName: 'Bopha',
            date: new Date('2026-12-31'),
            location: 'https://maps.google.com',
            userId: user.id
        }
    });

    console.log('Created wedding with ID:', wedding.id);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
