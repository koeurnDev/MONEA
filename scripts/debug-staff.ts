import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const staff = await prisma.staff.findMany({
        include: { wedding: true }
    })
    console.log('Total Staff:', staff.length)
    staff.forEach(s => {
        console.log(`- ID: ${s.id}, Name: ${s.name}, PIN (Raw in DB): ${s.pin}, Wedding: ${s.wedding?.groomName} & ${s.wedding?.brideName}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
