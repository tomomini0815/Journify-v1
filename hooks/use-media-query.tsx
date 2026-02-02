import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
    // Initialize as false to match server-side rendering
    // The actual value will be set after hydration
    const [matches, setMatches] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const mediaQuery = matchMedia(query)

        // Set the initial value
        setMatches(mediaQuery.matches)

        function onChange(event: MediaQueryListEvent) {
            setMatches(event.matches)
        }

        mediaQuery.addEventListener("change", onChange)
        return () => mediaQuery.removeEventListener("change", onChange)
    }, [query])

    // Return false during SSR and initial hydration to match server
    // This prevents hydration mismatch
    if (!mounted) return false

    return matches
}
