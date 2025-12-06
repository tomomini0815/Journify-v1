
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projectId = 'a416437a-5871-4698-b5aa-ca3ded360f70' // ID from the curl command
    console.log(`Fetching project ${projectId}...`)
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                milestones: true,
                tasks: {
                    include: { attachments: true }
                },
                comments: true
            }
        })
        console.log('Project fetched successfully:', project)
    } catch (e) {
        console.error('Error fetching project:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
