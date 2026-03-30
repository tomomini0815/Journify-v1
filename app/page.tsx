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
import FloatingParticles from "@/components/FloatingParticles"
import GlowingOrb from "@/components/GlowingOrb"

// Dynamic import for 3D gallery to avoid SSR issues
const InfiniteGallery = dynamic(() => import("@/components/ui/3d-gallery-photography"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-black flex items-center justify-center"><p className="text-white">Loading gallery...</p></div>
})

import { GradientLampEffects } from "@/components/ui/gradient-lamp"
import { CyberneticBentoGrid } from "@/components/ui/cybernetic-bento-grid"

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
  const x1 = useTransform(smoothProgress, [0.05, 0.25], isMobile ? ["0%", "0%"] : ["-25%", "0%"], { clamp: true })
  const scale1 = useTransform(smoothProgress, [0.05, 0.12, 0.25], isMobile ? [0.92, 1.0, 0.95] : [1.0, 1.15, 0.9], { clamp: true })

  const x2 = useTransform(smoothProgress, [0.20, 0.40], isMobile ? ["0%", "0%"] : ["25%", "0%"], { clamp: true })
  const scale2 = useTransform(smoothProgress, [0.20, 0.27, 0.40], isMobile ? [0.92, 1.0, 0.95] : [1.0, 1.15, 0.9], { clamp: true })

  const x3 = useTransform(smoothProgress, [0.35, 0.55], isMobile ? ["0%", "0%"] : ["-25%", "0%"], { clamp: true })
  const scale3 = useTransform(smoothProgress, [0.35, 0.42, 0.55], isMobile ? [0.92, 1.0, 0.95] : [1.0, 1.15, 0.9], { clamp: true })

  const x4 = useTransform(smoothProgress, [0.50, 0.70], isMobile ? ["0%", "0%"] : ["25%", "0%"], { clamp: true })
  const scale4 = useTransform(smoothProgress, [0.50, 0.57, 0.70], isMobile ? [0.92, 1.0, 0.95] : [1.0, 1.15, 0.9], { clamp: true })

  const x5 = useTransform(smoothProgress, [0.65, 0.85], isMobile ? ["0%", "0%"] : ["-25%", "0%"], { clamp: true })
  const scale5 = useTransform(smoothProgress, [0.65, 0.72, 0.85], isMobile ? [0.92, 1.0, 0.95] : [1.0, 1.15, 0.9], { clamp: true })

  const x6 = useTransform(smoothProgress, [0.80, 1.0], isMobile ? ["0%", "0%"] : ["25%", "0%"], { clamp: true })
  const scale6 = useTransform(smoothProgress, [0.80, 0.87, 1.0], isMobile ? [0.92, 1.0, 0.95] : [1.0, 1.15, 0.9], { clamp: true })

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
    <div className="relative w-full overflow-x-hidden">
      <CustomCursor />

      {/* Floating Particles Effect */}
      <FloatingParticles count={60} className="z-[5] opacity-60" />

      {/* Glowing Orbs for ambient lighting */}
      <GlowingOrb className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 z-[3]" color1="#10b981" color2="#06b6d4" size={500} />
      <GlowingOrb className="bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 z-[3]" color1="#8b5cf6" color2="#ec4899" size={400} />

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
          {/* Large Shooting Stars */}
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={`large-shooting-${i}`}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 40}%`,
                top: `${Math.random() * 40}%`,
                boxShadow: '0 0 10px 4px rgba(255, 255, 255, 0.9)',
              }}
              animate={{
                x: [0, 600],
                y: [0, 300],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 10 + 10,
                delay: Math.random() * 10,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      )}



      <div ref={containerRef} className="relative text-[#e1e1e1] selection:bg-white selection:text-black overflow-x-hidden">

        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 py-6 mix-blend-difference">
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
            isMobile={isMobile}
          />

          {/* Gradient Lamp Effects Layer */}
          <GradientLampEffects className="z-5 opacity-60" />

          <motion.div
            style={{ opacity: heroTextOpacity }}
            className="h-screen inset-0 pointer-events-none absolute flex flex-col items-center justify-center pb-12 md:pb-20 text-center px-4 text-white z-10"
          >
            <div className="flex flex-col items-center gap-8 md:gap-16 mix-blend-exclusion">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="relative bg-black/60 backdrop-blur-md p-6 md:p-10 rounded-[32px] border border-white/10 max-w-4xl pointer-events-auto group cursor-pointer transition-all duration-500 mix-blend-normal"
              >
                {/* Large circular background on hover */}


                <h1 className="font-serif text-5xl md:text-8xl tracking-tighter mb-3 drop-shadow-2xl transition-all duration-500 group-hover:text-white relative">
                  <span className="italic bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent animate-pulse px-2 py-1">Journify</span>
                </h1>
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-xl md:text-3xl font-light tracking-[0.15em] text-white drop-shadow-lg uppercase transition-all duration-500 group-hover:text-white">
                    書く瞑想と音声ジャーナル
                  </p>
                  <p className="text-sm md:text-lg text-white/90 leading-relaxed tracking-[0.1em] px-2 drop-shadow-md font-light transition-all duration-500 group-hover:text-white">
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
                <div className="flex flex-row items-center justify-center gap-4 md:gap-6 w-full">
                  <MagneticButton>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-5 md:px-8 py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-bold hover:from-emerald-600 hover:to-cyan-600 hover:scale-105 transition-all duration-300 text-sm md:text-lg cursor-none shadow-xl shadow-emerald-500/25 whitespace-nowrap"
                    >
                      無料で始める
                      <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 px-5 md:px-8 py-3 md:py-4 bg-white/10 text-white border border-white/20 rounded-full font-medium hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-300 text-sm md:text-lg backdrop-blur-md cursor-none whitespace-nowrap"
                    >
                      ログイン
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </motion.div>


        </section>

        {/* Features Section - Cybernetic Bento Grid */}
        <section id="features" className="relative bg-[#030712] overflow-hidden">
          <CyberneticBentoGrid />
        </section>
        <section ref={sCurveRef} className="relative min-h-[300vh] py-12 md:py-24 overflow-hidden">

          {/* ── Section Intro ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-24 px-6 relative z-20"
          >
            <p className="text-white/40 text-sm md:text-base tracking-[0.25em] uppercase mb-4 font-light">The Journey Begins</p>
            <h2 className="text-[28px] md:text-[42px] font-bold text-white mb-5 tracking-tight leading-tight">
              あなたの成長を、<br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">見える化する</span>
            </h2>
            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto leading-relaxed font-light">
              日々の記録が、やがて大きな物語になる。<br className="hidden md:block" />
              Journifyはその一歩一歩に寄り添います。
            </p>
          </motion.div>

          {/* ── Panel 1: Image – 安らぎ ── */}
          <div className="h-[50vh] md:h-[60vh] w-full px-4 relative">
            <div className="h-full w-full relative flex items-center justify-center">
              <motion.div
                style={{ x: isMobile ? 0 : x1, scale: scale1 }}
                className="relative w-full md:w-[42vw] h-[42vh] md:h-[52vh] z-0 group cursor-none overflow-hidden rounded-3xl shadow-2xl"
                onTouchStart={() => isMobile && handleImageTouch('scurve-home1')}
              >
                <Image src="/images/home.png" alt="Luxury Home" fill className={`object-cover ${touchedImages.has('scurve-home1') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-white/90 text-sm md:text-base font-light">心が落ち着く場所で、自分と向き合う時間を</p>
                </div>
              </motion.div>
              <motion.div
                animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute top-1/4 left-0 md:left-[10%] z-20 px-6 max-w-[80vw] md:max-w-none pointer-events-none mix-blend-difference"
              >
                <span className="text-2xl md:text-6xl font-bold text-white tracking-tight">COMFORT & PEACE</span>
                <p className="text-white/40 text-[10px] md:text-xs mt-1.5 tracking-[0.2em] uppercase font-light">安らぎと平穏</p>
              </motion.div>
            </div>
          </div>

          {/* ── Card 1: 書く瞑想 ── */}
          <div className="h-[45vh] md:h-[55vh] flex items-center justify-center relative w-full px-4">
            <motion.div style={{ x: isMobile ? 0 : x2, scale: scale2 }} className="relative z-20 max-w-2xl w-full">
              <div className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-7 md:p-10 rounded-[2rem] hover:border-emerald-500/40 transition-all duration-500 cursor-none text-left overflow-hidden">

                <span className="absolute -right-6 -bottom-10 text-[14rem] font-bold text-white/[0.03] select-none pointer-events-none leading-none group-hover:text-emerald-500/[0.08] transition-colors duration-500">01</span>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-8 w-[3px] bg-white/30 rounded-full group-hover:bg-emerald-500 group-hover:h-10 transition-all duration-500" />
                    <div>
                      <h4 className="text-xl md:text-2xl font-semibold tracking-tight text-white/90 group-hover:text-emerald-400 transition-colors duration-500">書く瞑想</h4>
                      <p className="text-white/30 text-xs mt-0.5 tracking-wider">Writing Meditation</p>
                    </div>
                  </div>

                  <p className="text-base md:text-lg text-white/50 leading-relaxed mb-6">
                    毎日の思考や感情を、言葉として書き出す。<br className="hidden md:block" />
                    それだけで、心が整理され、新しい気づきが生まれます。
                  </p>

                  <div className="space-y-3 mb-6">
                    {['リッチテキストで自由に表現、テンプレートも選べる', '気分・エネルギー・睡眠の質を記録して変化を可視化', 'タグ付けで後から振り返りやすく整理'].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }} viewport={{ once: true }}
                        className="flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-white/30 mt-2.5 flex-shrink-0" />
                        <span className="text-white/45 text-sm md:text-[15px] leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-l-2 border-white/10 pl-4">
                    <p className="text-white/30 text-sm italic leading-relaxed">&ldquo;書くことは、考えることの最良の形である&rdquo;</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Panel 2: Image – 達成の喜び ── */}
          <div className="h-[50vh] md:h-[60vh] w-full px-4 relative">
            <div className="h-full w-full relative flex items-center justify-center">
              <motion.div
                style={{ x: isMobile ? 0 : x3, scale: scale3 }}
                className="relative w-full md:w-[42vw] h-[42vh] md:h-[52vh] z-0 group cursor-none overflow-hidden rounded-3xl shadow-2xl"
                onTouchStart={() => isMobile && handleImageTouch('scurve-party')}
              >
                <Image src="/images/japanese_celebration.png" alt="Celebration" fill className={`object-cover ${touchedImages.has('scurve-party') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-white/90 text-sm md:text-base font-light">目標を達成した瞬間の喜びを、分かち合う</p>
                </div>
              </motion.div>
              <motion.div
                animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute bottom-1/4 right-0 md:right-[10%] z-20 px-6 max-w-[80vw] md:max-w-none text-right pointer-events-none mix-blend-difference"
              >
                <span className="text-2xl md:text-6xl font-bold text-white tracking-tight">JOY & CELEBRATION</span>
                <p className="text-white/40 text-[10px] md:text-xs mt-1.5 tracking-[0.2em] uppercase font-light text-right">喜びと達成</p>
              </motion.div>
            </div>
          </div>

          {/* ── Card 2: 目標と習慣 ── */}
          <div className="h-[45vh] md:h-[55vh] flex items-center justify-center relative w-full px-4">
            <motion.div style={{ x: isMobile ? 0 : x4, scale: scale4 }} className="relative z-20 max-w-2xl w-full">
              <div className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-7 md:p-10 rounded-[2rem] hover:border-cyan-500/40 transition-all duration-500 cursor-none text-left overflow-hidden">

                <span className="absolute -right-6 -bottom-10 text-[14rem] font-bold text-white/[0.03] select-none pointer-events-none leading-none group-hover:text-cyan-500/[0.08] transition-colors duration-500">02</span>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-8 w-[3px] bg-white/30 rounded-full group-hover:bg-cyan-500 group-hover:h-10 transition-all duration-500" />
                    <div>
                      <h4 className="text-xl md:text-2xl font-semibold tracking-tight text-white/90 group-hover:text-cyan-400 transition-colors duration-500">目標と習慣づくり</h4>
                      <p className="text-white/30 text-xs mt-0.5 tracking-wider">Goals & Habits</p>
                    </div>
                  </div>

                  <p className="text-base md:text-lg text-white/50 leading-relaxed mb-6">
                    大きな夢も、日々の小さなステップに分ければ<br className="hidden md:block" />
                    必ず近づける。進捗を見える化して、モチベーションを保ちます。
                  </p>

                  <div className="space-y-3 mb-6">
                    {['目標を細かく分解し、10%刻みで進捗を更新', '短期から長期まで期間別の目標管理し、無理なく理想に近づく', '達成時にはお祝いメッセージで気持ちを後押し'].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }} viewport={{ once: true }}
                        className="flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-white/30 mt-2.5 flex-shrink-0" />
                        <span className="text-white/45 text-sm md:text-[15px] leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mini progress visualization */}
                  <div className="flex gap-1.5 items-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div key={i} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }} viewport={{ once: true }}
                        className={`h-2 flex-1 rounded-full ${i < 9 ? 'bg-white/20' : 'bg-white/[0.06]'}`}
                      />
                    ))}
                    <span className="text-white/25 text-xs ml-2 tabular-nums">9/12</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Panel 3: Image – 自由と冒険 ── */}
          <div className="h-[50vh] md:h-[60vh] w-full px-4 relative">
            <div className="h-full w-full relative flex items-center justify-center">
              <motion.div
                style={{ x: isMobile ? 0 : x5, scale: scale5 }}
                className="relative w-full md:w-[42vw] h-[42vh] md:h-[52vh] z-0 group cursor-none overflow-hidden rounded-3xl shadow-2xl"
                onTouchStart={() => isMobile && handleImageTouch('scurve-beach')}
              >
                <Image src="/images/beach.png" alt="Beach" fill className={`object-cover ${touchedImages.has('scurve-beach') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-white/90 text-sm md:text-base font-light">新しい世界を探求し、視野を広げる冒険へ</p>
                </div>
              </motion.div>
              <motion.div
                animate={{ x: [0, 25, 0], y: [0, 25, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-1/3 right-0 md:right-[15%] z-20 px-6 max-w-[80vw] md:max-w-none text-right pointer-events-none mix-blend-difference"
              >
                <span className="text-2xl md:text-6xl font-bold text-white tracking-tight">FREEDOM & DISCOVERY</span>
                <p className="text-white/40 text-[10px] md:text-xs mt-1.5 tracking-[0.2em] uppercase font-light text-right">自由と発見</p>
              </motion.div>
            </div>
          </div>

          {/* ── Card 3: 声で記録する ── */}
          <div className="h-[45vh] md:h-[55vh] flex items-center justify-center relative w-full px-4">
            <motion.div style={{ x: isMobile ? 0 : x6, scale: scale6 }} className="relative z-20 max-w-2xl w-full">
              <div className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-7 md:p-10 rounded-[2rem] hover:border-blue-500/40 transition-all duration-500 cursor-none text-left overflow-hidden">

                <span className="absolute -right-6 -bottom-10 text-[14rem] font-bold text-white/[0.03] select-none pointer-events-none leading-none group-hover:text-blue-500/[0.08] transition-colors duration-500">03</span>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-8 w-[3px] bg-white/30 rounded-full group-hover:bg-blue-500 group-hover:h-10 transition-all duration-500" />
                    <div>
                      <h4 className="text-xl md:text-2xl font-semibold tracking-tight text-white/90 group-hover:text-blue-400 transition-colors duration-500">声で記録する</h4>
                      <p className="text-white/30 text-xs mt-0.5 tracking-wider">Voice Journal</p>
                    </div>
                  </div>

                  <p className="text-base md:text-lg text-white/50 leading-relaxed mb-6">
                    書くのが難しい日は、話すだけでいい。<br className="hidden md:block" />
                    散歩中、通勤中、寝る前。思いついた瞬間に声で残せます。
                  </p>

                  <div className="space-y-3 mb-6">
                    {['ワンタップで録音、AIが自動で文字起こし', '話した言葉からキーワードやテーマを自動抽出', '過去の記録をAIが分析し、思考のつながりをマインドマップで可視化'].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }} viewport={{ once: true }}
                        className="flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-white/30 mt-2.5 flex-shrink-0" />
                        <span className="text-white/45 text-sm md:text-[15px] leading-relaxed">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-l-2 border-white/10 pl-4">
                    <p className="text-white/30 text-sm italic leading-relaxed">&ldquo;言葉にすることで、はじめて自分の気持ちに気づく&rdquo;</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>



        </section>

        {/* Final Message Section */}
        <section className="relative py-16 md:py-24 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="mb-8 md:mb-12">
              <p className="text-3xl md:text-5xl lg:text-6xl text-white/15 italic mb-2 tracking-wider" style={{ fontFamily: 'var(--font-dancing), cursive', textShadow: '0 0 30px rgba(255,255,255,0.05)' }}>At Your Own Pace, In Your Own Way</p>
              <h2 className="text-2xl md:text-[38px] lg:text-[42px] font-bold text-white tracking-[0.15em] leading-tight">
                あなたのペース、あなたのやり方で。
              </h2>
            </div>
            <p className="text-lg md:text-2xl text-white/70 mb-12 leading-relaxed">
              一歩ずつ、確実に。<br />
              あなたの夢を現実に変える旅を、<br className="md:hidden" />
              今ここから始めましょう。
            </p>
            <MagneticButton>
              <Link
                href="/signup"
                className="inline-block px-8 md:px-12 py-4 md:py-5 bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20 hover:border-white/50 hover:scale-105 text-white text-lg md:text-xl font-medium rounded-full transition-all duration-300 cursor-none shadow-lg shadow-white/10"
              >
                無料で始める
              </Link>
            </MagneticButton>
          </motion.div>
        </section>

        <footer className="py-8 md:py-12 px-4 md:px-8 border-t border-white/10 text-center">
          <h2 className="text-[15vw] font-bold tracking-tighter leading-none opacity-10 select-none pointer-events-none">
            JOURNIFY
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mt-8 md:mt-10 text-xs md:text-sm text-white/40">
            <p>&copy; 2025-2026 Journify.</p>
            <Link href="/terms" className="hover:text-white transition-colors duration-300">利用規約</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-300">プライバシーポリシー</Link>
          </div>
        </footer>
      </div>
    </div >
  )
}
