"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { List, ListChecks } from "lucide-react"
import { useEffect } from "react"

interface TaskDescriptionEditorProps {
    content?: string
    onChange?: (content: string) => void
}

export function TaskDescriptionEditor({ content = "", onChange }: TaskDescriptionEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-sm",
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML())
        },
    })

    // Sync content when prop changes (e.g. from external updates)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-white/10 p-2 flex gap-1 bg-black/20">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("bulletList") ? "bg-white/20 text-white" : "text-white/60"
                        }`}
                    title="箇条書きリスト"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive("taskList") ? "bg-white/20 text-white" : "text-white/60"
                        }`}
                    title="チェックボックスリスト"
                >
                    <ListChecks className="w-4 h-4" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    )
}
