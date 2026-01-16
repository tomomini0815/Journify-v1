
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                preferences: true
            }
        })

        console.log("Users found:", users.length);
        users.forEach(u => {
            console.log(`User: ${u.email} (${u.id})`);
            console.log(`Preferences:`, JSON.stringify(u.preferences, null, 2));
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect()
    }
}

main()
