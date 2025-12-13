"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Target, Clock, ArrowRight, BrainCircuit, Check, AlertTriangle, ChevronDown, ChevronUp, MessageSquare, Send, User, Bot } from "lucide-react"

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
    role: 'user' | 'assistant'
    content: string
}

interface AIStrategyModalProps {
    isOpen: boolean
    onClose: () => void
    onCreateProject: (plan: StrategyPlan) => void
}

export function AIStrategyModal({ isOpen, onClose, onCreateProject }: AIStrategyModalProps) {
    const [step, setStep] = useState<"input" | "chat" | "generating" | "review">("input")
    const [goal, setGoal] = useState("")
    const [duration, setDuration] = useState("3 months")
    const [plan, setPlan] = useState<StrategyPlan | null>(null)
    const [expandedMilestone, setExpandedMilestone] = useState<number | null>(0)
    const [refinementText, setRefinementText] = useState("")
    const [isRefining, setIsRefining] = useState(false)

    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState("")
    const [isChatLoading, setIsChatLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [chatHistory])

    const handleGenerate = async (e?: React.FormEvent, fromChat = false) => {
        if (e) e.preventDefault()
        setStep("generating")

        try {
            const body: any = { goal, duration }
            if (fromChat) {
                body.chatHistory = chatHistory
            }

            const res = await fetch("/api/projects/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                const data = await res.json()
                setPlan(data)
                setStep("review")
            } else {
                setStep(fromChat ? "chat" : "input") // Return to previous step on error
            }
        } catch (error) {
            console.error(error)
            setStep(fromChat ? "chat" : "input")
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim()) return

        const userMsg = chatInput
        const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }]
        setChatHistory(newHistory)
        setChatInput("")
        setIsChatLoading(true)

        // Add user goal if it's the first message effectively
        if (!goal) setGoal(userMsg)

        try {
            const res = await fetch("/api/projects/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goal: userMsg, // Send current input as 'goal' parameter for simple consultations
                    action: 'consult',
                    chatHistory: chatHistory // Send previous history
                })
            })

            if (res.ok) {
                const data = await res.json()
                setChatHistory([...newHistory, { role: 'assistant', content: data.response }])
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
                    feedback: refinementText
                })
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
        if (plan) {
            onCreateProject(plan)
            onClose()
            // Reset state after a delay to allow close animation
            setTimeout(() => {
                setStep("input")
                setGoal("")
                setPlan(null)
                setRefinementText("")
                setChatHistory([])
            }, 500)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Image/Gradient */}
                <div className="h-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-amber-900 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-2">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span className="text-xs font-bold text-amber-100 uppercase tracking-widest">AI Strategy Partner</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">AI戦略参謀</h2>
                    </div>
                </div>

                {/* Content Body - Scrollable */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {step === "input" && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-medium text-white mb-2">どうやって進めますか？</h3>
                                <p className="text-white/60 text-sm">
                                    目標が決まっていればすぐ作成。迷っているならAIに相談してみましょう。
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep("chat")}
                                    className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl transition-all group text-left"
                                >
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <h4 className="font-bold text-white mb-1">AIに相談する</h4>
                                    <p className="text-sm text-white/60">漠然としたアイデアを壁打ちして明確化する</p>
                                </button>

                                <button
                                    onClick={() => {
                                        // Auto-focus goal input if we had a discrete separate view, but here we just render the form below
                                        // Actually let's just make this current view switch to the 'form' view
                                        // For simplicity, let's keep the form in this 'input' step but hide it partially or just show it below
                                    }}
                                    className="hidden sm:block p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all group text-left cursor-default opacity-50"
                                >
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                        <Target className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h4 className="font-bold text-white mb-1">すぐに作成</h4>
                                    <p className="text-sm text-white/60">下のフォームから直接ゴールを入力</p>
                                </button>
                            </div>

                            <div className="border-t border-white/10 pt-6 mt-6">
                                <form onSubmit={(e) => handleGenerate(e)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            達成したいゴール
                                        </label>
                                        <textarea
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            required
                                            placeholder="例：3ヶ月以内に、Reactを使ったポートフォリオサイトを完成させて公開する"
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none text-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            想定期間
                                        </label>
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                        >
                                            <option value="1 month">1ヶ月</option>
                                            <option value="3 months">3ヶ月</option>
                                            <option value="6 months">半年</option>
                                            <option value="1 year">1年</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!goal.trim()}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        <BrainCircuit className="w-5 h-5" />
                                        戦略プランを生成する
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {step === "chat" && (
                        <div className="flex flex-col h-full h-[500px]">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                {chatHistory.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Bot className="w-8 h-8 text-white/40" />
                                        </div>
                                        <p className="text-white/60">
                                            こんにちは。<br />
                                            あなたのやりたいこと、悩み、なんでも話してください。<br />
                                            一緒にゴールを探しましょう。
                                        </p>
                                    </div>
                                )}
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-indigo-400" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                                            : 'bg-white/10 text-white/90 rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center">
                                                <User className="w-4 h-4 text-white/60" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-4 rounded-tl-sm flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="mt-auto">
                                <form onSubmit={handleSendMessage} className="relative mb-4">
                                    <textarea
                                        value={chatInput}
                                        onChange={(e) => {
                                            setChatInput(e.target.value)
                                            e.target.style.height = 'auto'
                                            e.target.style.height = e.target.scrollHeight + 'px'
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage(e)
                                            }
                                        }}
                                        placeholder="メッセージを入力..."
                                        rows={1}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none overflow-hidden min-h-[44px] max-h-[200px]"
                                        style={{ fieldSizing: 'content' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="absolute right-2 top-2 p-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors disabled:opacity-0"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>

                                {chatHistory.length > 1 && (
                                    <button
                                        onClick={() => handleGenerate(undefined, true)}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <BrainCircuit className="w-4 h-4" />
                                        この内容で戦略プランを生成
                                    </button>
                                )}
                                <button
                                    onClick={() => setStep("input")}
                                    className="w-full mt-2 py-2 text-white/40 hover:text-white text-xs"
                                >
                                    入力画面に戻る
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "generating" && (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-indigo-400 border-r-purple-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">戦略を構築中...</h3>
                            <p className="text-white/50 animate-pulse">
                                コンテキストを解析中...<br />
                                目標への最適ルートを計算中...
                            </p>
                        </div>
                    )}

                    {step === "review" && plan && (
                        <div className="space-y-6 relative">
                            {/* Loading Overlay for Refinement */}
                            {isRefining && (
                                <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                    <div className="text-center">
                                        <Sparkles className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-2" />
                                        <p className="text-white font-medium">プランを修正中...</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                                <p className="text-white/70">{plan.description}</p>
                            </div>

                            {/* Risk Alert */}
                            {plan.risks.length > 0 && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                    <h4 className="text-amber-400 font-bold text-sm flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        想定されるリスクと対策
                                    </h4>
                                    <ul className="list-disc list-inside text-amber-200/80 text-sm space-y-1">
                                        {plan.risks.map((risk, i) => (
                                            <li key={i}>{risk}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Milestones Preview */}
                            <div className="space-y-3">
                                <h4 className="text-white/80 font-medium text-sm">生成されたロードマップ</h4>
                                {plan.milestones.map((milestone, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedMilestone(expandedMilestone === i ? null : i)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-white">{milestone.title}</h5>
                                                    <p className="text-xs text-white/50">{milestone.description}</p>
                                                </div>
                                            </div>
                                            {expandedMilestone === i ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                                        </button>

                                        {expandedMilestone === i && (
                                            <div className="bg-black/20 p-4 border-t border-white/5">
                                                <ul className="space-y-2">
                                                    {milestone.tasks.map((task, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                                                            <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                            <span>{task.text}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                                                task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                                }`}>
                                                                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Refinement Section */}
                            <div className="pt-4 border-t border-white/10">
                                <label className="block text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    AIと一緒にプランを練り直す
                                </label>
                                <div className="flex gap-2">
                                    <textarea
                                        value={refinementText}
                                        onChange={(e) => {
                                            setRefinementText(e.target.value)
                                            e.target.style.height = 'auto'
                                            e.target.style.height = e.target.scrollHeight + 'px'
                                        }}
                                        placeholder="例：もっと短期間で達成したい、予算を抑えたい、など..."
                                        rows={1}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors resize-none overflow-hidden min-h-[44px] max-h-[200px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleRefine(e)
                                            }
                                        }}
                                        style={{ fieldSizing: 'content' }}
                                    />
                                    <button
                                        onClick={handleRefine}
                                        disabled={!refinementText.trim() || isRefining}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-white"
                                    >
                                        送信
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Target className="w-5 h-5" />
                                このプランでプロジェクトを開始
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
