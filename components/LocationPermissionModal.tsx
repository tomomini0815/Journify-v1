"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationPermissionModalProps {
    isOpen: boolean
    onClose: () => void
    onAllow: () => void
}

export function LocationPermissionModal({ isOpen, onClose, onAllow }: LocationPermissionModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative overflow-hidden max-h-[85vh] overflow-y-auto">
                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                    <MapPin className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-3">位置情報の利用について</h2>
                                    <p className="text-white/60 leading-relaxed">
                                        あなたの現在地周辺の天気情報を表示するために、<br />
                                        位置情報を利用します。<br />
                                        許可していただけますか？
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={onAllow}
                                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl text-lg font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                                    >
                                        許可する
                                    </Button>
                                    <Button
                                        onClick={onClose}
                                        variant="ghost"
                                        className="w-full h-12 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        今はしない
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
