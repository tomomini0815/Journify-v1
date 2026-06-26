"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
    AlertTriangle,
    Bot,
    BrainCircuit,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    MessageSquare,
    Send,
    Sparkles,
    Target,
    User,
    X,
} from "lucide-react"

interface Task {
    text: string
    priority: "high" | "medium" | "low"
}

interface Milestone {
    title: string
    description: string
    tasks: Task[]
}

interface StrategyPlan {
    title: string
    description: string
    milestones: Milestone[]
    risks: string[]
}

interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

interface AIStrategyModalProps {
    isOpen: boolean
    onClose: () => void
    onCreateProject: (plan: StrategyPlan) => void
}

const durationOptions = [
    { value: "1 month", label: "1ヶ月" },
    { value: "3 months", label: "3ヶ月" },
    { value: "6 months", label: "半年" },
    { value: "1 year", label: "1年" },
]

const priorityLabel: Record<Task["priority"], string> = {
    high: "高",
    medium: "中",
    low: "低",
}

export function AIStrategyModal({ isOpen, onClose, onCreateProject }: AIStrategyModalProps) {
    const [step, setStep] = useState<"input" | "chat" | "generating" | "review">("input")
    const [goal, setGoal] = useState("")
    const [duration, setDuration] = useState("3 months")
    const [plan, setPlan] = useState<StrategyPlan | null>(null)
    const [expandedMilestone, setExpandedMilestone] = useState<number | null>(0)
    const [refinementText, setRefinementText] = useState("")
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState("")
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [isRefining, setIsRefining] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chatHistory])

    const resetModal = () => {
        setStep("input")
        setGoal("")
        setPlan(null)
        setRefinementText("")
        setChatHistory([])
        setChatInput("")
        setExpandedMilestone(0)
    }

    const handleClose = () => {
        onClose()
        window.setTimeout(resetModal, 250)
    }

    const handleGenerate = async (e?: React.FormEvent, fromChat = false) => {
        e?.preventDefault()
        if (!goal.trim() && !fromChat) return

        setStep("generating")

        try {
            const body: Record<string, unknown> = { goal, duration }
            if (fromChat) body.chatHistory = chatHistory

            const res = await fetch("/api/projects/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                const data = await res.json()
                setPlan(data)
                setStep("review")
            } else {
                setStep(fromChat ? "chat" : "input")
            }
        } catch (error) {
            console.error(error)
            setStep(fromChat ? "chat" : "input")
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        const userMsg = chatInput.trim()
        const newHistory = [...chatHistory, { role: "user" as const, content: userMsg }]

        setChatHistory(newHistory)
        setChatInput("")
        setIsChatLoading(true)
        if (!goal) setGoal(userMsg)

        try {
            const res = await fetch("/api/projects/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goal: userMsg,
                    action: "consult",
                    chatHistory,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setChatHistory([...newHistory, { role: "assistant", content: data.response }])
            }
        } catch (error) {
            console.error("Chat failed:", error)
        } finally {
            setIsChatLoading(false)
        }
    }

    const handleRefine = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!refinementText.trim()) return

        setIsRefining(true)
        try {
            const res = await fetch("/api/projects/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goal,
                    duration,
                    currentPlan: plan,
                    feedback: refinementText,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setPlan(data)
                setRefinementText("")
            }
        } catch (error) {
            console.error("Refinement failed:", error)
        } finally {
            setIsRefining(false)
        }
    }

    const handleCreate = () => {
        if (!plan) return
        onCreateProject(plan)
        onClose()
        window.setTimeout(resetModal, 250)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center p-3 py-6 sm:items-center sm:p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111418] shadow-2xl"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ai-strategy-title"
                >
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 z-20 rounded-full border border-white/[0.08] bg-white/[0.04] p-2 text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"
                        aria-label="閉じる"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="relative shrink-0 border-b border-white/[0.08] bg-white/[0.025] px-6 py-5">
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
                        <div className="flex min-w-0 items-start gap-3 pr-12">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                                <Sparkles className="h-5 w-5 text-emerald-300" />
                            </div>
                            <div className="min-w-0">
                                <p className="mb-1 text-xs font-semibold uppercase text-emerald-100/85">AI Strategy Partner</p>
                                <h2 id="ai-strategy-title" className="break-words text-xl font-semibold leading-tight text-white">
                                    AIでプロジェクトを作成
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-white/55">
                                    目標からマイルストーンとタスクを整理します。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                        {step === "input" && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-base font-medium text-white">どう進めますか？</h3>
                                    <p className="text-sm leading-relaxed text-white/60">
                                        目標が決まっている場合は下のフォームから作成できます。迷っている場合はAIに相談しながら整理できます。
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep("chat")}
                                    className="group flex w-full items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-colors hover:border-emerald-400/30 hover:bg-white/[0.07]"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 transition-transform group-hover:scale-105">
                                        <MessageSquare className="h-5 w-5 text-emerald-300" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-medium text-white">AIに相談してから作る</h4>
                                        <p className="mt-1 break-words text-sm leading-relaxed text-white/60">
                                            まだ曖昧なアイデアや悩みを会話しながら、実行できる計画に整えます。
                                        </p>
                                    </div>
                                </button>

                                <form onSubmit={(e) => handleGenerate(e)} className="space-y-4 border-t border-white/[0.08] pt-5">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                                            <Target className="h-4 w-4" />
                                            達成したいゴール
                                        </label>
                                        <textarea
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            required
                                            placeholder="例: 3ヶ月以内にポートフォリオサイトを完成させて公開する"
                                            className="min-h-28 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/28 transition-colors focus:border-emerald-400/45 focus:outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                                            <Clock className="h-4 w-4" />
                                            想定期間
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#15191f] px-4 pr-10 text-sm text-white transition-colors focus:border-emerald-400/45 focus:outline-none"
                                            >
                                                {durationOptions.map((option) => (
                                                    <option key={option.value} value={option.value} className="bg-[#15191f] text-white">
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!goal.trim()}
                                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 font-semibold text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <BrainCircuit className="h-5 w-5" />
                                        戦略プランを生成
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === "chat" && (
                            <div className="flex min-h-[420px] flex-col">
                                <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-1">
                                    {chatHistory.length === 0 && (
                                        <div className="py-8 text-center">
                                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                                                <Bot className="h-7 w-7 text-white/40" />
                                            </div>
                                            <p className="text-sm leading-relaxed text-white/60">
                                                やりたいこと、迷っていること、今の状況をそのまま話してください。
                                            </p>
                                        </div>
                                    )}

                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            {msg.role === "assistant" && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/10">
                                                    <Bot className="h-4 w-4 text-emerald-300" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl p-3 text-sm leading-relaxed ${msg.role === "user"
                                                    ? "rounded-tr-sm bg-emerald-500 text-white"
                                                    : "rounded-tl-sm bg-white/[0.07] text-white/90"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            {msg.role === "user" && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                                                    <User className="h-4 w-4 text-white/60" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isChatLoading && (
                                        <div className="flex justify-start gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/10">
                                                <Bot className="h-4 w-4 text-emerald-300" />
                                            </div>
                                            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white/[0.07] p-4">
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="relative mb-3">
                                    <textarea
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage(e)
                                            }
                                        }}
                                        placeholder="メッセージを入力"
                                        rows={2}
                                        className="max-h-40 min-h-[48px] w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-4 pr-12 text-sm leading-relaxed text-white placeholder:text-white/28 transition-colors focus:border-emerald-400/45 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="absolute right-2 top-2 rounded-lg bg-emerald-400/10 p-2 text-emerald-300 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-0"
                                        aria-label="送信"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>

                                {chatHistory.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleGenerate(undefined, true)}
                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] font-medium text-white transition-colors hover:bg-white/[0.1]"
                                    >
                                        <BrainCircuit className="h-4 w-4" />
                                        この内容で戦略プランを生成
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setStep("input")}
                                    className="mt-2 w-full py-2 text-xs text-white/45 transition-colors hover:text-white"
                                >
                                    入力画面に戻る
                                </button>
                            </div>
                        )}

                        {step === "generating" && (
                            <div className="flex min-h-72 flex-col items-center justify-center text-center">
                                <div className="relative mb-8 h-24 w-24">
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-cyan-300 border-t-emerald-300" />
                                    <Sparkles className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-white" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-white">戦略を組み立てています</h3>
                                <p className="text-sm leading-relaxed text-white/55">
                                    ゴールに合うマイルストーンとタスクを整理しています。
                                </p>
                            </div>
                        )}

                        {step === "review" && plan && (
                            <div className="relative space-y-5">
                                {isRefining && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
                                        <div className="text-center">
                                            <Sparkles className="mx-auto mb-2 h-8 w-8 animate-spin text-emerald-300" />
                                            <p className="font-medium text-white">プランを修正しています</p>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                                    <h3 className="break-words text-xl font-semibold leading-tight text-white">{plan.title}</h3>
                                    <p className="mt-2 break-words text-sm leading-relaxed text-white/70">{plan.description}</p>
                                </div>

                                {plan.risks?.length > 0 && (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                                        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300">
                                            <AlertTriangle className="h-4 w-4" />
                                            想定されるリスクと対策
                                        </h4>
                                        <ul className="space-y-1 text-sm leading-relaxed text-amber-100/80">
                                            {plan.risks.map((risk, i) => (
                                                <li key={i} className="break-words">
                                                    {risk}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-white/80">生成されたロードマップ</h4>
                                    {plan.milestones?.map((milestone, i) => (
                                        <div key={i} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedMilestone(expandedMilestone === i ? null : i)}
                                                className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-white/[0.04]"
                                            >
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-xs font-bold text-emerald-300">
                                                        {i + 1}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="break-words font-medium text-white">{milestone.title}</h5>
                                                        <p className="mt-1 break-words text-xs leading-relaxed text-white/50">
                                                            {milestone.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                {expandedMilestone === i ? (
                                                    <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-white/40" />
                                                ) : (
                                                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-white/40" />
                                                )}
                                            </button>

                                            {expandedMilestone === i && (
                                                <div className="border-t border-white/[0.06] bg-black/20 p-4">
                                                    <ul className="space-y-2">
                                                        {milestone.tasks.map((task, j) => (
                                                            <li key={j} className="flex min-w-0 items-start gap-2 text-sm leading-relaxed text-white/70">
                                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                                                                <span className="min-w-0 flex-1 break-words">{task.text}</span>
                                                                <span
                                                                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${task.priority === "high"
                                                                        ? "border-red-500/30 bg-red-500/20 text-red-300"
                                                                        : task.priority === "medium"
                                                                            ? "border-amber-500/30 bg-amber-500/20 text-amber-300"
                                                                            : "border-blue-500/30 bg-blue-500/20 text-blue-300"
                                                                        }`}
                                                                >
                                                                    {priorityLabel[task.priority]}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleRefine} className="border-t border-white/[0.08] pt-4">
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70">
                                        <Sparkles className="h-4 w-4" />
                                        AIと一緒にプランを練り直す
                                    </label>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <textarea
                                            value={refinementText}
                                            onChange={(e) => setRefinementText(e.target.value)}
                                            placeholder="例: もっと短期間で進めたい、予算を抑えたい、など"
                                            rows={2}
                                            className="min-h-[48px] flex-1 resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/28 transition-colors focus:border-emerald-400/45 focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleRefine(e)
                                                }
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!refinementText.trim() || isRefining}
                                            className="h-10 rounded-xl bg-white/[0.08] px-4 font-medium text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            送信
                                        </button>
                                    </div>
                                </form>

                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 font-semibold text-white transition-colors hover:bg-emerald-400"
                                >
                                    <Target className="h-5 w-5" />
                                    このプランでプロジェクトを開始
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
