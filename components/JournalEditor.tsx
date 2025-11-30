"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CharacterCount from "@tiptap/extension-character-count"

import Placeholder from "@tiptap/extension-placeholder"
import { motion } from "framer-motion"
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react"

interface JournalEditorProps {
    content?: string
    onChange?: (content: string) => void
}

export function JournalEditor({ content = "", onChange }: JournalEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "あなたの思考を書き始めてください...",
            }),
            CharacterCount,
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4",
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-white/10 p-3 flex flex-wrap gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("bold") ? "bg-white/20" : ""}`}
                    title="Bold"
                >
                    <Bold className="w-5 h-5" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("italic") ? "bg-white/20" : ""}`}
                    title="Italic"
                >
                    <Italic className="w-5 h-5" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-white/20" : ""}`}
                    title="Heading"
                >
                    <Heading2 className="w-5 h-5" />
                </button>
                <div className="w-px bg-white/10 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("bulletList") ? "bg-white/20" : ""}`}
                    title="Bullet List"
                >
                    <List className="w-5 h-5" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("orderedList") ? "bg-white/20" : ""}`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-5 h-5" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* Character Count */}
            <div className="border-t border-white/10 px-6 py-3 text-sm text-white/40">
                {editor.storage.characterCount?.characters() || 0} 文字
            </div>
        </div>
    )
}
