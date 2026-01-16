'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from "@/components/DashboardLayout"
import { AdventureGuide } from '@/components/AdventureGuide'
import { HomeEditor } from '@/components/adventure/HomeEditor'
import { DecorationShop } from '@/components/adventure/DecorationShop'
import { CompanionsList } from '@/components/adventure/CompanionsList'
import { CompanionDetailView } from '@/components/adventure/CompanionDetailView'
import { AdventureWorld } from '@/components/adventure/AdventureWorld'
import { Armchair, PawPrint, Store, Gamepad2, Globe2 } from 'lucide-react'

type Tab = 'world' | 'home' | 'companions' | 'shop'

export default function AdventurePage() {
    const [activeTab, setActiveTab] = useState<Tab>('world')
    const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null)

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab)
        // Reset companion selection when changing tabs, unless we want to persist it
        if (tab !== 'companions') {
            setSelectedCompanionId(null)
        }
    }

    const handleCompanionSelect = (id: string | null) => {
        setSelectedCompanionId(id)
    }

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col">
                {/* Adventure Header & Tabs */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto bg-slate-900/50 p-1.5 rounded-2xl border border-white/10">
                        <TabButton
                            active={activeTab === 'world'}
                            onClick={() => handleTabChange('world')}
                            icon={Globe2}
                            label="ワールド"
                        />
                        <TabButton
                            active={activeTab === 'home'}
                            onClick={() => handleTabChange('home')}
                            icon={Armchair}
                            label="マイルーム"
                        />
                        <TabButton
                            active={activeTab === 'companions'}
                            onClick={() => handleTabChange('companions')}
                            icon={PawPrint}
                            label="コンパニオン"
                        />
                        <TabButton
                            active={activeTab === 'shop'}
                            onClick={() => handleTabChange('shop')}
                            icon={Store}
                            label="ショップ"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[600px] relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'world' && (
                            <motion.div
                                key="world"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full"
                            >
                                <AdventureWorld />
                            </motion.div>
                        )}
                        {activeTab === 'home' && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full"
                            >
                                <HomeEditor />
                            </motion.div>
                        )}

                        {activeTab === 'companions' && (
                            <motion.div
                                key="companions"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full pb-20"
                            >
                                {selectedCompanionId ? (
                                    <CompanionDetailView
                                        companionId={selectedCompanionId}
                                        onBack={() => setSelectedCompanionId(null)}
                                    />
                                ) : (
                                    <CompanionsList onSelectCompanion={handleCompanionSelect} />
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'shop' && (
                            <motion.div
                                key="shop"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="h-full"
                            >
                                <DecorationShop />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AdventureGuide />
        </DashboardLayout>
    )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${active
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    )
}
