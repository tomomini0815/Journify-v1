import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const timestamp = new Date().toISOString()
    const results: Record<string, any> = { timestamp }

    try {
        // 1. Supabase REST Direct Ping
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseAnonKey) {
            try {
                const res = await fetch(`${supabaseUrl}/rest/v1/`, {
                    headers: {
                        apikey: supabaseAnonKey,
                        Authorization: `Bearer ${supabaseAnonKey}`,
                    },
                    cache: 'no-store',
                })
                results.supabaseRest = res.ok ? 'success' : `status_${res.status}`
            } catch (err) {
                results.supabaseRest = `error: ${err instanceof Error ? err.message : String(err)}`
            }
        } else {
            results.supabaseRest = 'skipped_no_env'
        }

        // 2. Prisma Database Query Ping
        try {
            const userCount = await prisma.user.count()
            results.databaseQuery = `success_users_${userCount}`
        } catch (err) {
            results.databaseQuery = `fallback_or_offline: ${err instanceof Error ? err.message : String(err)}`
        }

        return NextResponse.json({
            success: true,
            message: 'Supabase keep-alive ping executed successfully',
            details: results,
        })
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Keep-alive ping encountered an error',
                error: error instanceof Error ? error.message : String(error),
                timestamp,
            },
            { status: 500 }
        )
    }
}
