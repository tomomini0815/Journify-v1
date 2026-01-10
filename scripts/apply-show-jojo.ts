import prisma from '../lib/prisma'

async function main() {
    try {
        console.log('Attempting to add showJojo column...')

        // Execute raw SQL to add the column
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "UserSettings" 
            ADD COLUMN IF NOT EXISTS "showJojo" BOOLEAN NOT NULL DEFAULT true;
        `)

        console.log('✓ Successfully added showJojo column')

        // Verify the column exists
        const result = await prisma.$queryRawUnsafe(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'UserSettings' AND column_name = 'showJojo';
        `)

        console.log('Column info:', result)

    } catch (error: any) {
        console.error('Error:', error.message)
        if (error.message.includes('already exists')) {
            console.log('Column already exists, skipping...')
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
