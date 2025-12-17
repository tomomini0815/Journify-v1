
import { motion } from "framer-motion"
import { Plus, Calendar } from "lucide-react"
import { FormEvent } from "react"

interface AddTaskFormProps {
    newTask: string
    setNewTask: (value: string) => void
    scheduledDate: string
    setScheduledDate: (value: string) => void
    description?: string
    setDescription?: (value: string) => void
    onSubmit: (e: FormEvent) => void
    isMobile?: boolean
}

export function AddTaskForm({
    newTask,
    setNewTask,
    scheduledDate,
    setScheduledDate,
    description,
    setDescription,
    onSubmit,
    isMobile = false
}: AddTaskFormProps) {
    // Height classes to match input and button
    const heightClass = isMobile ? 'h-12' : 'h-11'
    const iconSize = isMobile ? 'w-5 h-5' : 'w-4 h-4'

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4 w-full"
        >
            {/* Main Input Row: Text/Date + Button */}
            <div className={`flex flex-nowrap items-center ${isMobile ? 'gap-2' : 'gap-3'} w-full ${heightClass}`}>
                {/* Merged Input Container */}
                <div className={`flex-1 flex items-center bg-black/20 border border-white/10 rounded-2xl h-full transition-all focus-within:bg-black/40 focus-within:border-emerald-500/50 group px-4 overflow-hidden`}>
                    {/* Text Input */}
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="新しいタスクを入力..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 font-medium h-full min-w-0"
                        autoFocus={isMobile}
                    />

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10 mx-2 flex-shrink-0" />

                    {/* Date Picker Icon & Input */}
                    <div className="relative h-full flex items-center cursor-pointer hover:text-emerald-400 text-white/40 transition-colors group/date flex-shrink-0">
                        <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        />
                        <span className={`text-xs mr-2 whitespace-nowrap ${scheduledDate ? 'text-emerald-400 font-medium' : 'hidden md:inline-block'}`}>
                            {scheduledDate ? new Date(scheduledDate).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        <div className={`p-1.5 rounded-lg transition-colors ${scheduledDate ? 'bg-emerald-500/10 text-emerald-500' : 'group-hover/date:bg-white/5'}`}>
                            <Calendar className={iconSize} />
                        </div>
                    </div>
                </div>

                {/* Add Button */}
                <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className={`${heightClass} aspect-square bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 flex-shrink-0`}
                >
                    <Plus className={isMobile ? "w-6 h-6" : "w-5 h-5"} />
                </button>
            </div>

            {/* Description Field - Mobile Only (Modal) - Below the main row */}
            {isMobile && description !== undefined && setDescription && (
                <div className="relative w-full">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="説明やリンクを追加 (任意)..."
                        className="w-full h-24 bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all resize-none"
                    />
                </div>
            )}
        </form>
    )
}
