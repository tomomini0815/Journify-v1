"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mic, PenTool, Square, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import VoiceJournalRecorder from "./VoiceJournalRecorder"

interface VoiceRecordingSectionProps {
    projects?: Array<{ id: string; title: string }>
}

export default function VoiceRecordingSection({ projects: initialProjects }: VoiceRecordingSectionProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"journal" | "meeting">("journal")

    // Project Selection & Creation State
    const [projects, setProjects] = useState(initialProjects || [])
    const [selectedProjectId, setSelectedProjectId] = useState<string | "create-new">(
        initialProjects?.[0]?.id || ""
    )
    const [newProjectTitle, setNewProjectTitle] = useState("")

    // Recording State
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [transcript, setTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const recognitionRef = useRef<any>(null)

    // Setup Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = "ja-JP"

            recognition.onresult = (event: any) => {
                let interim = ""
                let final = ""
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        final += transcriptPart
                    } else {
                        interim += transcriptPart
                    }
                }
                if (final) setTranscript(prev => prev + final)
                setInterimTranscript(interim)
            }

            recognitionRef.current = recognition
        }
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop()
        }
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)
            setTranscript("")
            setInterimTranscript("")

            if (recognitionRef.current) recognitionRef.current.start()

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

        } catch (error) {
            console.error("Failed to start recording:", error)
            alert("マイクへのアクセスが拒否されました")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
            if (recognitionRef.current) recognitionRef.current.stop()
        }
    }

    const cancelRecording = () => {
        setAudioBlob(null)
        setTranscript("")
        setInterimTranscript("")
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleSave = async () => {
        if (!audioBlob) return
        setIsProcessing(true)

        try {
            // 1. Determine Target Project
            let targetProjectId = selectedProjectId

            if (targetProjectId === "create-new") {
                // Default title logic
                const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
                const titleToUse = newProjectTitle.trim() || `無題のプロジェクト ${today}`

                // Create Project
                const createProjRes = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: titleToUse })
                })

                if (!createProjRes.ok) throw new Error("Failed to create project")

                const newProject = await createProjRes.json()
                targetProjectId = newProject.id
            }

            // 2. Upload Audio
            const formData = new FormData()
            formData.append("file", audioBlob, "meeting-recording.webm")
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
            if (!uploadRes.ok) throw new Error("Failed to upload audio")
            const uploadData = await uploadRes.json()

            // 3. Transcribe
            const transcribeRes = await fetch(`/api/projects/${targetProjectId}/meetings/transcribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audioPath: uploadData.filepath })
            })
            const transcribeData = transcribeRes.ok ? await transcribeRes.json() : {
                title: "新しい議事録",
                content: "自動要約に失敗しました",
                transcript: transcript
            }

            // 4. Create Meeting Log
            const now = new Date()
            // Adjust to local time ISO string manually or just use standard ISO (API handles it?) 
            // Better to standard ISO for the API
            const isoDate = now.toISOString()

            const createMeetingRes = await fetch(`/api/projects/${targetProjectId}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: transcribeData.title || "議事録",
                    date: isoDate,
                    content: transcribeData.content,
                    audioUrl: uploadData.url,
                    transcript: transcribeData.transcript || transcript
                })
            })

            if (!createMeetingRes.ok) throw new Error("Failed to create meeting log")

            // 5. Redirect
            router.push(`/projects/${targetProjectId}?tab=meetings`)

        } catch (error) {
            console.error("Save failed:", error)
            alert("保存に失敗しました")
        } finally {
            setIsProcessing(false)
        }
    }

    const isCreateMode = selectedProjectId === "create-new"

    return (
        <div className="mb-4">
            {/* Tab Switcher */}
            <div className="mb-2">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab("journal")}
                        className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === "journal"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Mic className="w-4 h-4" />
                        <span>ジャーナル記録</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("meeting")}
                        className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeTab === "meeting"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Mic className="w-4 h-4" />
                        <span>議事録</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === "journal" ? (
                    <VoiceJournalRecorder compact={true} />
                ) : (
                    <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] border border-white/5 p-6 shadow-2xl">
                        {/* Background ambient glow - Blue/Cyan theme for Meetings */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10" />

                        <div className="relative z-10 flex items-center gap-6">

                            {/* Left Side: Info & Controls */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">議事録を録音して要約</h3>

                                {/* Project Selection */}
                                <div className="max-w-xs mb-3">
                                    <label className="block text-white/70 text-xs font-medium mb-1">
                                        プロジェクトを選択
                                    </label>
                                    <select
                                        value={selectedProjectId}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all hover:bg-white/15"
                                        disabled={isRecording || isProcessing}
                                    >
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id} className="bg-gray-900 text-white">
                                                {project.title}
                                            </option>
                                        ))}
                                        <option value="create-new" className="bg-gray-900 text-cyan-400 font-bold">
                                            + 新規プロジェクト作成
                                        </option>
                                    </select>

                                    {/* Create New Project Input */}
                                    <AnimatePresence>
                                        {isCreateMode && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="新しいプロジェクト名 (未入力で自動設定)"
                                                    value={newProjectTitle}
                                                    onChange={(e) => setNewProjectTitle(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg bg-cyan-900/40 border border-cyan-500/30 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                    disabled={isRecording || isProcessing}
                                                    autoFocus
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Timer & Status */}
                                {isRecording ? (
                                    <div className="mb-4">
                                        <div className="text-3xl font-bold text-white mb-1 tabular-nums">
                                            {formatTime(recordingTime)}
                                        </div>
                                        <div className="text-white/60 text-sm animate-pulse">
                                            録音中... {transcript && "聞き取っています"}
                                        </div>
                                    </div>
                                ) : audioBlob && (
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-white font-medium bg-white/10 px-3 py-1 rounded-lg">
                                            {formatTime(recordingTime)} 録音完了
                                        </div>
                                        <button
                                            onClick={cancelRecording}
                                            className="text-sm text-red-400 hover:text-red-300 underline"
                                            disabled={isProcessing}
                                        >
                                            破棄する
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Action Buttons */}
                            <div className="relative flex flex-col items-center gap-4">
                                {audioBlob && !isRecording ? (
                                    <button
                                        onClick={handleSave}
                                        disabled={isProcessing}
                                        className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed group min-w-[180px]"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                <span className="text-white font-bold">処理中...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-6 h-6 text-white" />
                                                <div className="flex flex-col items-start">
                                                    <span className="text-white font-bold leading-none">
                                                        {isCreateMode ? "作成して保存" : "議事録を保存"}
                                                    </span>
                                                    <span className="text-white/60 text-[10px] font-medium mt-1">
                                                        AI要約を作成
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ) : (
                                    <div className="relative">
                                        {isRecording && (
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-cyan-500 rounded-full blur-md"
                                            />
                                        )}
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isProcessing}
                                            className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${isRecording
                                                ? "bg-red-500 hover:bg-red-600 shadow-red-500/40"
                                                : "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/20"
                                                } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            {isRecording ? (
                                                <Square className="w-8 h-8 text-white fill-current" />
                                            ) : (
                                                <Mic className="w-6 h-6 text-white" strokeWidth={2.5} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transcript Preview */}
                        <AnimatePresence>
                            {(transcript || interimTranscript) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-6 bg-black/20 rounded-xl p-4 border border-white/5"
                                >
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        {transcript}
                                        <span className="text-white/40">{interimTranscript}</span>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}
