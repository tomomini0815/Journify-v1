"use client"

import { useDraggable } from "@dnd-kit/core"
import { Flag } from "lucide-react"
import { defaultMilestoneTemplates, MilestoneTemplate } from "@/lib/milestoneTemplates"

export function MilestoneTemplatesPanel() {
    return (
        <div className="border-b border-white/10 bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 mb-3">
                <Flag className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-medium text-white">マイルストーンテンプレート</h3>
                <span className="text-xs text-white/40">ドラッグして配置</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {defaultMilestoneTemplates.map((template) => (
                    <DraggableMilestoneTemplate key={template.id} template={template} />
                ))}
            </div>
        </div>
    )
}

function DraggableMilestoneTemplate({ template }: { template: MilestoneTemplate }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `milestone-template-${template.id}`,
        data: {
            type: 'milestone-template',
            template
        }
    })

    const categoryLabels = {
        development: '開発',
        design: 'デザイン',
        marketing: 'マーケ',
        general: '汎用'
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex-shrink-0 w-[180px] bg-white/5 border border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors ${isDragging ? 'opacity-50 ring-2 ring-amber-500' : ''}`}
        >
            <div className="flex items-center gap-2 mb-2">
                <Flag className="w-3.5 h-3.5" style={{ color: template.color }} />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                    {categoryLabels[template.category]}
                </span>
            </div>
            <h4 className="font-medium text-white text-sm mb-1">{template.name}</h4>
            <p className="text-xs text-white/60 line-clamp-2">{template.description}</p>
        </div>
    )
}
