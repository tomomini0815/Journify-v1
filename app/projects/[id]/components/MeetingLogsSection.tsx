// Meeting Logs Component - to be integrated into the main page
// This is a reference implementation that will be added to the project details page

const MeetingLogsSection = () => {
    // Recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
        } catch (error) {
            console.error("録音開始エラー:", error)
            alert("マイクへのアクセスが拒否されました")
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
            setIsRecording(false)
        }
    }

    const handleAITranscribe = async () => {
        if (!audioBlob) {
            alert("音声ファイルがありません")
            return
        }

        setIsTranscribing(true)
        try {
            // Upload audio file
            const formData = new FormData()
            formData.append("file", audioBlob, "recording.webm")

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) throw new Error("アップロード失敗")

            const uploadData = await uploadRes.json()

            // Transcribe with AI
            const transcribeRes = await fetch(`/api/projects/${params.id}/meetings/transcribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audioUrl: uploadData.url })
            })

            if (!transcribeRes.ok) throw new Error("AI要約失敗")

            const transcribeData = await transcribeRes.json()

            setNewMeeting({
                ...newMeeting,
                title: transcribeData.title,
                content: transcribeData.content,
                audioUrl: uploadData.url,
                transcript: transcribeData.transcript
            })
        } catch (error) {
            console.error("AI要約エラー:", error)
            alert("AI要約に失敗しました")
        } finally {
            setIsTranscribing(false)
        }
    }

    const createMeetingLog = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`/api/projects/${params.id}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMeeting)
            })

            if (res.ok) {
                await fetchProject()
                setShowMeetingModal(false)
                setNewMeeting({ title: "", date: "", content: "", audioUrl: "", transcript: "" })
                setAudioBlob(null)
            }
        } catch (error) {
            console.error("議事録作成エラー:", error)
        }
    }

    const deleteMeetingLog = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${params.id}/meetings/${id}`, {
                method: "DELETE"
            })

            if (res.ok) {
                await fetchProject()
            }
        } catch (error) {
            console.error("議事録削除エラー:", error)
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">議事録一覧</h3>
                <button
                    onClick={() => {
                        setNewMeeting({ title: "", date: new Date().toISOString().split('T')[0], content: "", audioUrl: "", transcript: "" })
                        setShowMeetingModal(true)
                    }}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    新規作成
                </button>
            </div>

            {project.meetingLogs && project.meetingLogs.length > 0 ? (
                <div className="space-y-4">
                    {project.meetingLogs.map((log) => (
                        <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-white">{log.title}</h4>
                                    <p className="text-sm text-white/60">{new Date(log.date).toLocaleDateString('ja-JP')}</p>
                                </div>
                                <button
                                    onClick={() => deleteMeetingLog(log.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                            <p className="text-white/80 whitespace-pre-wrap mb-3">{log.content}</p>
                            {log.audioUrl && (
                                <audio controls className="w-full mt-2">
                                    <source src={log.audioUrl} type="audio/webm" />
                                </audio>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-white/40">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>議事録がまだありません</p>
                </div>
            )}
        </div>
    )
}

export default MeetingLogsSection
