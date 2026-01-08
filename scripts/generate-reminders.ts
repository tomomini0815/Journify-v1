/**
 * Reminder Generation Script
 * 
 * このスクリプトは、期日が近いまたは過ぎた目標・タスクに対して通知を生成します。
 * 
 * 実行方法:
 * - 開発環境: npx tsx scripts/generate-reminders.ts
 * - 本番環境: Vercel Cron Jobs で自動実行
 */

async function generateReminders() {
    try {
        console.log('Starting reminder generation...')

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to generate reminders:', errorText)
            process.exit(1)
        }

        const result = await response.json()
        console.log('Reminders generated successfully:', result)
        console.log(`Created ${result.createdCount} notifications`)
    } catch (error) {
        console.error('Error generating reminders:', error)
        process.exit(1)
    }
}

generateReminders()
