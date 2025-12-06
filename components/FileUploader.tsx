"use client"

import { useState, useRef } from "react"
import { Upload, X, File as FileIcon, Loader2, Paperclip } from "lucide-react"

interface FileUploaderProps {
    taskId: string
    onUploadComplete: (attachment: any) => void
}

export function FileUploader({ taskId, onUploadComplete }: FileUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        setIsUploading(true)

        const formData = new FormData()
        formData.append("file", file)

        try {
            // 1. Upload file to storage
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!uploadRes.ok) throw new Error("Upload failed")

            const uploadData = await uploadRes.json()

            // 2. Create attachment record
            const attachRes = await fetch(`/api/tasks/${taskId}/attachments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: uploadData.name,
                    url: uploadData.url,
                    size: uploadData.size,
                    type: uploadData.type,
                }),
            })

            if (!attachRes.ok) throw new Error("Failed to save attachment")

            const newAttachment = await attachRes.json()
            onUploadComplete(newAttachment)

        } catch (error) {
            console.error("Upload error:", error)
            alert("アップロードに失敗しました")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Paperclip className="w-4 h-4" />
                )}
                <span>{isUploading ? "アップロード中..." : "ファイルを添付"}</span>
            </button>
        </div>
    )
}
