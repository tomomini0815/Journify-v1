"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Sparkles, Upload, ExternalLink, X, FileText, Plus } from "lucide-react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function NanobananaProPage() {
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (files.length === 0) return
        setIsUploading(true)

        try {
            // Convert files to base64 for simplified saving
            const promises = files.map(async (file) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(file)
                })
            })

            const base64Files = await Promise.all(promises)

            // Save to Vision Board
            const saveRes = await fetch("/api/vision-board", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "image",
                    content: base64Files[0], // Saving first image for now, or could loop
                    metadata: { source: "Gemini-External-Upload", timestamp: new Date().toISOString() }
                })
            })

            if (saveRes.ok) {
                alert("ビジョンボードに保存しました！🎨")
                setFiles([])
            } else {
                throw new Error("Failed to save")
            }
        } catch (error) {
            console.error("Error:", error)
            alert("保存に失敗しました。")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6 p-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-200">Nanobanana Pro</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-blue-200 to-emerald-200 mb-2">
                        Gemini AI Studio
                    </h1>
                    <p className="text-white/60">
                        AIでアイデアを生成し、ビジョンボードにコレクションしましょう
                    </p>
                </motion.div>

                {/* Step 1: External Link */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="mb-6 p-4 bg-indigo-500/20 rounded-full group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-12 h-12 text-indigo-300" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">Step 1: AIで画像を生成</h2>
                    <p className="text-white/70 max-w-md mb-8">
                        Google Geminiの公式サイトで、あなたの想像力を形にしましょう。
                        生成した画像はダウンロードしてください。
                    </p>

                    <Button
                        asChild
                        className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-500 hover:via-blue-500 hover:to-emerald-500 text-white rounded-xl px-8 h-12 text-lg shadow-lg shadow-indigo-500/20"
                    >
                        <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">
                            Geminiを開く <ExternalLink className="ml-2 w-5 h-5" />
                        </a>
                    </Button>
                </motion.div>

                {/* Step 2: Upload */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col"
                >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-emerald-400" />
                        Step 2: 生成した画像を保存
                    </h2>

                    <div className="flex-1 flex flex-col">
                        {/* File Drop/Select Area */}
                        {files.length === 0 ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all"
                            >
                                <Plus className="w-10 h-10 text-white/30 mb-2" />
                                <p className="text-white/50 text-sm">クリックして画像をアップロード</p>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {files.map((file, index) => (
                                    <div key={index} className="relative w-32 h-32 bg-black/20 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white/70 hover:text-white hover:bg-red-500/50"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-32 h-32 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 flex-shrink-0"
                                >
                                    <Plus className="w-6 h-6 text-white/30" />
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={files.length === 0 || isUploading}
                                className="bg-white/10 hover:bg-white/20 text-white"
                            >
                                {isUploading ? "保存中..." : "ビジョンボードに保存"}
                            </Button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </DashboardLayout>
    )
}
