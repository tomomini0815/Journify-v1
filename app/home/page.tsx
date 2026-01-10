'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function HomeRedirect() {
    const router = useRouter()

    useEffect(() => {
        router.push('/home/editor')
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
    )
}
