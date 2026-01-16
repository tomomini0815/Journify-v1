
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Dropping 'enableAdventure' column from UserSettings...");

        // Check if exists
        const columns: any[] = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'UserSettings' AND column_name = 'enableAdventure';
    `

        if (columns.length === 0) {
            console.log("Column does not exist. Skipping.");
            return;
        }

        // Drop column
        await prisma.$executeRawUnsafe(`ALTER TABLE "UserSettings" DROP COLUMN "enableAdventure";`);
        console.log("SUCCESS: Column dropped.");

    } catch (e: any) {
        console.error("ERROR:", e.message);
    } finally {
        await prisma.$disconnect()
    }
}

main()
