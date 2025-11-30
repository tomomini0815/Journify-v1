"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Lock, Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const { createClient } = await import("@/lib/supabase/client")
            const supabase = createClient()

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            // Ensure user exists in Prisma database
            await fetch("/api/user", {
                method: "POST",
            })

            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "ログインに失敗しました")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 blur-[100px] rounded-full animate-pulse" />
            </div>

            {/* Noise texture */}
            <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 w-full max-w-md"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <motion.h1
                                className="text-3xl font-bold tracking-tighter"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                Journify
                            </motion.h1>
                        </Link>
                        <h2 className="text-2xl font-bold mb-2">おかえりなさい</h2>
                        <p className="text-white/60">ログインして旅を続ける</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-white/80">
                                メールアドレス
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11 bg-white/5 border-white/10 focus:border-emerald-400 h-12 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-white/80">
                                パスワード
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 bg-white/5 border-white/10 focus:border-emerald-400 h-12 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                />
                                <span className="text-sm text-white/60">ログイン状態を保持</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                パスワードを忘れました？
                            </Link>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-medium text-base group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span>ログイン中...</span>
                                </>
                            ) : (
                                <>
                                    <span>ログイン</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-white/10" />
                        <span className="text-sm text-white/40">または</span>
                        <div className="flex-1 h-[1px] bg-white/10" />
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-white/60">
                        アカウントをお持ちでない方は{" "}
                        <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                            新規登録
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
