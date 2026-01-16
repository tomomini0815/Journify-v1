"use client"

import { motion } from "framer-motion"

interface GlowingOrbProps {
    className?: string
    color1?: string
    color2?: string
    size?: number
}

export default function GlowingOrb({
    className = "",
    color1 = "#10b981",
    color2 = "#06b6d4",
    size = 400
}: GlowingOrbProps) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${color1}30 0%, ${color2}20 50%, transparent 70%)`,
            }}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    )
}
