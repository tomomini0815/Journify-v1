"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from "framer-motion"
import { ArrowUpRight, Menu, CheckCircle2, Calendar, BarChart3 } from "lucide-react"
import CustomCursor from "@/components/CustomCursor"
import MagneticButton from "@/components/MagneticButton"
import { useMediaQuery } from "@/hooks/use-media-query"

const basePath = process.env.NODE_ENV === 'production' ? '/Journify-v1' : '';

export default function LandingPage() {
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [touchedImages, setTouchedImages] = useState<Set<string>>(new Set())
  const isMobile = useMediaQuery("(max-width: 768px)")

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
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { damping: 20 })

  // S-Curve animations
  const x1 = useTransform(smoothProgress, [0.05, 0.25], ["-50%", "0%"])
  const scale1 = useTransform(smoothProgress, [0.05, 0.15, 0.25], [0.8, 1.2, 0.8])

  const x2 = useTransform(smoothProgress, [0.20, 0.40], ["50%", "0%"])
  const scale2 = useTransform(smoothProgress, [0.20, 0.30, 0.40], [0.8, 1.1, 0.8])

  const x3 = useTransform(smoothProgress, [0.35, 0.55], ["-50%", "0%"])
  const scale3 = useTransform(smoothProgress, [0.35, 0.45, 0.55], [0.8, 1.2, 0.8])

  const x4 = useTransform(smoothProgress, [0.50, 0.70], ["50%", "0%"])
  const scale4 = useTransform(smoothProgress, [0.50, 0.60, 0.70], [0.8, 1.1, 0.8])

  const x5 = useTransform(smoothProgress, [0.65, 0.85], ["-50%", "0%"])
  const scale5 = useTransform(smoothProgress, [0.65, 0.75, 0.85], [0.8, 1.2, 0.8])

  const x6 = useTransform(smoothProgress, [0.80, 1.0], ["50%", "0%"])
  const scale6 = useTransform(smoothProgress, [0.80, 0.90, 1.0], [0.8, 1.1, 0.8])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const useParallax = (value: any, distance: number) => {
    return useTransform(value, [0, 1], [-distance, distance])
  }

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
            opacity: useTransform(scrollYProgress, [0, 0.05, 0.2], [0.5, 0.5, 0]),
            backgroundImage: 'url("https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Daytime Sky - Body Section Start */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: useTransform(scrollYProgress, [0.15, 0.3, 0.55], [0, 0.7, 0.5]),
            backgroundImage: 'url("https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Sunset Image - Body Section End */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: useTransform(scrollYProgress, [0.5, 0.65, 0.85], [0, 0.7, 0.3]),
            backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Space/Galaxy Image - Footer Only */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: useTransform(scrollYProgress, [0.8, 0.95, 1], [0, 0.7, 0.7]),
            backgroundImage: 'url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Dark overlay to keep it subtle */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Twinkling Stars for space section */}
      <motion.div
        className="fixed inset-0 -z-5 pointer-events-none"
        style={{
          opacity: useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 0.8, 1])
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

      <div ref={containerRef} className="relative text-[#e1e1e1] selection:bg-white selection:text-black overflow-x-hidden">

        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-8 py-6 mix-blend-difference">
          <MagneticButton>
            <div className="text-xl font-bold tracking-tighter cursor-pointer">JOURNIFY®</div>
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

        <section className="relative h-[100vh] md:h-[120vh] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] bg-gradient-to-br from-amber-900/20 to-purple-900/20 rounded-full blur-[120px]" />

            <motion.div
              style={{ x: useParallax(mouseX, -20), y: useParallax(mouseY, -20) }}
              className="absolute top-[10%] left-[5%] w-[35vw] h-[25vw] md:w-[20vw] md:h-[15vw] opacity-70 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-party')}
            >
              <Image src={`${basePath}/images/japanese_party.png`} alt="Success Party" fill className={`object-cover rounded-xl ${touchedImages.has('hero-party') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>

            <motion.div
              style={{ x: useParallax(mouseX, 30), y: useParallax(mouseY, 10) }}
              className="absolute top-[12%] right-[5%] w-[38vw] h-[24vw] md:w-[22vw] md:h-[14vw] opacity-70 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-jet')}
            >
              <Image src={`${basePath}/images/japanese_travel_luxury.png`} alt="Private Jet" fill className={`object-cover rounded-xl ${touchedImages.has('hero-jet') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>

            <motion.div
              style={{ x: useParallax(mouseX, 15), y: useParallax(mouseY, -15) }}
              className="absolute bottom-[15%] left-[5%] w-[30vw] h-[30vw] md:w-[18vw] md:h-[18vw] opacity-60 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-deal')}
            >
              <Image src={`${basePath}/images/japanese_business_deal.png`} alt="Business Deal" fill className={`object-cover rounded-xl ${touchedImages.has('hero-deal') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>

            <motion.div
              style={{ x: useParallax(mouseX, -25), y: useParallax(mouseY, 25) }}
              className="absolute bottom-[20%] right-[5%] w-[40vw] h-[28vw] md:w-[25vw] md:h-[18vw] opacity-60 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-beach')}
            >
              <Image src={`${basePath}/images/beach.png`} alt="Beautiful Scenery" fill className={`object-cover rounded-xl ${touchedImages.has('hero-beach') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>

            <motion.div
              style={{ x: useParallax(mouseX, -40), y: useParallax(mouseY, 10) }}
              className="absolute top-[40%] left-[-10%] md:left-[-5%] w-[25vw] h-[35vw] md:w-[15vw] md:h-[20vw] opacity-50 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-family')}
            >
              <Image src={`${basePath}/images/family.png`} alt="Happy Family" fill className={`object-cover rounded-xl ${touchedImages.has('hero-family') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>

            <motion.div
              style={{ x: useParallax(mouseX, 40), y: useParallax(mouseY, -30) }}
              className="absolute top-[35%] right-[-5%] md:right-[-2%] w-[28vw] h-[38vw] md:w-[16vw] md:h-[22vw] opacity-50 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-horizon')}
            >
              <Image src={`${basePath}/images/horizon.png`} alt="Horizon" fill className={`object-cover rounded-xl ${touchedImages.has('hero-horizon') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>

            <motion.div
              style={{ x: useParallax(mouseX, 0), y: useParallax(mouseY, 50) }}
              className="absolute bottom-[5%] left-[30%] w-[40vw] h-[25vw] md:w-[20vw] md:h-[12vw] opacity-40 hover:opacity-100 transition-opacity duration-500 hover:z-20"
              onTouchStart={() => isMobile && handleImageTouch('hero-home')}
            >
              <Image src={`${basePath}/images/home.png`} alt="Luxury Villa" fill className={`object-cover rounded-xl ${touchedImages.has('hero-home') ? '' : 'grayscale'} hover:grayscale-0 transition-all duration-500`} />
            </motion.div>
          </div>

          <div className="z-10 text-center mix-blend-difference pointer-events-none px-4">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15vw] md:text-[12vw] leading-[0.85] font-bold tracking-tighter"
            >
              DEFINE
              <br />
              <span className="italic font-light text-white/50">YOUR</span> LEGACY
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.8 }}
              className="mt-8 md:mt-10 space-y-2 text-base md:text-xl font-medium tracking-widest text-white/90"
            >
              <p>日々の努力が、確かな未来を築く。</p>
              <p>あなたの野心を記録し、</p>
              <p>理想の自分へと歩み出そう。</p>
            </motion.div>
          </div>
        </section>

        <section className="relative min-h-[400vh] py-20 md:py-40 overflow-hidden">

          <div className="h-[60vh] md:h-[80vh] flex items-center justify-center relative">
            <motion.div
              style={{ x: isMobile ? 0 : x1, scale: scale1 }}
              className="relative w-[80vw] md:w-[40vw] h-[40vh] md:h-[50vh] z-0 group cursor-none"
              onTouchStart={() => isMobile && handleImageTouch('scurve-home1')}
            >
              <Image src={`${basePath}/images/home.png`} alt="Luxury Home" fill className={`object-cover rounded-3xl shadow-2xl ${touchedImages.has('scurve-home1') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
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
                      <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400">
                        <BarChart3 className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl md:text-4xl font-medium group-hover:text-violet-400 transition-colors">Smart Analysis</h4>
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
              <Image src={`${basePath}/images/japanese_party.png`} alt="Celebration" fill className={`object-cover rounded-3xl shadow-2xl ${touchedImages.has('scurve-party') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
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
                      <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl md:text-4xl font-medium group-hover:text-emerald-400 transition-colors">Goal Tracking</h4>
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
              <Image src={`${basePath}/images/beach.png`} alt="Travel" fill className={`object-cover rounded-3xl shadow-2xl ${touchedImages.has('scurve-beach') ? '' : 'grayscale'} group-hover:grayscale-0 transition-all duration-700 ease-out`} />
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
                      <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <h4 className="text-2xl md:text-4xl font-medium group-hover:text-blue-400 transition-colors">Calendar Sync</h4>
                    </div>
                    <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-base md:text-lg text-white/60">Google、Outlook、Appleカレンダーとシームレスに連携します。</p>
                </div>
              </MagneticButton>
            </motion.div>
          </div>

        </section>

        <footer className="py-12 md:py-20 px-6 md:px-8 border-t border-white/10 text-center">
          <h2 className="text-[15vw] font-bold tracking-tighter leading-none opacity-10 select-none pointer-events-none">
            JOURNIFY
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 md:mt-10 text-xs md:text-sm text-white/40">
            <p>&copy; 2025 Journify Inc.</p>
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
