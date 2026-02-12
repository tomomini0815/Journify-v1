
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const project = await prisma.project.findFirst()
    if (project) {
        console.log(project.id)
    } else {
        console.log('NO_PROJECTS')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
