'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Loader2, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DecorationCard } from '@/components/DecorationCard'
import { DashboardLayout } from "@/components/DashboardLayout"
import { createClient } from "@/lib/supabase/client"

interface Decoration {
    id: string
    name: string
    category: string
    theme: string
    imageUrl: string
    rarity: string
    price: number
    description: string
}

interface UserDecoration {
    decorationId: string
    quantity: number
}

export default function DecorationShop() {
    const [decorations, setDecorations] = useState<Decoration[]>([])
    const [userDecorations, setUserDecorations] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [buyingId, setBuyingId] = useState<string | null>(null)
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Auth check
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) router.push('/login')
            else fetchData()
        }
        checkUser()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch shop items
            const shopRes = await fetch('/api/decorations')
            const shopData = await shopRes.json()

            // Fetch user inventory to show quantities
            const userRes = await fetch('/api/user/decorations')
            const userData = await userRes.json()

            if (shopData.decorations) setDecorations(shopData.decorations)

            if (userData.decorations) {
                const inventory: Record<string, number> = {}
                userData.decorations.forEach((d: any) => {
                    inventory[d.decorationId] = d.quantity
                })
                setUserDecorations(inventory)
            }
        } catch (error) {
            console.error('Failed to load shop data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBuy = async (decoration: Decoration) => {
        setBuyingId(decoration.id)
        try {
            const res = await fetch('/api/user/decorations/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decorationId: decoration.id })
            })

            if (res.ok) {
                // Update local inventory
                setUserDecorations(prev => ({
                    ...prev,
                    [decoration.id]: (prev[decoration.id] || 0) + 1
                }))
                // Could show a toast here
            }
        } catch (error) {
            console.error('Purchase failed:', error)
        } finally {
            setBuyingId(null)
        }
    }

    const filteredDecorations = decorations.filter(deco => {
        const matchesCategory = filterCategory === 'all' || deco.category === filterCategory
        const matchesSearch = deco.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Store className="w-10 h-10 text-amber-400" />
                            <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                                Decoration Shop
                            </span>
                        </h1>
                        <p className="text-white/60">Customize your space with unique items!</p>
                    </div>

                    {/* Filter & Search */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500/50 w-full sm:w-64"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {['all', 'furniture', 'lighting', 'decoration', 'plant', 'floor'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors ${filterCategory === cat
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-white/5 hover:bg-white/10 text-white/60'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDecorations.map((deco, index) => (
                            <motion.div
                                key={deco.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DecorationCard
                                    decoration={deco}
                                    userQuantity={userDecorations[deco.id] || 0}
                                    onBuy={() => handleBuy(deco)}
                                    isBuying={buyingId === deco.id}
                                />
                            </motion.div>
                        ))}

                        {filteredDecorations.length === 0 && (
                            <div className="col-span-full text-center py-20 text-white/40">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No items found matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
