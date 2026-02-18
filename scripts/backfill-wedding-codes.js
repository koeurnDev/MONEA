const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')

function generateCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase() // 6 characters
}

async function main() {
    const weddings = await prisma.wedding.findMany({
        where: { weddingCode: null }
    })

    console.log(`Found ${weddings.length} weddings to update.`)

    for (const w of weddings) {
        let code = generateCode()
        // Simple retry to ensure uniqueness
        let exists = await prisma.wedding.findUnique({ where: { weddingCode: code } })
        while (exists) {
            code = generateCode()
            exists = await prisma.wedding.findUnique({ where: { weddingCode: code } })
        }

        await prisma.wedding.update({
            where: { id: w.id },
            data: { weddingCode: code }
        })
        console.log(`Updated Wedding ID: ${w.id} with Code: ${code}`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
