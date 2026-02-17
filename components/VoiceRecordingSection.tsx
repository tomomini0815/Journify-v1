"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mic, Square, Loader2, CheckCircle2, FileText, X, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import VoiceJournalRecorder from "./VoiceJournalRecorder"


interface VoiceRecordingSectionProps {
    projects?: Array<{ id: string; title: string }>
}

// --- Anti-hallucination: known hallucinated phrases from SpeechRecognition ---
const HALLUCINATION_PATTERNS = [
    /^(はい、?)?承知(いた)?しました。?$/,
    /^ご視聴ありがとうございました。?$/,
    /^チャンネル登録.*$/,
    /^(お疲れ様でした|ありがとうございました)。?$/,
    /^(ご覧いただき)?ありがとうございます。?$/,
    /^(次回も)?お楽しみに。?$/,
    /^最後まで.*ありがとう.*$/,
    /^字幕.*$/,
    /^MBS.*$/,
]

function isHallucination(text: string): boolean {
    const trimmed = text.trim()
    if (!trimmed) return true
    for (const pattern of HALLUCINATION_PATTERNS) {
        if (pattern.test(trimmed)) return true
    }
    return false
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
    const speechRecognitionRef = useRef<any>(null)
    const [isAndroid, setIsAndroid] = useState(false)
    const [diagnostics, setDiagnostics] = useState<string[]>([])

    // Android detection
    useEffect(() => {
        const ua = navigator.userAgent || ''
        if (/android/i.test(ua)) setIsAndroid(true)
    }, [])

    // --- Gemini Live Hook (Android Only) ---
    // --- Gemini Live Hook (Android Only) ---
    // --- Gemini Live Hook REMOVED ---


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (speechRecognitionRef.current) {
                try { speechRecognitionRef.current.stop() } catch (e) { }
            }
        }
    }, [])

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        const entry = `[${time}] ${msg}`;
        console.log(`[MeetingRecorder] ${entry}`)
        setDiagnostics(prev => [...prev.slice(-4), entry]);
    }

    const startRecording = async (options?: { isResuming?: boolean }) => {
        const isResuming = options?.isResuming || false
        // Security check
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            alert('マイクはHTTPS接続またはlocalhostでのみ使用可能です。')
            return
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('お使いのブラウザはマイク録音をサポートしていません。')
            return
        }

        try {
            addLog("🎙️ requesting getUserMedia...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            addLog("✅ stream granted");

            let mimeType = "audio/webm";
            if (MediaRecorder.isTypeSupported("audio/mp4")) {
                mimeType = "audio/mp4";
            } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                mimeType = "audio/webm;codecs=opus";
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            if (!isResuming) {
                chunksRef.current = [];
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const rawBlob = new Blob(chunksRef.current, { type: mimeType });
                addLog(`📦 Meeting MediaRecorder stopped. Chunks: ${chunksRef.current.length}, Size: ${Math.round(rawBlob.size / 1024)} KB`);
                setAudioBlob(rawBlob);

                stream.getTracks().forEach(track => track.stop());

                if (speechRecognitionRef.current) {
                    try { speechRecognitionRef.current.stop(); } catch (e) { }
                }
            };

            // Start MediaRecorder
            mediaRecorder.start(15000);

            // Start Transcription (Hybrid Strategy)
            // Start Transcription (Unified Web Speech API)
            // if (isAndroid) { ... } // Removed Gemini Live support

            // Start Web Speech API
            const SpeechRecognitionWeb = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionWeb) {
                try {
                    const recognition = new SpeechRecognitionWeb();
                    recognition.lang = 'ja-JP';
                    recognition.continuous = true;
                    recognition.interimResults = true;

                    recognition.onresult = (event: any) => {
                        let interim = '';
                        let finalText = '';

                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
                            else interim += event.results[i][0].transcript;
                        }

                        if (finalText) setTranscript(prev => prev + finalText + ' ');
                        setInterimTranscript(interim);
                    };

                    recognition.onerror = (event: any) => {
                        console.warn('SpeechRecognition error:', event.error);
                    };

                    recognition.onend = () => {
                        if (isRecording) {
                            try { recognition.start(); } catch (e) { }
                        }
                    };

                    speechRecognitionRef.current = recognition;
                    recognition.start();
                } catch (error) {
                    console.error('Failed to init SpeechRecognition:', error);
                    setInterimTranscript('(リアルタイム文字起こしは利用できません。録音は正常に動作します。)');
                }
            }


            setIsRecording(true);
            if (!isResuming) {
                setRecordingTime(0);
                setTranscript("");
            }
            setInterimTranscript("");

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error: any) {
            console.error("Failed to start recording:", error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                alert('マイクへのアクセスが拒否されました。ブラウザの設定からマイクを許可してください。');
            } else if (error.name === 'NotFoundError') {
                alert('マイクが見つかりませんでした。');
            } else {
                alert(`録音を開始できませんでした: ${error.message}`);
            }
        }
    };

    const stopRecording = () => {
        addLog("🛑 stopRecording requested");

        if (timerRef.current) {
            clearInterval(timerRef.current as any);
            timerRef.current = null;
        }



        if (mediaRecorderRef.current && isRecording) {
            addLog("🎥 stopping MediaRecorder");
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);

        if (speechRecognitionRef.current) {
            try { speechRecognitionRef.current.stop(); } catch (e) { }
            speechRecognitionRef.current = null;
        }
    };

    const cancelRecording = () => {
        setAudioBlob(null)
        setTranscript("")
        setInterimTranscript("")
        setRecordingTime(0)
    }

    const resumeRecording = async () => {
        await startRecording({ isResuming: true })
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
            let targetProjectId = selectedProjectId

            if (targetProjectId === "create-new") {
                const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
                const titleToUse = newProjectTitle.trim() || `無題のプロジェクト ${today}`

                const createProjRes = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: titleToUse })
                })

                if (!createProjRes.ok) throw new Error("Failed to create project")
                const newProject = await createProjRes.json()
                targetProjectId = newProject.id
            }

            const mimeType = audioBlob.type
            let ext = "webm"
            if (mimeType.includes("mp4")) ext = "mp4"
            else if (mimeType.includes("wav")) ext = "wav"

            addLog(`🚀 Uploading meeting: ${Math.round(audioBlob.size / 1024)} KB (${ext})`)
            const formData = new FormData()
            formData.append("file", audioBlob, `meeting-recording.${ext}`)
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
            if (!uploadRes.ok) throw new Error("Failed to upload audio")
            addLog("✅ Upload success. Transcribing meeting...")
            const uploadData = await uploadRes.json()

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

            const isoDate = new Date().toISOString()

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
            const createdMeeting = await createMeetingRes.json()
            router.push(`/projects/${targetProjectId}?tab=meetings&meetingId=${createdMeeting.id}`)

        } catch (error) {
            console.error("Save failed:", error)
            alert("保存に失敗しました")
        } finally {
            setIsProcessing(false)
        }
    }

    const isCreateMode = selectedProjectId === "create-new"
    const hasTranscript = transcript || interimTranscript

    return (
        <div className="mb-4">
            {/* Tab Switcher */}
            <div className="mb-3">
                <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab("journal")}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${activeTab === "journal"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            }`}
                    >
                        <Mic className="w-3.5 h-3.5" />
                        <span>ジャーナル記録</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("meeting")}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${activeTab === "meeting"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>議事録</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === "journal" ? (
                    <VoiceJournalRecorder compact={true} />
                ) : (
                    <div className="relative overflow-hidden rounded-2xl bg-[#0c1425] border border-white/[0.06] shadow-2xl">
                        {/* Ambient Glow */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/[0.04] rounded-full blur-[80px]" />
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/[0.04] rounded-full blur-[80px]" />

                        {/* Main Content */}
                        <div className="relative z-10 p-5 sm:p-6">

                            {/* Header */}
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-white/90 tracking-tight">
                                        議事録を録音
                                    </h3>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isRecording ? (
                                        <>
                                            <div className="text-cyan-400 font-mono font-bold text-lg tabular-nums">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <button
                                                onClick={stopRecording}
                                                className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                            >
                                                <Square className="w-4 h-4 fill-current" />
                                            </button>
                                        </>
                                    ) : audioBlob ? (
                                        <button
                                            onClick={() => resumeRecording()}
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/40 rounded-full transition-all disabled:opacity-40 whitespace-nowrap border border-cyan-500/30"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            <span>録音を再開</span>
                                        </button>
                                    ) : (
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => startRecording()}
                                            className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all"
                                        >
                                            <Mic className="w-5 h-5 text-white" strokeWidth={2.5} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                            <p className="text-white/40 text-xs mb-4">
                                {isRecording ? "会議の音声を聴いています..." : "マイクボタンをタップして開始してください"}
                            </p>

                            {/* Recording Timer */}
                            <AnimatePresence>
                                {isRecording && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="mb-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.2, repeat: Infinity }}
                                                className="w-2 h-2 rounded-full bg-red-500"
                                            />
                                            <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-wider">
                                                {formatTime(recordingTime)}
                                            </span>
                                            <span className="text-xs text-white/30">REC</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Project Selection */}
                            <div className="mb-4">
                                <label className="block text-white/40 text-[11px] font-medium uppercase tracking-wider mb-1.5">
                                    保存先プロジェクト
                                </label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all hover:bg-white/[0.08] appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={isRecording || isProcessing}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                                >
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id} className="bg-gray-900 text-white">
                                            {project.title}
                                        </option>
                                    ))}
                                    <option value="create-new" className="bg-gray-900 text-cyan-400">
                                        ＋ 新規プロジェクト作成
                                    </option>
                                </select>

                                <AnimatePresence>
                                    {isCreateMode && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <input
                                                type="text"
                                                placeholder="プロジェクト名（未入力で自動設定）"
                                                value={newProjectTitle}
                                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                                className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 text-white text-sm placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                                disabled={isRecording || isProcessing}
                                                autoFocus
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Transcript Area */}
                            <AnimatePresence>
                                {(hasTranscript || audioBlob) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-3 h-3 text-white/30" />
                                            <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                                                文字起こし
                                            </span>
                                            {isRecording && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="text-[10px] text-cyan-400/60 font-medium"
                                                >
                                                    LIVE
                                                </motion.span>
                                            )}
                                        </div>
                                        <div className={`relative rounded-xl bg-white/[0.03] border overflow-hidden transition-all ${!isRecording && audioBlob ? "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "border-white/[0.05]"
                                            }`}>
                                            {isRecording ? (
                                                <div className="pt-1.5 px-3.5 pb-3.5 max-h-40 overflow-y-auto">
                                                    <p className="text-white/70 text-sm leading-relaxed break-words">
                                                        {transcript}
                                                        {interimTranscript && (
                                                            <span className="text-cyan-400/40">{interimTranscript}</span>
                                                        )}
                                                        {!transcript && !interimTranscript && (
                                                            <span className="text-white/25 italic">録音中… 音声を認識しています</span>
                                                        )}
                                                    </p>
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={transcript}
                                                    onChange={(e) => setTranscript(e.target.value)}
                                                    placeholder="テキストを入力または録音してください"
                                                    className="w-full p-3.5 bg-transparent text-white/70 text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/30 rounded-xl placeholder:text-white/20 placeholder:italic min-h-[100px] max-h-[200px]"
                                                    rows={5}
                                                />
                                            )}
                                            {!isRecording && transcript && (
                                                <span className="absolute bottom-2 right-3 text-[10px] text-white/20 pointer-events-none">✏️ 編集可能</span>
                                            )}
                                        </div>

                                        {/* Resume Recording Button removed per user request */}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons: Cancel + Save (2-column grid) */}
                            <AnimatePresence>
                                {!isRecording && audioBlob && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        <button
                                            onClick={cancelRecording}
                                            disabled={isProcessing}
                                            className="py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] font-bold text-sm text-white/70 hover:bg-white/[0.1] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>キャンセル</span>
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSave}
                                            disabled={isProcessing}
                                            className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-sm text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>作成中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>{isCreateMode ? "作成して保存" : "議事録を保存"}</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
