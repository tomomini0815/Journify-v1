"use client"

import { BentoCell, BentoGrid, ContainerScale, ContainerScroll } from "@/components/ui/hero-gallery-scroll-animation"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import MagneticButton from "@/components/MagneticButton"

// Use images from the public folder
const IMAGES = [
    "/images/dashboard_hero.png",
    "/images/dashboard_top.png",
    "/images/dashboard_jojo.png",
    "/images/dashboard_voice.png",
    "/images/journal_page.png",
]

export default function LandingHero() {
    return (
        <ContainerScroll className="h-[300vh] md:h-[350vh] bg-black">
            {/* 1. The Sticky Image Grid (Background) */}
            <BentoGrid className="sticky left-0 top-0 z-0 h-screen w-full p-4 md:p-10 gap-4">
                {IMAGES.map((imageUrl, index) => (
                    <BentoCell
                        key={index}
                        className="overflow-hidden rounded-3xl shadow-2xl border border-white/10 bg-[#0f1117] relative group"
                    >
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                        <img
                            className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                            src={imageUrl}
                            alt={`Journify Feature ${index + 1}`}
                        />
                    </BentoCell>
                ))}
            </BentoGrid>

            {/* 2. The Scrolling Content (Foreground) */}
            <ContainerScale className="relative z-10 text-center flex flex-col items-center justify-center p-6">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8"
                >
                    <img src="/journify-logo.png" alt="Journify" className="h-16 md:h-24 w-auto mx-auto" />
                </motion.div>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white/80">AI-Powered Journaling Platform</span>
                </motion.div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-8 max-w-5xl leading-[1.1]">
                    AI JOURNALING
                    <br />
                    FOR YOUR LIFE
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-2xl text-white/60 max-w-2xl mb-12 leading-relaxed">
                    「書く瞑想」で思考を整理し、AIがあなたのメンタルと成長を可視化。<br className="hidden md:block" />
                    次世代のライフマネジメントツール。
                </p>

                {/* CTAs */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <MagneticButton>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors text-lg"
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
                </div>

            </ContainerScale>
        </ContainerScroll>
    )
}
