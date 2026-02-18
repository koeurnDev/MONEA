const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    console.log('--- USERS ---')
    users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email || 'N/A'}, Role: ${u.role}`))

    const weddings = await prisma.wedding.findMany()
    console.log('\n--- WEDDINGS ---')
    weddings.forEach(w => console.log(`ID: ${w.id}, UserID: ${w.userId}, Groom: ${w.groomName}, Bride: ${w.brideName}`))

    const staff = await prisma.staff.findMany({ include: { wedding: true } })
    console.log('\n--- STAFF ---')
    staff.forEach(s => console.log(`ID: ${s.id}, Name: ${s.name}, PIN: ${s.pin}, WeddingID: ${s.weddingId}`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
