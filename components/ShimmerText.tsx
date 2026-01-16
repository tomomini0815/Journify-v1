"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface ShimmerTextProps {
    children: ReactNode
    className?: string
    shimmerColor?: string
    duration?: number
}

export default function ShimmerText({
    children,
    className = "",
    shimmerColor = "rgba(255, 255, 255, 0.3)",
    duration = 3
}: ShimmerTextProps) {
    return (
        <span className={`relative inline-block ${className}`}>
            {children}
            <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(
                        120deg,
                        transparent 0%,
                        transparent 40%,
                        ${shimmerColor} 50%,
                        transparent 60%,
                        transparent 100%
                    )`,
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    mixBlendMode: "overlay",
                }}
                animate={{
                    backgroundPosition: ["200% 0", "-200% 0"],
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </span>
    )
}
