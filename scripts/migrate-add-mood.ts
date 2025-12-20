import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function addMoodColumn() {
    try {
        console.log('Adding mood column to VoiceJournal table...');

        // Execute the migration SQL
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "VoiceJournal" 
            ADD COLUMN IF NOT EXISTS "mood" INTEGER;
        `);

        console.log('✅ Successfully added mood column to VoiceJournal table');
        console.log('   - Column: mood');
        console.log('   - Type: INTEGER (nullable)');
        console.log('   - Purpose: Store user mood rating (1-10 scale)');

    } catch (error) {
        console.error('❌ Error adding mood column:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

addMoodColumn()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    });
