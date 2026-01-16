
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const email = 'tomomini0815@gmail.com' // Targeting specific user seen in logs
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'tomomini' } } // fuzzy match to be safe
        })

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log("Found user:", user.email);
        console.log("Current prefs:", user.preferences);

        const currentPrefs = (user.preferences as any) || {}
        const newPrefs = { ...currentPrefs, enableAdventure: false }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { preferences: newPrefs }
        })

        console.log("Updated prefs:", updated.preferences);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect()
    }
}

main()
