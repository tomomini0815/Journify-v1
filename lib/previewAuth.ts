export function isPreviewAuthEnabled() {
    return (
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("example.supabase.co") ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "dummy_anon_key"
    )
}

export function getPreviewUser() {
    return { id: "mock-user-123", email: "preview@example.com" }
}
