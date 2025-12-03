"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import { WorkflowTemplate, defaultTemplates } from "@/lib/workflowTemplates"

export function WorkflowTemplatesPanel() {
    const [isOpen, setIsOpen] = useState(true)
    const [templates, setTemplates] = useState<WorkflowTemplate[]>(defaultTemplates)

    return (
        <div className="bg-[#1a1a1a] border-b border-white/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-white/80 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2 font-medium">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    ワークフローテンプレート
                </div>
                <span className="text-xs text-white/40">ドラッグしてタイムラインに追加</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {templates.map((template) => (
                                <DraggableTemplate key={template.id} template={template} />
                            ))}

                            {/* Custom Template Button (Placeholder) */}
                            <button className="flex flex-col items-center justify-center min-w-[200px] h-[100px] rounded-xl border border-white/10 border-dashed hover:bg-white/5 transition-colors group">
                                <Plus className="w-6 h-6 text-white/40 group-hover:text-white/80 mb-2" />
                                <span className="text-sm text-white/40 group-hover:text-white/80">カスタム作成</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function DraggableTemplate({ template }: { template: WorkflowTemplate }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `template-${template.id}`,
        data: {
            type: 'template',
            template
        }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`flex-shrink-0 w-[240px] bg-white/5 border border-white/10 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors ${isDragging ? 'opacity-50 ring-2 ring-indigo-500' : ''}`}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white">{template.name}</h4>
                <GripVertical className="w-4 h-4 text-white/40" />
            </div>
            <p className="text-xs text-white/60 mb-3 line-clamp-2">{template.description}</p>
            <div className="flex flex-wrap gap-1">
                {template.tasks.slice(0, 3).map((task, i) => (
                    <div key={i} className="h-1.5 rounded-full flex-1" style={{ backgroundColor: task.color }} />
                ))}
                {template.tasks.length > 3 && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                )}
            </div>
            <div className="mt-2 text-xs text-white/40 text-right">
                {template.tasks.length} タスク • 計 {template.tasks.reduce((acc, t) => acc + t.duration, 0)} 日
            </div>
        </div>
    )
}
