import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to database...')
    try {
        // List first 5 tasks
        const tasks = await prisma.task.findMany({ take: 5 })
        console.log('Found tasks:', tasks)

        if (tasks.length > 0) {
            const task = tasks[0]
            console.log('Attempting to update task:', task.id)

            const updated = await prisma.task.update({
                where: { id: task.id },
                data: {
                    description: "Debug description update",
                    status: "in_progress",
                    priority: "high"
                }
            })
            console.log('Update successful:', updated)
        } else {
            console.log('No tasks found to update.')
        }
    } catch (error) {
        console.error('Error during debug:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
