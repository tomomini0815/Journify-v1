"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradientEffectsProps {
    className?: string
    blur?: boolean
}

/**
 * Gradient lamp effects component - designed to be layered over existing backgrounds
 * Use with z-index between background and content layers
 * Now with multiple animated colored lights for dynamic atmosphere
 */
export const GradientLampEffects = React.forwardRef<HTMLDivElement, GradientEffectsProps>(
    ({ className, blur = true }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute inset-0 pointer-events-none isolate z-0 flex w-full items-start justify-center overflow-hidden",
                    className
                )}
            >
                {blur && (
                    <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />
                )}

                {/* Main glow - Cyan */}
                <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[-30%] rounded-full bg-cyan-500/60 opacity-80 blur-3xl" />

                {/* Lamp effect - Cyan */}
                <motion.div
                    initial={{ width: "8rem" }}
                    viewport={{ once: true }}
                    transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                    whileInView={{ width: "16rem" }}
                    className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-cyan-500/60 blur-2xl"
                />

                {/* Top line - Cyan */}
                <motion.div
                    initial={{ width: "15rem" }}
                    viewport={{ once: true }}
                    transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                    whileInView={{ width: "30rem" }}
                    className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-cyan-400/80"
                />

                {/* Left gradient cone - Cyan */}
                <motion.div
                    initial={{ opacity: 0.3, width: "15rem" }}
                    whileInView={{ opacity: 0.6, width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
                    }}
                    className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-cyan-500/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
                >
                    <div className="absolute w-[100%] left-0 bg-transparent h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,black,transparent)]" />
                    <div className="absolute w-40 h-[100%] left-0 bg-transparent bottom-0 z-20 [mask-image:linear-gradient(to_right,black,transparent)]" />
                </motion.div>

                {/* Right gradient cone - Cyan */}
                <motion.div
                    initial={{ opacity: 0.3, width: "15rem" }}
                    whileInView={{ opacity: 0.6, width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
                    }}
                    className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500/60 [--conic-position:from_290deg_at_center_top]"
                >
                    <div className="absolute w-40 h-[100%] right-0 bg-transparent bottom-0 z-20 [mask-image:linear-gradient(to_left,black,transparent)]" />
                    <div className="absolute w-[100%] right-0 bg-transparent h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,black,transparent)]" />
                </motion.div>

                {/* Animated Purple Light - Left */}
                <motion.div
                    initial={{ opacity: 0, x: -100, y: 50 }}
                    animate={{
                        opacity: [0, 0.5, 0.7, 0.5, 0],
                        x: [-100, -50, 0, 50, 100],
                        y: [50, 100, 150, 200, 250],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute left-10 top-20 h-72 w-72 bg-purple-500/40 blur-3xl rounded-full"
                />

                {/* Animated Magenta Light - Right */}
                <motion.div
                    initial={{ opacity: 0, x: 100, y: 100 }}
                    animate={{
                        opacity: [0, 0.6, 0.8, 0.6, 0],
                        x: [100, 50, 0, -50, -100],
                        y: [100, 150, 200, 250, 300],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute right-10 top-32 h-80 w-80 bg-fuchsia-500/35 blur-3xl rounded-full"
                />

                {/* Animated Blue Light - Center Floating */}
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                        opacity: [0, 0.4, 0.6, 0.4, 0],
                        y: [0, -50, -100, -150, -200],
                        x: [0, 30, 0, -30, 0],
                        scale: [1, 1.2, 1.4, 1.2, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                    className="absolute left-1/2 -translate-x-1/2 top-40 h-64 w-64 bg-blue-400/45 blur-3xl rounded-full"
                />

                {/* Animated Violet Light - Bottom Left */}
                <motion.div
                    initial={{ opacity: 0, x: 0, y: 200 }}
                    animate={{
                        opacity: [0, 0.5, 0.7, 0.5, 0],
                        x: [0, -30, -60, -30, 0],
                        y: [200, 150, 100, 150, 200],
                        rotate: [0, 45, 90, 135, 180],
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute left-20 bottom-20 h-56 w-56 bg-violet-500/40 blur-3xl rounded-full"
                />

                {/* Ambient Pink Light - Pulsing */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.3, 0.5, 0.3, 0],
                        scale: [0.8, 1, 1.2, 1, 0.8],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8
                    }}
                    className="absolute right-32 bottom-32 h-48 w-48 bg-pink-400/35 blur-3xl rounded-full"
                />

                {/* Left side ambient glow - Cyan */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.6 }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-96 w-64 bg-cyan-500/40 blur-3xl rounded-full"
                />

                {/* Right side ambient glow - Blue/Purple gradient */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.6 }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-96 w-64 bg-gradient-to-l from-purple-500/40 to-cyan-500/40 blur-3xl rounded-full"
                />
            </div>
        )
    }
)

GradientLampEffects.displayName = "GradientLampEffects"
