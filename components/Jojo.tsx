"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Mic, Volume2 } from "lucide-react";

interface JojoProps {
    userId?: string;
}

export default function Jojo({ userId }: JojoProps) {
    const [message, setMessage] = useState<string | null>(null);
    const [showMessage, setShowMessage] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        // 初回メッセージを表示
        const timer = setTimeout(() => {
            fetchMessage();
        }, 2000);

        // 定期的にメッセージを更新
        const interval = setInterval(() => {
            if (!showMessage && !isSpeaking) {
                fetchMessage();
            }
        }, 300000); // 5分ごと

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            window.speechSynthesis.cancel();
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
                    if (!isSpeaking) setShowMessage(false);
                }, 10000);
            }
        } catch (error) {
            console.error("Failed to fetch Jojo message:", error);
        }
    };

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.2; // 少し早口でエネルギッシュに
        utterance.pitch = 1.1; // 少し高めで

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const handleClick = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (showMessage) {
            setShowMessage(false);
        } else {
            fetchMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center">
            <AnimatePresence>
                {showMessage && message && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.8 }}
                        className="absolute bottom-0 right-20 mb-2"
                    >
                        <div className="relative w-[70vw] max-w-sm md:w-80">
                            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-emerald-500/40">
                                <button
                                    onClick={() => setShowMessage(false)}
                                    className="absolute -top-2 -left-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors shadow-lg"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <div className="text-white">
                                    {message.split('\n').map((line, index) => (
                                        <p
                                            key={index}
                                            className={index === 0
                                                ? "font-medium text-base leading-relaxed tracking-wide mb-2"
                                                : "font-normal text-sm opacity-90"
                                            }
                                        >
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            {/* Speech bubble tail - pointing right to Jojo */}
                            <div className="absolute bottom-6 -right-2 w-4 h-4 bg-slate-900/80 rotate-45 border-r border-t border-emerald-500/40" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Controls Container */}
            <div className="flex items-center gap-3 relative">

                {/* Jojo Character */}
                <motion.button
                    onClick={handleClick}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    animate={{
                        y: [0, -10, 0],
                        rotate: isHovered ? [0, -5, 5, -5, 0] : 0,
                        scale: isSpeaking ? [1, 1.1, 1] : 1
                    }}
                    transition={{
                        y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        },
                        rotate: { duration: 0.5 },
                        scale: { duration: 0.3, repeat: isSpeaking ? Infinity : 0 }
                    }}
                    className="relative group"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

                    {/* Main character circle */}
                    <div className="relative w-16 h-16 bg-slate-800/90 rounded-full flex items-center justify-center shadow-2xl border border-white/10 group-hover:scale-110 transition-transform cursor-pointer">
                        {/* Jojo face */}
                        <div className="text-3xl">
                            {isSpeaking ? "🗣️" : "🤖"}
                        </div>

                        {/* Sparkle indicator when there's a new message (silent mode) */}
                        {!showMessage && !isSpeaking && (
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
                                    Jojoに話しかける / クリック
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
}
