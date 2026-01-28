
import { motion } from "framer-motion"
import { Plus, Calendar } from "lucide-react"
import { FormEvent } from "react"

interface AddTaskFormProps {
    newTask: string
    setNewTask: (value: string) => void
    startDate: string
    setStartDate: (value: string) => void
    endDate: string
    setEndDate: (value: string) => void
    description?: string
    setDescription?: (value: string) => void
    priority: 'low' | 'medium' | 'high' | 'urgent'
    setPriority: (priority: 'low' | 'medium' | 'high' | 'urgent') => void
    onSubmit: (e: FormEvent) => void
    isMobile?: boolean
}

export function AddTaskForm({
    newTask,
    setNewTask,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    description,
    setDescription,
    priority,
    setPriority,
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
            <div className={`flex flex-col md:flex-row items-stretch ${isMobile ? 'gap-2' : 'gap-3'} w-full`}>
                {/* Merged Input Container */}
                <div className={`flex-1 flex flex-col md:flex-row items-center bg-white/5 border border-white/20 rounded-2xl transition-all focus-within:bg-white/10 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10 group px-4 overflow-hidden ${isMobile ? 'py-2 gap-2' : 'h-11'}`}>
                    {/* Text Input */}
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="新しいタスクを入力..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 font-medium h-10 md:h-full min-w-0 w-full md:w-auto"
                        autoFocus={isMobile}
                    />

                    {/* Divider - Hidden on Mobile */}
                    <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-2 flex-shrink-0" />

                    {/* Date Pickers Container */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        {/* Start Date */}
                        <div className="relative h-9 md:h-full flex items-center cursor-pointer hover:text-emerald-400 text-white/40 transition-colors group/date flex-shrink-0">
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                            />
                            <span className={`text-xs mr-1 whitespace-nowrap ${startDate ? 'text-emerald-400 font-medium' : 'hidden md:inline-block'}`}>
                                {startDate ? new Date(startDate).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {!startDate && <span className="text-xs mr-1 hidden md:inline-block">開始</span>}
                            <div className={`p-1.5 rounded-lg transition-colors ${startDate ? 'bg-emerald-500/10 text-emerald-500' : 'group-hover/date:bg-white/5'}`}>
                                <Calendar className={iconSize} />
                            </div>
                        </div>

                        <span className="text-white/20 text-xs">→</span>

                        {/* End Date */}
                        <div className="relative h-9 md:h-full flex items-center cursor-pointer hover:text-emerald-400 text-white/40 transition-colors group/date flex-shrink-0">
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                            />
                            <span className={`text-xs mr-1 whitespace-nowrap ${endDate ? 'text-emerald-400 font-medium' : 'hidden md:inline-block'}`}>
                                {endDate ? new Date(endDate).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {!endDate && <span className="text-xs mr-1 hidden md:inline-block">終了</span>}
                            <div className={`p-1.5 rounded-lg transition-colors ${endDate ? 'bg-emerald-500/10 text-emerald-500' : 'group-hover/date:bg-white/5'}`}>
                                <Calendar className={iconSize} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Selector */}
                <div className="flex items-center bg-white/5 border border-white/20 rounded-2xl h-11 px-3 gap-2">
                    {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${priority === p
                                    ? p === 'urgent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                                        p === 'high' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' :
                                            p === 'medium' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                                'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                    : 'hover:bg-white/5 text-white/30 hover:text-white/60'
                                }`}
                            title={p === 'low' ? '低' : p === 'medium' ? '中' : p === 'high' ? '高' : '最高'}
                        >
                            <span className="text-[10px] font-bold uppercase">{p[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Add Button */}
                <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className={`${heightClass} aspect-square bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 flex-shrink-0 self-end md:self-auto`}
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
