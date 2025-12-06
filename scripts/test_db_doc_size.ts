
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projectId = 'a416437a-5871-4698-b5aa-ca3ded360f70'
    const largeString = 'a'.repeat(6 * 1024 * 1024) // 6MB

    console.log('Attempting to create large document in DB...')
    try {
        const doc = await prisma.projectDocument.create({
            data: {
                projectId,
                name: 'Large Test Doc',
                type: 'text/plain',
                size: largeString.length,
                url: largeString
            }
        })
        console.log('Successfully created large document:', doc.id)

        // Clean up
        await prisma.projectDocument.delete({ where: { id: doc.id } })
        console.log('Test document deleted.')
    } catch (e) {
        console.error('Failed to create large document:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
