"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

interface JojoProps {
    userId?: string;
}

export default function Jojo({ userId }: JojoProps) {
    const [message, setMessage] = useState<string | null>(null);
    const [showMessage, setShowMessage] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // 初回メッセージを表示
        const timer = setTimeout(() => {
            fetchMessage();
        }, 2000);

        // 定期的にメッセージを更新
        const interval = setInterval(() => {
            if (!showMessage) {
                fetchMessage();
            }
        }, 300000); // 5分ごと

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const fetchMessage = async () => {
        try {
            const res = await fetch("/api/jojo/message");
            if (res.ok) {
                const data = await res.json();
                setMessage(data.message);
                setShowMessage(true);

                // 10秒後に自動で閉じる
                setTimeout(() => {
                    setShowMessage(false);
                }, 10000);
            }
        } catch (error) {
            console.error("Failed to fetch Jojo message:", error);
        }
    };

    const handleClick = () => {
        if (showMessage) {
            setShowMessage(false);
        } else {
            fetchMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Message Bubble */}
            <AnimatePresence>
                {showMessage && message && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="absolute bottom-20 right-0 mb-2"
                    >
                        <div className="relative max-w-sm">
                            <div className="bg-gradient-to-br from-emerald-500/90 to-teal-500/90 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-emerald-400/20">
                                <button
                                    onClick={() => setShowMessage(false)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{message}</p>
                            </div>
                            {/* Speech bubble tail */}
                            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-emerald-500/90 to-teal-500/90 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Jojo Character */}
            <motion.button
                onClick={handleClick}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                animate={{
                    y: [0, -10, 0],
                    rotate: isHovered ? [0, -5, 5, -5, 0] : 0
                }}
                transition={{
                    y: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    rotate: {
                        duration: 0.5
                    }
                }}
                className="relative group"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                {/* Main character circle */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-emerald-400/50 group-hover:scale-110 transition-transform">
                    {/* Jojo face */}
                    <div className="text-3xl">🤖</div>

                    {/* Sparkle indicator when there's a new message */}
                    {!showMessage && (
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                            className="absolute -top-1 -right-1"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                        </motion.div>
                    )}
                </div>

                {/* Tooltip on hover */}
                <AnimatePresence>
                    {isHovered && !showMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full mb-2 right-0 whitespace-nowrap"
                        >
                            <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                                Jojoに話しかける
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
