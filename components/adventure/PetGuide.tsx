'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Zap, Star, Sparkles, Gem } from 'lucide-react'

interface PetGuideProps {
    isOpen: boolean
    onClose: () => void
}

export function PetGuide({ isOpen, onClose }: PetGuideProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span>📖</span> 遊び方ガイド
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
                        {/* Section 1: Gacha */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                                <Gem size={20} />
                                1. 新しい仲間を召喚しよう
                            </h3>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <p className="mb-2 text-slate-300">
                                    タスクや目標を達成して <span className="text-cyan-400 font-bold">クリスタル💎</span> を集めましょう。
                                    100クリスタルでガチャを回して、新しいペットを仲間にできます！
                                </p>
                                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 ml-2">
                                    <li>ダッシュボードの「召喚」ボタンからガチャ画面へ</li>
                                    <li>既に持っているペットが出た場合は、経験値(EXP)がもらえます</li>
                                    <li>レアリティが高いペットほどステータスが高いかも？</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 2: Care */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                <Heart size={20} />
                                2. お世話をして仲良くなろう
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <span className="text-2xl">🍪</span> ごはん・おやつ
                                    </h4>
                                    <p className="text-sm text-slate-300">
                                        お腹が空くとご機嫌斜めになります。「ごはん」や「おやつ」をあげて、
                                        <span className="text-sky-400"> 幸福度(Love)</span> と
                                        <span className="text-yellow-400"> エネルギー(Zap)</span> を回復しましょう。
                                    </p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <span className="text-2xl">🎾</span> あそぶ
                                    </h4>
                                    <p className="text-sm text-slate-300">
                                        遊ぶと <span className="text-blue-400">経験値(EXP)</span> が貯まりますが、エネルギーを消費します。
                                        なでなですると、少しだけ幸せになります。
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Level Up */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                                <Star size={20} />
                                3. レベルアップと進化
                            </h3>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <p className="mb-2 text-slate-300">
                                    経験値が貯まるとレベルアップ！ステータスが上昇します。
                                    また、特定のレベルに達すると進化するかも…！？
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400 bg-black/20 p-2 rounded-lg">
                                    <Sparkles size={16} className="text-yellow-400" />
                                    <span>ヒント: 毎日ログインしてお世話すると、ボーナスアイテムが貰えるかも？</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 bg-white/5 text-center">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                        >
                            わかった！
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
