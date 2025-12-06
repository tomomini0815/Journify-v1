"use client"

import React, { useState, useEffect } from 'react'
import { FileText, Grid, List, Upload, X, Eye, Download, Trash2, File } from 'lucide-react'

// Simple helper types
type ProjectDocument = {
    id: string
    name: string
    type: string
    url: string
    size: number
    createdAt: string
}

export default function DocumentsView({ projectId }: { projectId: string }) {
    const [documents, setDocuments] = useState<ProjectDocument[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isUploading, setIsUploading] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null)
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        fetchDocuments()
    }, [projectId])

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/documents`)
            if (res.ok) {
                const data = await res.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const file = files[0]
        if (file.size > 2 * 1024 * 1024) { // 2MB limit for DB storage
            alert("ファイルサイズが大きすぎます (最大 2MB)")
            return
        }

        setIsUploading(true)

        // Convert to Base64
        const reader = new FileReader()
        reader.onload = async (e) => {
            const result = e.target?.result as string

            try {
                const res = await fetch(`/api/projects/${projectId}/documents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: result
                    })
                })

                if (res.ok) {
                    await fetchDocuments()
                }
            } catch (error) {
                console.error("Upload failed", error)
                alert("アップロードに失敗しました")
            } finally {
                setIsUploading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files)
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            {/* Header / Controls */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    資料・ファイル
                </h2>
                <div className="flex gap-4">
                    <div className="bg-white/5 rounded-lg p-1 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="relative">
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-6 h-6 text-indigo-400" />
                        </div>
                        <p className="text-white font-medium mb-1">
                            {isUploading ? 'アップロード中...' : 'クリックまたはドラッグ＆ドロップでアップロード'}
                        </p>
                        <p className="text-white/40 text-sm">PDF, 画像など (最大 2MB)</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-[300px]">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group relative">
                                <div className="aspect-[3/4] bg-black/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                    {doc.type.includes('image') ? (
                                        <img src={doc.url} alt={doc.name} className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <FileText className="w-12 h-12 text-white/20" />
                                    )}
                                </div>
                                <h3 className="text-sm font-medium text-white truncate mb-1">{doc.name}</h3>
                                <p className="text-xs text-white/40">{formatSize(doc.size)}</p>

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl backdrop-blur-sm">
                                    <button
                                        onClick={() => setSelectedDoc(doc)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                        <File className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{doc.name}</h3>
                                        <p className="text-xs text-white/40">{new Date(doc.createdAt).toLocaleDateString()} • {formatSize(doc.size)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDoc(doc)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-[#1a1a1a] w-full h-full max-w-6xl rounded-2xl border border-white/10 flex flex-col overflow-hidden relative">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#1a1a1a]">
                            <h3 className="text-white font-bold truncate">{selectedDoc.name}</h3>
                            <div className="flex items-center gap-2">
                                <a href={selectedDoc.url} download={selectedDoc.name} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
                                    <Download className="w-5 h-5" />
                                </a>
                                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Viewer */}
                        <div className="flex-1 bg-black/50 relative overflow-hidden">
                            {selectedDoc.type === 'application/pdf' ? (
                                <iframe src={selectedDoc.url} className="w-full h-full border-none" />
                            ) : selectedDoc.type.includes('image') ? (
                                <img src={selectedDoc.url} alt={selectedDoc.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-white/40">
                                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                                    <p>このファイル形式はプレビューできません</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
