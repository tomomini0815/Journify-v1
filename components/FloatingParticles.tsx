"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"

interface Particle {
    id: number
    size: number
    color: string
    duration: number
    delay: number
    startX: number
    startY: number
}

interface FloatingParticlesProps {
    count?: number
    className?: string
    colors?: string[]
}

const DEFAULT_COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#ffffff"]

export default function FloatingParticles({
    count = 50,
    className = "",
    colors
}: FloatingParticlesProps) {
    const [particles, setParticles] = useState<Particle[]>([])
    const [mounted, setMounted] = useState(false)

    // Use stable color reference
    const stableColors = useMemo(() => colors ?? DEFAULT_COLORS, [])

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        const generatedParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 1,
            color: stableColors[Math.floor(Math.random() * stableColors.length)],
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 10,
            startX: Math.random() * 100,
            startY: Math.random() * 100,
        }))
        setParticles(generatedParticles)
        setMounted(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!mounted) return null

    return (
        <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.startX}%`,
                        top: `${particle.startY}%`,
                        background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                    }}
                    animate={{
                        y: [0, -100, -200, -100, 0],
                        x: [0, 30, -20, 40, 0],
                        opacity: [0, 0.8, 1, 0.6, 0],
                        scale: [0.5, 1.2, 1, 0.8, 0.5],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}
