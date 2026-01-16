"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, AlertCircle, CheckCircle2, Loader2, MessageSquarePlus } from "lucide-react"
import { DashboardLayout } from "@/components/DashboardLayout"

export default function FeedbackPage() {
    const [type, setType] = useState("inquiry")
    const [category, setCategory] = useState("")
    const [affectedPage, setAffectedPage] = useState("")
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        setSubmitStatus("idle")

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type, category, affectedPage, content }),
            })

            if (!res.ok) throw new Error("Failed to submit feedback")

            setSubmitStatus("success")
            setContent("")
            setType("inquiry")
            setCategory("")
            setAffectedPage("")
        } catch (error) {
            console.error(error)
            setSubmitStatus("error")
        } finally {
            setIsSubmitting(false)
        }
    }

    const feedbackTypes = [
        { value: "inquiry", label: "お問い合わせ" },
        { value: "improvement", label: "機能改善の提案" },
        { value: "opinion", label: "ご意見・ご感想" },
        { value: "bug_report", label: "不具合報告" },
    ]

    const categories: Record<string, { value: string; label: string }[]> = {
        inquiry: [
            { value: "account", label: "アカウントについて" },
            { value: "payment", label: "お支払いについて" },
            { value: "other", label: "その他" },
        ],
        improvement: [
            { value: "feature_request", label: "機能追加の要望" },
            { value: "ui_ux", label: "UI/UXの改善" },
            { value: "performance", label: "パフォーマンス改善" },
            { value: "other", label: "その他" },
        ],
        opinion: [
            { value: "design", label: "デザインについて" },
            { value: "content", label: "コンテンツについて" },
            { value: "other", label: "その他" },
        ],
        bug_report: [
            { value: "crash", label: "アプリが落ちる" },
            { value: "layout", label: "表示が崩れる" },
            { value: "data", label: "データがおかしい" },
            { value: "other", label: "その他" },
        ],
    }

    const pages = [
        { value: "/dashboard", label: "ダッシュボード" },
        { value: "/journal", label: "ジャーナル" },
        { value: "/goals", label: "目標" },
        { value: "/tasks", label: "タスク" },
        { value: "/projects", label: "プロジェクト" },
        { value: "/vision-board", label: "ビジョンボード" },
        { value: "other", label: "その他" },
    ]

    const handleTypeChange = (newType: string) => {
        setType(newType)
        setCategory("")
        setAffectedPage("")
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white">
                        お問い合わせ・フィードバック
                    </h1>
                    <p className="mt-2 text-white/60">
                        アプリに関するご質問、ご意見、不具合のご報告などをお寄せください。<br />
                        いただいた内容は、サービスの改善に活用させていただきます。
                    </p>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-900/10"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Feedback Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">
                                種別
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {feedbackTypes.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => handleTypeChange(t.value)}
                                        className={`
                                            flex items-center justify-center px-4 py-3 rounded-xl border text-sm font-medium transition-all
                                            ${type === t.value
                                                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                                : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:border-white/10"
                                            }
                                        `}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category */}
                        {categories[type] && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">
                                    詳細カテゴリ
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">選択してください</option>
                                    {categories[type].map((c) => (
                                        <option key={c.value} value={c.value} className="bg-slate-900">
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Affected Page - Only for opinion, bug_report, and improvement */}
                        {(type === "opinion" || type === "bug_report" || type === "improvement") && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">
                                    関連ページ
                                </label>
                                <select
                                    value={affectedPage}
                                    onChange={(e) => setAffectedPage(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500">選択してください</option>
                                    {pages.map((p) => (
                                        <option key={p.value} value={p.value} className="bg-slate-900">
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Content */}
                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium text-white/80">
                                内容
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={6}
                                placeholder="具体的な内容をご記入ください..."
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className={`
                                group w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all
                                ${isSubmitting || !content.trim()
                                    ? "bg-white/5 cursor-not-allowed opacity-50"
                                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]"
                                }
                            `}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin text-white/60" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2 opacity-80 group-hover:translate-x-1 transition-transform" />
                                    送信する
                                </>
                            )}
                        </button>

                        {/* Status Messages */}
                        {submitStatus === "success" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"
                            >
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">送信しました。貴重なご意見ありがとうございます。</p>
                            </motion.div>
                        )}

                        {submitStatus === "error" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">送信に失敗しました。時間をおいて再度お試しください。</p>
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
