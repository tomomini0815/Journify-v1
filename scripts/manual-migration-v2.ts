
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Starting diagnostics...");

        // 1. List all tables
        const tables: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `
        console.log("Tables found:", tables.map(t => t.table_name));

        // 2. Find UserSettings
        const targetTable = tables.find(t => t.table_name.toLowerCase() === 'usersettings');

        if (!targetTable) {
            console.error("CRITICAL: UserSettings table NOT FOUND in public schema.");
            return;
        }

        const tableName = targetTable.table_name;
        console.log(`Target table identified: "${tableName}"`);

        // 3. Check for column again
        const columns: any[] = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${tableName} AND column_name = 'enableAdventure';
    `

        if (columns.length > 0) {
            console.log("Column 'enableAdventure' ALREADY EXISTS.");
        } else {
            console.log(`Adding column to "${tableName}"...`);
            // Use raw query with specific quoting
            await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ADD COLUMN "enableAdventure" BOOLEAN DEFAULT true;`);
            console.log("SUCCESS: Column added.");
        }

    } catch (e: any) {
        console.error("MIGRATION ERROR:", e.message);
    } finally {
        await prisma.$disconnect()
    }
}

main()
