
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const userStats = await prisma.userStats.findMany(); // Assuming single user dev env, or list all
    const challenges = await prisma.dailyChallenge.findMany();

    console.log("--- User Stats ---");
    console.log(JSON.stringify(userStats, null, 2));

    console.log("--- Daily Challenges ---");
    console.log(JSON.stringify(challenges, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
