"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CheckSquare, List, BarChart3, Flag, MessageSquare, Send } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { isHoliday } from "@/lib/holidays"

type Milestone = {
    id: string
    title: string
    date: string
    completed: boolean
}

type Task = {
    id: string
    text: string
    description?: string
    status: string
    priority: string
    completed: boolean
    color?: string
    createdAt: string
    startDate?: string
    endDate?: string
}

type Comment = {
    id: string
    content: string
    authorName: string
    createdAt: string
}

type Project = {
    id: string
    title: string
    description: string
    status: string
    startDate: string
    endDate: string
    milestones: Milestone[]
    tasks: Task[]
    isShared: boolean
    readOnly: boolean
}

export default function SharedProjectPage() {
    const params = useParams()
    const [project, setProject] = useState<Project | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState("")
    const [authorName, setAuthorName] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'list' | 'timeline' | 'comments'>('list')

    useEffect(() => {
        const fetchSharedProject = async () => {
            try {
                const res = await fetch(`/api/shared/${params.shareToken}`)

                if (!res.ok) {
                    if (res.status === 404) {
                        setError("このプロジェクトは共有されていないか、削除されました。")
                    } else {
                        setError("プロジェクトの読み込みに失敗しました。")
                    }
                    setIsLoading(false)
                    return
                }

                const data = await res.json()
                setProject(data)

                // Fetch comments
                const commentsRes = await fetch(`/api/shared/${params.shareToken}/comments`)
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json()
                    setComments(commentsData)
                }
            } catch (error) {
                console.error("Failed to fetch shared project:", error)
                setError("プロジェクトの読み込みに失敗しました。")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSharedProject()
    }, [params.shareToken])

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !authorName.trim()) return

        setIsSubmittingComment(true)
        try {
            const res = await fetch(`/api/shared/${params.shareToken}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment,
                    authorName: authorName
                }),
            })

            if (res.ok) {
                const comment = await res.json()
                setComments([comment, ...comments])
                setNewComment("")
            }
        } catch (error) {
            console.error("Failed to submit comment:", error)
        } finally {
            setIsSubmittingComment(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-white text-xl">読み込み中...</div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">プロジェクトが見つかりません</h2>
                    <p className="text-white/60 mb-6">{error}</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors text-white font-medium">
                        ホームに戻る
                    </Link>
                </div>
            </div>
        )
    }

    const todoTasks = project.tasks.filter(t => t.status === 'todo')
    const inProgressTasks = project.tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress')
    const doneTasks = project.tasks.filter(t => t.status === 'done')

    // Timeline calculations
    const startDate = project.startDate ? new Date(project.startDate) : new Date()
    const endDate = project.endDate ? new Date(project.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dayWidth = 50

    const getDaysBetween = (start: Date, end: Date) => {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 text-white/60 mb-4 px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl">
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-sm">共有プロジェクト（読み取り専用）</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                    <p className="text-white/60">{project.description}</p>
                </div>

                {/* Main Content */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
                    {/* Tabs */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'list'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                        : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                <span>リスト</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'timeline'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                        : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>タイムライン</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('comments')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'comments'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                        : 'text-white/60 hover:bg-white/5'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>コメント</span>
                            </button>
                        </div>
                    </div>

                    {/* List View */}
                    {activeTab === 'list' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Todo Column */}
                                <div className="bg-[#1a1a1a] border-2 border-blue-500/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                        <span>未着手</span>
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{todoTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {todoTasks.map(task => (
                                            <div key={task.id} className="bg-white/5 border rounded-xl p-4">
                                                <h4 className="font-medium text-white text-sm mb-2">{task.text}</h4>
                                                {task.description && (
                                                    <div className="text-xs text-white/60 prose prose-invert prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {todoTasks.length === 0 && (
                                            <div className="text-center py-8 text-white/20 text-sm">タスクなし</div>
                                        )}
                                    </div>
                                </div>

                                {/* In Progress Column */}
                                <div className="bg-[#1a1a1a] border-2 border-yellow-500/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                        <span>進行中</span>
                                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">{inProgressTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {inProgressTasks.map(task => (
                                            <div key={task.id} className="bg-white/5 border rounded-xl p-4">
                                                <h4 className="font-medium text-white text-sm mb-2">{task.text}</h4>
                                                {task.description && (
                                                    <div className="text-xs text-white/60 prose prose-invert prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {inProgressTasks.length === 0 && (
                                            <div className="text-center py-8 text-white/20 text-sm">タスクなし</div>
                                        )}
                                    </div>
                                </div>

                                {/* Done Column */}
                                <div className="bg-[#1a1a1a] border-2 border-emerald-500/50 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                                        <span>完了</span>
                                        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{doneTasks.length}</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {doneTasks.map(task => (
                                            <div key={task.id} className="bg-white/5 border rounded-xl p-4">
                                                <h4 className="font-medium text-white text-sm mb-2">{task.text}</h4>
                                                {task.description && (
                                                    <div className="text-xs text-white/60 prose prose-invert prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        {doneTasks.length === 0 && (
                                            <div className="text-center py-8 text-white/20 text-sm">タスクなし</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Milestones */}
                            {project.milestones.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-400" />
                                        マイルストーン
                                    </h3>
                                    <div className="space-y-2">
                                        {project.milestones.map(milestone => (
                                            <div key={milestone.id} className="bg-white/5 border rounded-xl p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-white">{milestone.title}</h4>
                                                    <p className="text-sm text-white/60">{new Date(milestone.date).toLocaleDateString('ja-JP')}</p>
                                                </div>
                                                {milestone.completed && (
                                                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                                                        完了
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline View */}
                    {activeTab === 'timeline' && (
                        <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
                            {/* Sidebar */}
                            <div className="w-64 flex-shrink-0 border-r border-white/10 overflow-y-auto bg-[#0d0d0d]">
                                <div className="p-4">
                                    <h3 className="text-sm font-bold text-white/60 mb-3">タスク & マイルストーン</h3>

                                    {/* Milestones Section */}
                                    {project.milestones.length > 0 && (
                                        <div className="mb-4">
                                            <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-2">
                                                <Flag className="w-3 h-3" />
                                                マイルストーン
                                            </div>
                                            {project.milestones.map(milestone => (
                                                <div key={milestone.id} className="h-10 border-b border-white/5 flex items-center px-2 hover:bg-white/5 transition-colors bg-amber-500/5">
                                                    <Flag className="w-3 h-3 text-amber-400 mr-2 flex-shrink-0" />
                                                    <span className="text-sm truncate text-amber-200 flex-1">{milestone.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tasks Section */}
                                    {project.tasks.filter(t => t.startDate && t.endDate).length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                                                <CheckSquare className="w-3 h-3" />
                                                タスク
                                            </div>
                                            {project.tasks.filter(t => t.startDate && t.endDate).map(task => (
                                                <div key={task.id} className="h-10 border-b border-white/5 flex items-center px-2 hover:bg-white/5 transition-colors">
                                                    <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: task.color || '#6366f1' }} />
                                                    <span className="text-sm truncate text-white/80">{task.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline Content */}
                            <div className="flex-1 overflow-x-auto overflow-y-auto" id="timeline-scroll-container">
                                <div className="min-w-max p-6">
                                    {/* Timeline Header */}
                                    <div className="flex mb-4 sticky top-0 bg-[#1a1a1a] z-10 pb-2">
                                        <div className="flex">
                                            {Array.from({ length: totalDays }, (_, i) => {
                                                const date = new Date(startDate)
                                                date.setDate(date.getDate() + i)
                                                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                const isHol = isHoliday(date)

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex-shrink-0 border-r flex flex-col items-center justify-center text-xs py-2 ${isHol ? 'bg-red-500/5 border-red-500/30 text-red-300' :
                                                                isWeekend ? 'bg-blue-500/5 border-blue-500/30 text-blue-300' :
                                                                    'border-white/5 text-white/60'
                                                            }`}
                                                        style={{ width: `${dayWidth}px` }}
                                                    >
                                                        <div>{date.getMonth() + 1}/{date.getDate()}</div>
                                                        <div className="text-[10px]">
                                                            {['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Milestones Row */}
                                    {project.milestones.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex items-center mb-2">
                                                <div className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                                                    <Flag className="w-4 h-4" />
                                                    マイルストーン
                                                </div>
                                            </div>
                                            <div className="relative" style={{ height: '60px' }}>
                                                <div className="absolute inset-0 flex">
                                                    {Array.from({ length: totalDays }, (_, i) => {
                                                        const date = new Date(startDate)
                                                        date.setDate(date.getDate() + i)
                                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                        const isHol = isHoliday(date)

                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`flex-shrink-0 border-r ${isHol ? 'bg-red-500/5 border-red-500/30' :
                                                                        isWeekend ? 'bg-blue-500/5 border-blue-500/30' :
                                                                            'border-white/5'
                                                                    }`}
                                                                style={{ width: `${dayWidth}px` }}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                                {project.milestones.map(milestone => {
                                                    const milestoneDate = new Date(milestone.date)
                                                    const offset = getDaysBetween(startDate, milestoneDate)

                                                    if (offset < 0 || offset > totalDays) return null

                                                    return (
                                                        <div
                                                            key={milestone.id}
                                                            className="absolute top-4 flex flex-col items-center"
                                                            style={{ left: `${offset * dayWidth + dayWidth / 2}px`, transform: 'translateX(-50%)' }}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full ${milestone.completed ? 'bg-emerald-500' : 'bg-amber-500'} border-2 border-white shadow-lg`}></div>
                                                            <div className="text-xs text-white/90 mt-2 whitespace-nowrap bg-black/50 px-2 py-1 rounded">{milestone.title}</div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tasks Section */}
                                    {project.tasks.filter(t => t.startDate && t.endDate).length > 0 && (
                                        <div>
                                            <div className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-3">
                                                <CheckSquare className="w-4 h-4" />
                                                タスク
                                            </div>
                                            <div className="space-y-1">
                                                {project.tasks.filter(t => t.startDate && t.endDate).map(task => {
                                                    const taskStart = new Date(task.startDate!)
                                                    const taskEnd = new Date(task.endDate!)
                                                    const offset = getDaysBetween(startDate, taskStart)
                                                    const duration = getDaysBetween(taskStart, taskEnd)

                                                    if (offset + duration < 0 || offset > totalDays) return null

                                                    return (
                                                        <div key={task.id} className="relative" style={{ height: '40px' }}>
                                                            <div className="absolute inset-0 flex">
                                                                {Array.from({ length: totalDays }, (_, i) => {
                                                                    const date = new Date(startDate)
                                                                    date.setDate(date.getDate() + i)
                                                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                                    const isHol = isHoliday(date)

                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className={`flex-shrink-0 border-r ${isHol ? 'bg-red-500/5 border-red-500/30' :
                                                                                    isWeekend ? 'bg-blue-500/5 border-blue-500/30' :
                                                                                        'border-white/5'
                                                                                }`}
                                                                            style={{ width: `${dayWidth}px` }}
                                                                        />
                                                                    )
                                                                })}
                                                            </div>
                                                            <div
                                                                className="absolute top-2 h-7 rounded-lg flex items-center px-3 text-sm text-white font-medium shadow-lg"
                                                                style={{
                                                                    left: `${Math.max(0, offset) * dayWidth}px`,
                                                                    width: `${duration * dayWidth}px`,
                                                                    backgroundColor: task.color || '#6366f1'
                                                                }}
                                                                title={task.text}
                                                            >
                                                                <span className="truncate">{task.text}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments View */}
                    {activeTab === 'comments' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {comments.map(comment => (
                                    <div key={comment.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-emerald-400">{comment.authorName}</span>
                                            <span className="text-xs text-white/40">
                                                {new Date(comment.createdAt).toLocaleString('ja-JP')}
                                            </span>
                                        </div>
                                        <p className="text-white/80 whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center py-12 text-white/20">
                                        コメントはまだありません。
                                        <br />
                                        最初のコメントを投稿しましょう！
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-[#1a1a1a]">
                                <form onSubmit={handleSubmitComment} className="space-y-4 max-w-2xl mx-auto">
                                    <div>
                                        <label htmlFor="authorName" className="block text-sm font-medium text-white/60 mb-1">
                                            お名前
                                        </label>
                                        <input
                                            type="text"
                                            id="authorName"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                                            placeholder="名前を入力"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="comment" className="block text-sm font-medium text-white/60 mb-1">
                                            コメント
                                        </label>
                                        <textarea
                                            id="comment"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 h-24 resize-none"
                                            placeholder="コメントを入力..."
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingComment}
                                            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-white font-medium"
                                        >
                                            {isSubmittingComment ? (
                                                '送信中...'
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    送信
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
