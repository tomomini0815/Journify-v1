"use client"

import { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { Flag, ChevronDown, ChevronRight } from "lucide-react"
import { defaultMilestoneTemplates, MilestoneTemplate, getCategoryName } from "@/lib/milestoneTemplates"

export function MilestoneTemplatesPanel() {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'it-software': true,
        'manufacturing': false,
        'event-project': false,
        'marketing-advertising': false
    })

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    // Group templates by category
    const groupedTemplates = defaultMilestoneTemplates.reduce((acc, template) => {
        if (!acc[template.category]) {
            acc[template.category] = []
        }
        acc[template.category].push(template)
        return acc
    }, {} as Record<string, MilestoneTemplate[]>)

    const categories: MilestoneTemplate['category'][] = ['it-software', 'manufacturing', 'event-project', 'marketing-advertising']

    return (
        <div className="border-t border-white/10 bg-[#1a1a1a]">
            {categories.map((category) => {
                const templates = groupedTemplates[category] || []
                const isExpanded = expandedCategories[category]

                return (
                    <div key={category} className="border-b border-white/10">
                        <button
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-white/60" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-white/60" />
                                )}
                                <Flag className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-medium text-white">{getCategoryName(category)}</h3>
                                <span className="text-xs text-white/40">({templates.length})</span>
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-4 pb-4">
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {templates.map((template) => (
                                        <DraggableMilestoneTemplate key={template.id} template={template} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
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

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex-shrink-0 w-[180px] bg-white/5 border border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors ${isDragging ? 'opacity-50 ring-2 ring-amber-500' : ''}`}
        >
            <div className="flex items-center gap-2 mb-2">
                <Flag className="w-3.5 h-3.5" style={{ color: template.color }} />
            </div>
            <h4 className="font-medium text-white text-sm mb-1">{template.name}</h4>
            <p className="text-xs text-white/60 line-clamp-2">{template.description}</p>
        </div>
    )
}
