import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
                    const response = await fetch(`${origin}/api/user`, {
                        method: 'POST',
                    })

                    if (!response.ok) {
                        console.error('Failed to create user in database, status:', response.status)
                    }
                } catch (err) {
                    console.error('Error creating user in database:', err)
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
