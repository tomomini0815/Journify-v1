'use client'

import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { DashboardLayout } from "@/components/DashboardLayout"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { Save, RotateCcw, Plus, X, Move } from 'lucide-react'

// Types
interface PlacedItem {
    id: string // Unique instance ID
    decorationId: string
    x: number
    y: number
    rotation: number
    decoration: {
        name: string
        imageUrl: string
        category: string
    }
}

interface UserDecoration {
    id: string
    decorationId: string
    quantity: number
    decoration: {
        id: string
        name: string
        imageUrl: string
        category: string
    }
}

export default function HomeEditor() {
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([])
    const [inventory, setInventory] = useState<UserDecoration[]>([])
    const [selectedItem, setSelectedItem] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch layout
            const layoutRes = await fetch('/api/user/home/layout')
            const layoutData = await layoutRes.json()
            if (layoutData.layout?.layout?.items) {
                setPlacedItems(layoutData.layout.layout.items)
            }

            // Fetch inventory
            const invRes = await fetch('/api/user/decorations')
            const invData = await invRes.json()
            if (invData.decorations) {
                setInventory(invData.decorations)
            }
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch('/api/user/home/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: placedItems,
                    theme: 'space'
                })
            })
            // Toast success
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setSaving(false)
        }
    }

    const addItem = (idx: number) => {
        const item = inventory[idx]
        const newItem: PlacedItem = {
            id: Math.random().toString(36).substr(2, 9),
            decorationId: item.decorationId,
            x: 50, // Default center
            y: 50,
            rotation: 0,
            decoration: item.decoration
        }
        setPlacedItems([...placedItems, newItem])
    }

    const updateItemPosition = (id: string, x: number, y: number) => {
        setPlacedItems(items => items.map(item =>
            item.id === id ? { ...item, x, y } : item
        ))
    }

    const removeItem = (id: string) => {
        setPlacedItems(items => items.filter(item => item.id !== id))
        setSelectedItem(null)
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-100px)] flex flex-col p-4 gap-4">
                {/* Header */}
                <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl backdrop-blur-md">
                    <h1 className="text-2xl font-bold text-white">Home Editor</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPlacedItems([])}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Clear All"
                        >
                            <RotateCcw size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Layout'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Visual Editor Area */}
                    <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-indigo-900/40 to-slate-900 rounded-2xl border-2 border-white/10 overflow-hidden shadow-2xl">
                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                        />

                        {/* Placed Items */}
                        {placedItems.map((item) => (
                            <motion.div
                                key={item.id}
                                drag
                                dragMomentum={false}
                                onDragEnd={(_, info) => {
                                    // Calculate relative position percentage based on parent container
                                    // This is a simplified approach; ideally use ref to get dimensions
                                    // For now relying on visual drag which Framer handles well
                                }}
                                onClick={() => setSelectedItem(item.id)}
                                className={`absolute cursor-move ${selectedItem === item.id ? 'z-50 ring-2 ring-amber-400' : 'z-10 hover:z-40'}`}
                                style={{
                                    left: item.x, // Initial simplified position
                                    top: item.y
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="relative group">
                                    <div className="text-6xl select-none filter drop-shadow-lg transition-transform hover:scale-110">
                                        {/* Determine emoji/image based on category if URL is not real image */}
                                        {/* In real implementation, this would be <Image /> */}
                                        {item.decoration.imageUrl.startsWith('/images') ? '📦' : item.decoration.imageUrl}
                                    </div>

                                    {selectedItem === item.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeItem(item.id)
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Inventory Sidebar */}
                    <div className="w-80 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto rounded-xl">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-amber-400" />
                            Inventory
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            {inventory.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => addItem(idx)}
                                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all text-center group"
                                >
                                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                        {item.decoration.imageUrl.startsWith('/images') ? '📦' : item.decoration.imageUrl}
                                    </div>
                                    <div className="text-xs truncate text-white/70">{item.decoration.name}</div>
                                    <div className="text-xs text-emerald-400 font-mono mt-1">x{item.quantity}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
