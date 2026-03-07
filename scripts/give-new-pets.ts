import prisma from '../lib/prisma'

async function givePets() {
    const user = await prisma.user.findFirst()
    if (!user) {
        console.log("No user found")
        return
    }

    const newPets = ['pentanuki', 'mochikuma', 'hamuri']
    for (const species of newPets) {
        const comp = await prisma.companion.findFirst({ where: { species } })
        if (comp) {
            const hasIt = await prisma.userCompanion.findFirst({
                where: { userId: user.id, companionId: comp.id }
            })
            if (!hasIt) {
                await prisma.userCompanion.create({
                    data: {
                        userId: user.id,
                        companionId: comp.id,
                        happiness: 50,
                        energy: 50,
                        loyalty: 10
                    }
                })
                console.log(`Gave ${comp.name} to user!`)
            } else {
                console.log(`User already has ${comp.name}`)
            }
        }
    }
}

givePets().then(() => {
    console.log("Done")
    process.exit(0)
})
