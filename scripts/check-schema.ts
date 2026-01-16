
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Checking UserSettings columns...");
        // Raw query to check information_schema
        const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'UserSettings' AND column_name = 'enableAdventure';
    `
        console.log("Result:", result);

        if (Array.isArray(result) && result.length > 0) {
            console.log("SUCCESS: 'enableAdventure' column exists.");
        } else {
            console.log("FAILURE: 'enableAdventure' column MISSING.");
        }
    } catch (e) {
        console.error("Error checking schema:", e);
    } finally {
        await prisma.$disconnect()
    }
}

main()
