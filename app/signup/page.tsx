"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords don't match!")
            return
        }
        if (!acceptTerms) {
            setError("Please accept the terms and conditions")
            return
        }

        setIsLoading(true)

        // Simulate API call
        console.log("Signup:", { name, email, password })

        // Simulate network delay
        setTimeout(() => {
            setIsLoading(false)
            // Redirect to dashboard
            router.push("/dashboard")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-900/30 to-purple-900/30 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-900/20 to-blue-900/20 blur-[100px] rounded-full animate-pulse" />
            </div>

            {/* Noise texture */}
            <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

            {/* Signup Card */}
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
                        <h2 className="text-2xl font-bold mb-2">アカウント作成</h2>
                        <p className="text-white/60">理想の自分への旅を始める</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-white/80">
                                お名前
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-11 bg-white/5 border-white/10 focus:border-purple-400 h-12 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

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
                                    className="pl-11 bg-white/5 border-white/10 focus:border-purple-400 h-12 rounded-xl"
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
                                    className="pl-11 bg-white/5 border-white/10 focus:border-purple-400 h-12 rounded-xl"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">
                                パスワード再入力
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-11 bg-white/5 border-white/10 focus:border-purple-400 h-12 rounded-xl"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                                required
                            />
                            <span className="text-sm text-white/60">
                                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                                    利用規約
                                </Link>
                                と
                                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                                    プライバシーポリシー
                                </Link>
                                に同意します
                            </span>
                        </label>

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
                            className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-medium text-base group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span>アカウント作成中...</span>
                                </>
                            ) : (
                                <>
                                    <span>アカウント作成</span>
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-[1px] bg-white/10" />
                        <span className="text-sm text-white/40">または</span>
                        <div className="flex-1 h-[1px] bg-white/10" />
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-white/60">
                        すでにアカウントをお持ちですか？{" "}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            ログイン
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
