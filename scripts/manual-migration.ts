
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Attempting to manually add 'enableAdventure' column...");

        // Check if exists first (to avoid error if it was added meanwhile)
        const checkColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'UserSettings' AND column_name = 'enableAdventure';
    `

        if (Array.isArray(checkColumns) && checkColumns.length > 0) {
            console.log("Column already exists. Skipping.");
            return;
        }

        // Execute ALTER TABLE
        const result = await prisma.$executeRawUnsafe(`
        ALTER TABLE "UserSettings" 
        ADD COLUMN "enableAdventure" BOOLEAN DEFAULT true;
    `);

        console.log("ALTER TABLE executed. Result:", result);
        console.log("Migration successful.");

    } catch (e) {
        console.error("Error running manual migration:", e);
    } finally {
        await prisma.$disconnect()
    }
}

main()
