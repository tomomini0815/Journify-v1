import { DashboardLayout } from "@/components/DashboardLayout"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CompanionsClient from "./CompanionsClient"
import { isPreviewAuthEnabled } from "@/lib/previewAuth"

export default async function CompanionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isPreviewAuthEnabled()) {
        redirect('/login')
    }

    return (
        <DashboardLayout>
            <CompanionsClient />
        </DashboardLayout>
    )
}
