'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, Heart, ShoppingBag, Home, Sparkles } from 'lucide-react'

export function AdventureGuide() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Floating Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:scale-110 transition-all z-50 group"
            >
                <HelpCircle className="w-6 h-6" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    遊び方を見る
                </span>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Sparkles className="text-amber-400" />
                                        アドベンチャーガイド
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid gap-6">
                                    {/* Section 1: Companions */}
                                    <div className="bg-white/5 rounded-xl p-4 flex gap-4">
                                        <div className="p-3 bg-pink-500/20 rounded-xl h-fit">
                                            <Heart className="w-6 h-6 text-pink-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">1. コンパニオンを育てる</h3>
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                ガチャで仲間を集めましょう。おやつ 🍪 をあげたり、遊んだり ✨ して
                                                <span className="text-pink-400 font-bold"> 幸福度</span> と
                                                <span className="text-blue-400 font-bold"> 経験値</span> を上げましょう。
                                                レベルアップすると特別なボーナスが解放されます！
                                            </p>
                                        </div>
                                    </div>

                                    {/* Section 2: Shop */}
                                    <div className="bg-white/5 rounded-xl p-4 flex gap-4">
                                        <div className="p-3 bg-amber-500/20 rounded-xl h-fit">
                                            <ShoppingBag className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">2. デコレーションを購入</h3>
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                <span className="text-amber-400 font-bold">ショップ</span> でユニークな家具や植物を見つけましょう。
                                                日々のタスクで獲得したコインを使って購入できます。
                                                <em className="block mt-1 text-xs text-white/50">*ベータ版では全アイテム無料です！</em>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Section 3: Home */}
                                    <div className="bg-white/5 rounded-xl p-4 flex gap-4">
                                        <div className="p-3 bg-emerald-500/20 rounded-xl h-fit">
                                            <Home className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">3. ホームをカスタマイズ</h3>
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                <span className="text-emerald-400 font-bold">My Home</span> であなただけの空間を作りましょう。
                                                インベントリからアイテムをドラッグ＆ドロップして配置できます。
                                                レイアウトの保存をお忘れなく！
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors"
                                >
                                    わかった！
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
