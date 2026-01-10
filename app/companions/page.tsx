import { DashboardLayout } from "@/components/DashboardLayout"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CompanionsClient from "./CompanionsClient"

export default async function CompanionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <DashboardLayout>
            <CompanionsClient />
        </DashboardLayout>
    )
}
