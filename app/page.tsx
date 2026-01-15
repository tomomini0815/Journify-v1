"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, MotionValue } from "framer-motion"
import { ArrowUpRight, Menu, CheckCircle2, Calendar, BarChart3 } from "lucide-react"
import CustomCursor from "@/components/CustomCursor"
import MagneticButton from "@/components/MagneticButton"
import { useMediaQuery } from "@/hooks/use-media-query"

// Dynamic import for 3D gallery to avoid SSR issues
const InfiniteGallery = dynamic(() => import("@/components/ui/3d-gallery-photography"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-black flex items-center justify-center"><p className="text-white">Loading gallery...</p></div>
})

import { GradientLampEffects } from "@/components/ui/gradient-lamp"

const useParallax = (value: MotionValue<number>, distance: number) => {
  return useTransform(value, [0, 1], [-distance, distance])
}

export default function LandingPage() {
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [touchedImages, setTouchedImages] = useState<Set<string>>(new Set())
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleImageTouch = (imageId: string) => {
    setTouchedImages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(imageId)) {
        newSet.delete(imageId)
      } else {
        newSet.add(imageId)
      }
      return newSet
    })
  }

  useEffect(() => {
    const checkUser = async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        window.location.href = "/dashboard"
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const sCurveRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sCurveRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { damping: 20 })

  const heroRef = useRef(null)
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroTextOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0])

  // S-Curve animations
  const x1 = useTransform(smoothProgress, [0.05, 0.25], ["-50%", "0%"])
  const scale1 = useTransform(smoothProgress, [0.05, 0.12, 0.25], [0.8, 1.6, 0.8])

  const x2 = useTransform(smoothProgress, [0.20, 0.40], ["50%", "0%"])
  const scale2 = useTransform(smoothProgress, [0.20, 0.27, 0.40], [0.8, 1.5, 0.8])

  const x3 = useTransform(smoothProgress, [0.35, 0.55], ["-50%", "0%"])
  const scale3 = useTransform(smoothProgress, [0.35, 0.42, 0.55], [0.8, 1.6, 0.8])

  const x4 = useTransform(smoothProgress, [0.50, 0.70], ["50%", "0%"])
  const scale4 = useTransform(smoothProgress, [0.50, 0.57, 0.70], [0.8, 1.5, 0.8])

  const x5 = useTransform(smoothProgress, [0.65, 0.85], ["-50%", "0%"])
  const scale5 = useTransform(smoothProgress, [0.65, 0.72, 0.85], [0.8, 1.6, 0.8])

  const x6 = useTransform(smoothProgress, [0.80, 1.0], ["50%", "0%"])
  const scale6 = useTransform(smoothProgress, [0.80, 0.87, 1.0], [0.8, 1.5, 0.8])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Pre-calculate parallax and background transforms to follow Rules of Hooks
  const bgSunriseOpacity = useTransform(scrollYProgress, [0, 0.05, 0.2], [0.5, 0.5, 0])
  const bgDaytimeOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.55], [0, 0.7, 0.5])
  const bgSunsetOpacity = useTransform(scrollYProgress, [0.5, 0.65, 0.85], [0, 0.7, 0.3])
  const bgSpaceOpacity = useTransform(scrollYProgress, [0.8, 0.95, 1], [0, 0.7, 0.7])
  const starsOpacity = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 0.8, 1])
  const shootingStarsOpacity = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1])

  const partyX = useParallax(mouseX, -20)
  const partyY = useParallax(mouseY, -20)
  const jetX = useParallax(mouseX, 30)
  const jetY = useParallax(mouseY, 10)
  const dealX = useParallax(mouseX, 15)
  const dealY = useParallax(mouseY, -15)
  const beachX = useParallax(mouseX, -25)
  const beachY = useParallax(mouseY, 25)
  const familyX = useParallax(mouseX, -40)
  const familyY = useParallax(mouseY, 10)
  const horizonX = useParallax(mouseX, 40)
  const horizonY = useParallax(mouseY, -30)
  const homeX = useParallax(mouseX, 0)
  const homeY = useParallax(mouseY, 50)

  return (
    <>
      <CustomCursor />

      <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              className="text-6xl md:text-9xl font-bold tracking-tighter text-white"
            >
              JOURNIFY
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background: Real Sunrise → Daytime → Sunset → Space */}
      <div className="fixed inset-0 -z-10 bg-black">
        {/* Sunrise Image - Hero Section Only */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: bgSunriseOpacity,
            backgroundImage: 'url("https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Daytime Sky - Body Section Start */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: bgDaytimeOpacity,
            backgroundImage: 'url("https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Sunset Image - Body Section End */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: bgSunsetOpacity,
            backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Space/Galaxy Image - Footer Only */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: bgSpaceOpacity,
            backgroundImage: 'url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Dark overlay to keep it subtle */}
        <div className="absolute inset-0 bg-black/60" />
      </div>


      {/* Twinkling Stars for space section */}
      {mounted && (
        <motion.div
          className="fixed inset-0 -z-5 pointer-events-none"
          style={{
            opacity: starsOpacity
          }}
        >
          {[...Array(150)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 2 + 0.5 + 'px',
                height: Math.random() * 2 + 0.5 + 'px',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
              animate={{
                opacity: [Math.random() * 0.3, Math.random() * 0.9, Math.random() * 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Shooting Stars for space section */}
      {mounted && (
        <motion.div
          className="fixed inset-0 -z-5 pointer-events-none overflow-hidden"
          style={{
            opacity: shootingStarsOpacity
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`shooting-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 30}%`,
                top: `${Math.random() * 50}%`,
                boxShadow: '0 0 4px 2px rgba(255, 255, 255, 0.8)',
              }}
              animate={{
                x: [0, 300],
                y: [0, 150],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 8 + 4,
                delay: Math.random() * 5,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}

      <div ref={containerRef} className="relative text-[#e1e1e1] selection:bg-white selection:text-black overflow-x-hidden">

        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-8 py-6 mix-blend-difference">
          <MagneticButton>
            <img src="/journify-logo.png" alt="Journify" className="h-12 md:h-14 w-auto cursor-pointer" />
          </MagneticButton>

          <div className="flex items-center gap-4 md:gap-8 text-sm font-medium tracking-wide">
            <MagneticButton>
              <Link href="/login" className="hover:underline underline-offset-4 cursor-none">LOGIN</Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/signup" className="px-3 md:px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors cursor-none text-xs md:text-sm">
                GET STARTED
              </Link>
            </MagneticButton>
          </div>
        </nav>

        {/* Hero Section - 3D Aspirational Gallery with Gradient Lamp Effects */}
        <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-black">
          <InfiniteGallery
            images={[
              { src: "/images/aspirations/success_entrepreneur_1767788052439.png", alt: "Successful Entrepreneur" },
              { src: "/images/aspirations/asian_entrepreneur.png", alt: "Asian Entrepreneur Success" },
              { src: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=1200&q=80", alt: "Asian Creative" },
              { src: "/images/aspirations/fitness_achievement_1767788069659.png", alt: "Fitness Achievement" },
              { src: "/images/aspirations/asian_zen_journaling.png", alt: "Asian Zen Journaling" },
              { src: "/images/aspirations/family_happiness_1767788085723.png", alt: "Family Happiness" },
              { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80", alt: "Asian Students" },
              { src: "/images/aspirations/travel_adventure_1767788105321.png", alt: "Travel Adventure" },
              { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80", alt: "Collaboration" },
              { src: "/images/aspirations/creative_studio_1767788121462.png", alt: "Creative Studio" },
              { src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80", alt: "Asian Tech Engineering" },
              { src: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1200&q=80", alt: "Asian Wellness" },
              { src: "/images/aspirations/luxury_home_1767788139176.png", alt: "Luxury Home" },
              { src: "/images/aspirations/graduation_success_1767788154942.png", alt: "Graduation Success" },
              { src: "/images/aspirations/meditation_peace_1767788170234.png", alt: "Meditation & Peace" },
              { src: "/images/aspirations/business_presentation_1767788187422.png", alt: "Business Presentation" },
              { src: "/images/aspirations/beach_relaxation_1767788206154.png", alt: "Beach Relaxation" },
              { src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80", alt: "Asian Family Home" },
              { src: "/images/aspirations/romantic_dinner_1767788222875.png", alt: "Romantic Dinner" },
              { src: "/images/aspirations/tech_innovation_1767788240263.png", alt: "Tech Innovation" },
              { src: "/images/aspirations/garden_sanctuary_1767788256210.png", alt: "Garden Sanctuary" },
              { src: "/images/aspirations/sports_victory_1767788275979.png", alt: "Sports Victory" },
              { src: "/images/aspirations/music_performance_1767788293706.png", alt: "Music Performance" },
              { src: "/images/success/success_4.png", alt: "達成の瞬間" },
              { src: "/images/success/success_5.png", alt: "心の平和と成功" },
              { src: "/images/success/success_11.png", alt: "家族の幸せ" },
            ]}
            speed={1.0}
            visibleCount={16}
            className="h-screen w-full rounded-lg overflow-hidden"
          />

          {/* Gradient Lamp Effects Layer */}
          <GradientLampEffects className="z-5 opacity-60" />

          <motion.div
            style={{ opacity: heroTextOpacity }}
            className="h-screen inset-0 pointer-events-none absolute flex flex-col items-center justify-center pb-20 md:pb-32 text-center px-4 mix-blend-exclusion text-white z-10"
          >
            <div className="flex flex-col items-center gap-12 md:gap-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-black/20 backdrop-blur-[2px] p-8 md:p-12 rounded-[40px] border border-white/5"
              >
                <h1 className="font-serif text-6xl md:text-9xl tracking-tighter mb-4 drop-shadow-2xl">
                  <span className="italic">Journify</span>
                </h1>
                <div className="max-w-xl mx-auto space-y-6">
                  <p className="text-lg md:text-2xl font-light tracking-[0.2em] text-white drop-shadow-lg uppercase">
                    AIで加速する、書く瞑想と音声ジャーナル
                  </p>
                  <p className="text-lg md:text-2xl text-white/90 leading-relaxed tracking-[0.2em] px-4 drop-shadow-md font-light">
                    ジャーナリングは、思考を整理し、自分自身を深く知るためのパワフルな習慣です。<br className="hidden md:block" />
                    JournifyはAIの力であなたの「書く言葉」と「話す声」を成長の糧へと変え、理想の未来への歩みをサポートします。
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="pointer-events-auto"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <MagneticButton>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors text-lg cursor-none shadow-xl"
                    >
                      無料で始める
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-medium hover:bg-white/20 transition-colors text-lg backdrop-blur-md cursor-none"
                    >
                      ログイン
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="text-center absolute bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold text-white/60 pointer-events-none">
            <p>Use mouse wheel, arrow keys, or touch to navigate</p>
            <p className="opacity-60">
              Auto-play resumes after 3 seconds of inactivity
            </p>
          </div>
        </section>

        {/* Features Section - Moved after Hero */}
        <section className="relative py-24 md:py-32 px-6 bg-black/40 backdrop-blur-sm border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
                主な機能
              </h2>
              <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto">
                日々の記録から目標達成まで、あなたの成長をサポートする統合プラットフォーム
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Journal Feature */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <MagneticButton className="w-full">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl hover:border-violet-500/50 transition-all cursor-none h-full text-left">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-violet-500/20 rounded-2xl text-violet-400">
                        <BarChart3 className="w-8 h-8" />
                      </div>
                      <h3 className="text-[20px] md:text-[24px] font-bold group-hover:text-violet-400 transition-colors">
                        ジャーナル
                      </h3>
                    </div>
                    <ul className="space-y-3 text-white/70 text-lg">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                        <span>リッチテキストエディタで自由な記述</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                        <span>気分・エネルギー・ストレス・睡眠を5段階評価</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                        <span>タグ付けによる分類と検索</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                        <span>日々の活動記録（運動、社交、趣味など）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                        <span>音声ジャーナルの自動文字起こしと要約</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
                        <span>AIによる思考のマインドマップ自動生成</span>
                      </li>
                    </ul>
                  </div>
                </MagneticButton>
              </motion.div>

              {/* Goals Feature */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <MagneticButton className="w-full">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl hover:border-emerald-500/50 transition-all cursor-none h-full text-left">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-[20px] md:text-[24px] font-bold group-hover:text-emerald-400 transition-colors">
                        目標管理
                      </h3>
                    </div>
                    <ul className="space-y-3 text-white/70 text-lg">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>進捗を10%刻みで更新可能</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>優先度設定（高・中・低）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>目標達成率の可視化</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>期日設定とリマインダー</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>カテゴリー別の目標整理</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                        <span>達成時の自動お祝いメッセージ</span>
                      </li>
                    </ul>
                  </div>
                </MagneticButton>
              </motion.div>

              {/* Tasks Feature */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="group"
              >
                <MagneticButton className="w-full">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl hover:border-blue-500/50 transition-all cursor-none h-full text-left">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-[20px] md:text-[24px] font-bold group-hover:text-blue-400 transition-colors">
                        タスク管理
                      </h3>
                    </div>
                    <ul className="space-y-3 text-white/70 text-lg">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <span>日々のタスクとプロジェクト紐付けタスク</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <span>完了状態の追跡</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <span>スケジュール設定（開始日・終了日）</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <span>タスクごとのカラー設定（10色）</span>
                      </li>
                    </ul>
                  </div>
                </MagneticButton>
              </motion.div>

              {/* Projects Feature */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="group"
              >
                <MagneticButton className="w-full">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl hover:border-amber-500/50 transition-all cursor-none h-full text-left">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <h3 className="text-[20px] md:text-[24px] font-bold group-hover:text-amber-400 transition-colors">
                        プロジェクト管理
                      </h3>
                    </div>
                    <ul className="space-y-3 text-white/70 text-lg">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <span>ガントチャート風タイムラインビュー</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <span>マイルストーン設定</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <span>日本の祝日表示対応</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                        <span>プロジェクトステータス管理</span>
                      </li>
                    </ul>
                  </div>
                </MagneticButton>
              </motion.div>

              {/* Dashboard Feature */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="group md:col-span-2"
              >
                <MagneticButton className="w-full">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl hover:border-indigo-500/50 transition-all cursor-none text-left">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                        <BarChart3 className="w-8 h-8" />
                      </div>
                      <h3 className="text-[20px] md:text-[24px] font-bold group-hover:text-indigo-400 transition-colors">
                        ダッシュボード & 分析
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-3 text-white/70 text-lg">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                          <span>統計情報の可視化（ジャーナル数、連続記録日数）</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                          <span>気分の推移グラフ</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                          <span>ライフバランスチャート</span>
                        </li>
                      </ul>
                      <ul className="space-y-3 text-white/70 text-lg">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                          <span>最近のジャーナルと目標進捗の一覧</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                          <span>ビジョンボード（画像、夢、アファメーション）</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                          <span>未来の自分への手紙機能</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </MagneticButton>
              </motion.div>
            </div>
          </div>
        </section>

        <section ref={sCurveRef} className="relative min-h-[400vh] py-20 md:py-40 overflow-hidden">

          <div className="h-[60vh] md:h-[80vh] flex items-center justify-center relative">
            <motion.div
              style={{ x: isMobile ? 0 : x1, scale: scale1 }}
              className="relative w-[80vw] md:w-[40vw] h-[40vh] md:h-[50vh] z-0 group cursor-none"
              onTouchStart={() => isMobile && handleImageTouch('scurve-home1')}
            >
              <Image src="/images/home.png" alt="Luxury Home" fill className={`object-cover rounded-3xl shadow-2xl ${touchedImages.has('scurve-home1') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
            </motion.div>
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute top-1/4 left-5 md:left-1/4 text-3xl md:text-6xl font-bold text-white z-20 whitespace-nowrap pointer-events-none mix-blend-difference"
            >
              COMFORT & PEACE
            </motion.div>
          </div>

          <div className="h-[40vh] md:h-[60vh] flex items-center justify-center relative">
            <motion.div style={{ x: isMobile ? 0 : x2, scale: scale2 }} className="relative z-20 max-w-xl px-6">
              <MagneticButton className="w-full">
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl hover:border-violet-500/50 transition-colors cursor-none text-left">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-400">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <h4 className="text-[20px] md:text-[24px] font-medium group-hover:text-violet-400 transition-colors">Smart Analysis</h4>
                    </div>
                    <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base md:text-lg text-white/60">AIがあなたの感情パターンを分析し、隠れた傾向を明らかにします。</p>
                </div>
              </MagneticButton>
            </motion.div>
          </div>

          <div className="h-[60vh] md:h-[80vh] flex items-center justify-center relative">
            <motion.div
              style={{ x: isMobile ? 0 : x3, scale: scale3 }}
              className="relative w-[80vw] md:w-[40vw] h-[40vh] md:h-[50vh] z-0 group cursor-none"
              onTouchStart={() => isMobile && handleImageTouch('scurve-party')}
            >
              <Image src="/images/japanese_celebration.png" alt="Celebration" fill className={`object-cover rounded-3xl shadow-2xl ${touchedImages.has('scurve-party') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
            </motion.div>
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-5 md:right-1/4 text-3xl md:text-6xl font-bold text-white z-20 whitespace-nowrap pointer-events-none mix-blend-difference"
            >
              JOY & CELEBRATION
            </motion.div>
          </div>

          <div className="h-[40vh] md:h-[60vh] flex items-center justify-center relative">
            <motion.div style={{ x: isMobile ? 0 : x4, scale: scale4 }} className="relative z-20 max-w-xl px-6">
              <MagneticButton className="w-full">
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl hover:border-violet-500/50 transition-colors cursor-none text-left">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-[20px] md:text-[24px] font-medium group-hover:text-emerald-400 transition-colors">Goal Tracking</h4>
                    </div>
                    <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base md:text-lg text-white/60">大きな夢を、日々の実行可能なステップに分解します。</p>
                </div>
              </MagneticButton>
            </motion.div>
          </div>

          <div className="h-[60vh] md:h-[80vh] flex items-center justify-center relative">
            <motion.div
              style={{ x: isMobile ? 0 : x5, scale: scale5 }}
              className="relative w-[80vw] md:w-[40vw] h-[40vh] md:h-[50vh] z-0 group cursor-none"
              onTouchStart={() => isMobile && handleImageTouch('scurve-beach')}
            >
              <Image src="/images/beach.png" alt="Beach" fill className={`object-cover rounded-3xl shadow-2xl ${touchedImages.has('scurve-beach') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
            </motion.div>
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, 40, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-1/3 right-5 md:right-1/3 text-3xl md:text-6xl font-bold text-white z-20 whitespace-nowrap pointer-events-none mix-blend-difference"
            >
              FREEDOM & DISCOVERY
            </motion.div>
          </div>

          <div className="h-[40vh] md:h-[60vh] flex items-center justify-center relative">
            <motion.div style={{ x: isMobile ? 0 : x6, scale: scale6 }} className="relative z-20 max-w-xl px-6">
              <MagneticButton className="w-full">
                <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl hover:border-violet-500/50 transition-colors cursor-none text-left">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h4 className="text-[20px] md:text-[24px] font-medium group-hover:text-blue-400 transition-colors">Calendar Sync</h4>
                    </div>
                    <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base md:text-lg text-white/60">Google、Outlook、Appleカレンダーとシームレスに連携します。</p>
                </div>
              </MagneticButton>
            </motion.div>
          </div>

        </section>

        {/* Final Message Section */}
        <section className="relative py-32 md:py-48 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white md:whitespace-nowrap">
              あなたの物語は、<br className="md:hidden" />今日から始まる
            </h2>
            <p className="text-lg md:text-2xl text-white/70 mb-12 leading-relaxed">
              一歩ずつ、確実に。<br />
              あなたの夢を現実に変える旅を、<br className="md:hidden" />
              今ここから始めましょう。
            </p>
            <MagneticButton>
              <Link
                href="/signup"
                className="inline-block px-8 md:px-12 py-4 md:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/30 text-white text-lg md:text-xl font-medium rounded-full transition-all cursor-none"
              >
                無料で始める
              </Link>
            </MagneticButton>
          </motion.div>
        </section>

        <footer className="py-12 md:py-20 px-6 md:px-8 border-t border-white/10 text-center">
          <h2 className="text-[15vw] font-bold tracking-tighter leading-none opacity-10 select-none pointer-events-none">
            JOURNIFY
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-10 text-xs md:text-sm text-white/40">
            <p>&copy; 2025 Journify.</p>
            <div className="flex gap-6 md:gap-8 mt-4 md:mt-0">
              <MagneticButton><Link href="#" className="hover:text-white transition-colors cursor-none">Twitter</Link></MagneticButton>
              <MagneticButton><Link href="#" className="hover:text-white transition-colors cursor-none">Instagram</Link></MagneticButton>
              <MagneticButton><Link href="#" className="hover:text-white transition-colors cursor-none">LinkedIn</Link></MagneticButton>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
