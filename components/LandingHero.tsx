"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import MagneticButton from "@/components/MagneticButton"

export default function LandingHero() {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const opacity = useTransform(scrollY, [0, 300], [1, 0])

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] bg-gradient-to-b from-indigo-950/30 via-black to-black pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white/80">AI-Powered Journaling Platform</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 mb-6"
                >
                    AI JOURNALING
                    <br />
                    FOR YOUR LIFE
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed"
                >
                    「書く瞑想」で思考を整理し、AIがあなたのメンタルと成長を可視化。<br className="hidden md:block" />
                    日記、目標、タスク管理をこれひとつで完結させる、<br className="hidden md:block" />
                    次世代のライフマネジメントツールです。
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col md:flex-row items-center gap-4 mb-20"
                >
                    <MagneticButton>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-colors text-lg"
                        >
                            無料で始める
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </MagneticButton>
                    <MagneticButton>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors text-lg backdrop-blur-sm"
                        >
                            ログイン
                        </Link>
                    </MagneticButton>
                </motion.div>

                {/* Hero Image / Dashboard Preview */}
                <motion.div
                    style={{ y: y1, opacity }}
                    initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.4, type: "spring" }}
                    className="relative w-full max-w-6xl -mb-40 perspective-1000"
                >
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/20 bg-[#0f1117]">
                        {/* Browser Chrome (Fake) */}
                        <div className="h-8 bg-[#1a1d24] flex items-center gap-2 px-4 border-b border-white/5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        </div>

                        {/* Captured Screenshot */}
                        <Image
                            src="C:/Users/userv/.gemini/antigravity/brain/4a2fd526-4b66-4247-957e-683971035ecc/dashboard_hero_image_1767510956377.png"
                            alt="Journify Dashboard Preview"
                            width={1920}
                            height={1080}
                            className="w-full h-auto object-cover"
                            priority
                        />

                        {/* Gradient Overlay for blend */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
                    </div>

                    {/* Glow Effect behind */}
                    <div className="absolute -inset-10 bg-gradient-to-t from-indigo-600/20 to-purple-600/20 blur-[60px] -z-10 rounded-full opacity-60" />
                </motion.div>
            </div>
        </section>
    )
}
