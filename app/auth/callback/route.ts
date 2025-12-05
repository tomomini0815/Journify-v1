import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        try {
            const supabase = await createClient()

            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Error exchanging code for session:', error)
                return NextResponse.redirect(`${origin}/login?error=auth_failed`)
            }

            if (data.session) {
                console.log('Session created successfully for user:', data.user?.email)

                // Ensure user exists in Prisma database
                try {
                    const user = data.user
                    if (user && user.email) {
                        await prisma.user.upsert({
                            where: { id: user.id },
                            update: {
                                email: user.email,
                                name: user.user_metadata?.name || null,
                                avatarUrl: user.user_metadata?.avatar_url || null,
                            },
                            create: {
                                id: user.id,
                                email: user.email,
                                name: user.user_metadata?.name || null,
                                avatarUrl: user.user_metadata?.avatar_url || null,
                            }
                        })
                        console.log('User synced to database:', user.id)
                    }
                } catch (err) {
                    console.error('Error syncing user to database:', err)
                    // Continue anyway - user is authenticated in Supabase
                }

                // Redirect to dashboard
                return NextResponse.redirect(`${origin}/dashboard`)
            }
        } catch (err) {
            console.error('Unexpected error in auth callback:', err)
            return NextResponse.redirect(`${origin}/login?error=unexpected`)
        }
    }

    // No code provided
    return NextResponse.redirect(`${origin}/login?error=no_code`)
}
