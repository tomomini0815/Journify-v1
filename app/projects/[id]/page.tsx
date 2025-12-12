"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable, DragEndEvent, DragStartEvent, useDraggable, defaultDropAnimation } from "@dnd-kit/core"
import { TaskDescriptionEditor } from '@/components/TaskDescriptionEditor'
import { FileUploader } from '@/components/FileUploader'
import { MilestoneTemplatesPanel } from '@/components/MilestoneTemplatesPanel'
import { WorkflowTemplatesPanel } from '@/components/WorkflowTemplates'
import { WorkflowTemplate } from '@/lib/workflowTemplates'
import { MilestoneTemplate } from '@/lib/milestoneTemplates'
import { isHoliday } from '@/lib/holidays'

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, CheckSquare, Plus, ArrowLeft, MoreVertical, Flag, Pencil, Trash2, ChevronDown, ChevronRight, Download, File as FileIcon, Paperclip, Link as LinkIcon, Share2, Copy, Check, MessageSquare, Send, X, AlertCircle, FileText } from "lucide-react"
import DocumentsView from './components/DocumentsView'
import { DashboardLayout } from '@/components/DashboardLayout'

// ... imports remain the same

type Milestone = {
    id: string
    title: string
    date: string
    completed: boolean
}

type Comment = {
    id: string
    content: string
    authorName: string
    createdAt: string
}

type Task = {
    id: string
    text: string
    description?: string
    url?: string
    status: string
    priority: string
    completed: boolean
    color?: string
    createdAt: string
    startDate?: string
    endDate?: string
    workflowId?: string
    workflowName?: string
    attachments?: Attachment[]
    approvalStatus: string // "none", "pending", "approved", "rejected"
    rejectionReason?: string
}

type Attachment = {
    id: string
    name: string
    url: string
    size: number
    type: string
    createdAt: string
}

function DroppableCell({ date, children, isHoliday, width, idPrefix = "" }: { date: string, children: React.ReactNode, isHoliday: boolean, width: number, idPrefix?: string }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${idPrefix}${date}`,
    })

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 border-r flex flex-col items-center justify-center text-xs relative transition-colors ${isHoliday ? 'bg-red-500/5 border-red-500/30' : 'border-white/5'
                } ${isOver ? 'bg-indigo-500/20 ring-2 ring-inset ring-indigo-500 z-10' : ''}`}
            style={{ width: `${width}px` }}
        >
            {children}
        </div>
    )
}

type Project = {
    id: string
    title: string
    description: string
    status: string
    startDate: string
    endDate: string
    milestones: Milestone[]
    tasks: Task[]
    comments: Comment[]
}



export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showMilestoneModal, setShowMilestoneModal] = useState(false)
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showComments, setShowComments] = useState(false) // New
    const [newReply, setNewReply] = useState("") // New
    const [isSubmittingReply, setIsSubmittingReply] = useState(false) // New
    const [newMilestone, setNewMilestone] = useState({ title: "", date: "" })
    const [newTask, setNewTask] = useState({
        text: "",
        description: "",
        url: "",
        status: "todo",
        priority: "medium",
        startDate: "",
        endDate: "",
        color: "#6366f1",
        approvalStatus: "none",
    })
    const [taskAttachments, setTaskAttachments] = useState<Attachment[]>([])
    const [activeTab, setActiveTab] = useState<'list' | 'timeline' | 'docs'>('list')
    const [editingItem, setEditingItem] = useState<{ type: 'task' | 'milestone', id: string } | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'task' | 'milestone', id: string, title: string } | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [activeDragItem, setActiveDragItem] = useState<{ type: 'task', task: Task } | { type: 'milestone-template', template: MilestoneTemplate } | null>(null)
    const [collapsedWorkflows, setCollapsedWorkflows] = useState<Set<string>>(new Set())
    const [showShareModal, setShowShareModal] = useState(false)
    const [shareUrl, setShareUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Configure DnD sensors to prevent blocking scroll
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    )

    // Auto-scroll timeline to today on mount
    // Track if initial scroll has happened for the current tab
    const hasScrolledRef = useRef(false)

    // Reset scroll flag when switching tabs
    useEffect(() => {
        hasScrolledRef.current = false
    }, [activeTab])

    // Auto-scroll timeline to today on mount/tab switch
    useEffect(() => {
        if (activeTab === 'timeline' && project && !hasScrolledRef.current) {
            const scrollContainer = document.getElementById('timeline-scroll-container')
            const bottomScrollContainer = document.getElementById('bottom-calendar-scroll-container')
            if (scrollContainer) {
                // Calculate today's position
                const today = new Date()
                const minDate = new Date(Math.min(
                    Date.now(),
                    project.startDate ? new Date(project.startDate).getTime() : Date.now(),
                    project.endDate ? new Date(project.endDate).getTime() : Date.now(),
                    ...project.tasks.flatMap(t => [
                        t.startDate ? new Date(t.startDate).getTime() : null,
                        t.endDate ? new Date(t.endDate).getTime() : null
                    ]).filter((d): d is number => d !== null),
                    ...project.milestones.map(m => new Date(m.date).getTime())
                ))
                const adjustedMinDate = new Date(minDate)
                adjustedMinDate.setDate(adjustedMinDate.getDate() - 3)

                const dayWidth = 50
                const todayOffset = ((today.getTime() - adjustedMinDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth

                // Scroll to show today at the left edge
                setTimeout(() => {
                    scrollContainer.scrollLeft = todayOffset
                    if (bottomScrollContainer) {
                        bottomScrollContainer.scrollLeft = todayOffset
                    }
                    hasScrolledRef.current = true
                }, 100)
            }
        }
    }, [activeTab, project])

    useEffect(() => {
        if (showTaskModal || showMilestoneModal || deleteConfirm) {
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [showTaskModal, showMilestoneModal, deleteConfirm])

    useEffect(() => {
        fetchProject()
    }, [])

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setProject(data)
            } else {
                router.push("/projects")
            }
        } catch (error) {
            console.error("Failed to fetch project", error)
        } finally {
            setIsLoading(false)
        }
    }

    const createMilestone = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingItem
                ? `/api/projects/${params.id}/milestones/${editingItem.id}`
                : `/api/projects/${params.id}/milestones`

            const method = editingItem ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMilestone)
            })

            if (res.ok) {
                await fetchProject()
                setShowMilestoneModal(false)
                setNewMilestone({ title: "", date: "" })
                setEditingItem(null)
            }
        } catch (error) {
            console.error("Failed to save milestone", error)
        }
    }

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("createTask called", { editingItem, newTask })
        const updatedTaskId = editingItem?.id
        try {
            const url = editingItem
                ? `/api/projects/${params.id}/tasks/${editingItem.id}`
                : `/api/projects/${params.id}/tasks`

            const method = editingItem ? "PATCH" : "POST"
            console.log("Fetching", url, method)

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask)
            })

            console.log("Response status:", res.status)

            if (res.ok) {
                const savedTask = await res.json()
                await fetchProject()
                setShowTaskModal(false)
                setNewTask({
                    text: "",
                    description: "",
                    url: "",
                    status: "todo",
                    priority: "medium",
                    startDate: "",
                    endDate: "",
                    color: "#6366f1",
                    approvalStatus: "none"
                })
                setEditingItem(null)
                setTaskAttachments([])

                // Scroll to created task only (not updates)
                const targetId = savedTask.id
                if (targetId && !updatedTaskId) {
                    setTimeout(() => {
                        const taskElement = document.getElementById(`task-${targetId}`)
                        if (taskElement) {
                            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            // Highlight effect
                            taskElement.classList.add('ring-2', 'ring-emerald-400')
                            setTimeout(() => {
                                taskElement.classList.remove('ring-2', 'ring-emerald-400')
                            }, 2000)
                        }
                    }, 300)
                }
            } else {
                console.error("Task save failed with status:", res.status, res.statusText)
                const responseText = await res.text()
                console.error("Response body:", responseText)
                try {
                    const errorData = JSON.parse(responseText)
                    console.error("Parsed error data:", errorData)
                } catch (e) {
                    console.error("Could not parse error response as JSON")
                }
            }
        } catch (error) {
            console.error("Failed to save task", error)
        }
    }



    const toggleTaskCompletion = async (task: Task) => {
        if (!project) return

        const newCompletedStatus = !task.completed
        // If completing, set status to done. If uncompleting, set to todo (unless it was something else, but simplicity suggests todo)
        // actually, if uncompleting from 'done', go to 'todo'. If uncompleting from 'todo' (already todo), stay todo.
        // If uncompleting from 'in-progress' (checkbox in list), stay in-progress?
        // Let's keep it simple: Complete -> Done. Uncomplete -> Todo.
        const newStatus = newCompletedStatus ? 'done' : 'todo'

        // Optimistic update
        const updatedTasks = project.tasks.map(t =>
            t.id === task.id ? { ...t, completed: newCompletedStatus, status: newStatus } : t
        )
        setProject({ ...project, tasks: updatedTasks })

        try {
            const res = await fetch(`/api/projects/${params.id}/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: newCompletedStatus, status: newStatus })
            })

            if (!res.ok) {
                // Revert on failure
                throw new Error("Failed to update task")
            }
        } catch (error) {
            console.error("Failed to toggle task", error)
            // Revert state
            const revertedTasks = project.tasks.map(t =>
                t.id === task.id ? { ...t, completed: !newCompletedStatus, status: task.status } : t
            )
            setProject({ ...project, tasks: revertedTasks })
        }
    }

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newReply.trim() || !project) return

        setIsSubmittingReply(true)
        try {
            // Use share token if available, otherwise we might need a direct endpoint.
            // Assuming share token exists for shared projects.
            const shareToken = (project as any).shareToken
            if (!shareToken) {
                alert("このプロジェクトは共有されていないため、コメント機能は制限されています。")
                setIsSubmittingReply(false)
                return
            }

            const res = await fetch(`/api/shared/${shareToken}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newReply, authorName: '管理者' })
            })

            if (res.ok) {
                const comment = await res.json()
                const updatedComments = [comment, ...(project.comments || [])]
                setProject({ ...project, comments: updatedComments })
                setNewReply("")
            }
        } catch (error) {
            console.error("Failed to post reply", error)
        } finally {
            setIsSubmittingReply(false)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchProject()
                setDeleteConfirm(null)
            }
        } catch (error) {
            console.error("Failed to delete task", error)
        }
    }

    const handleSubtaskToggle = async (taskId: string, checkboxIndex: number, checked: boolean) => {
        if (!project) return

        const task = project.tasks.find(t => t.id === taskId)
        if (!task || !task.description) return

        // Parse HTML and update checkbox state
        const parser = new DOMParser()
        const doc = parser.parseFromString(task.description, 'text/html')
        const checkboxes = doc.querySelectorAll('input[type="checkbox"]')

        if (checkboxes[checkboxIndex]) {
            const checkbox = checkboxes[checkboxIndex] as HTMLInputElement
            const li = checkbox.closest('li')

            if (checked) {
                checkbox.setAttribute('checked', 'checked')
                if (li) {
                    li.setAttribute('data-checked', 'true')
                    li.setAttribute('data-type', 'taskItem')
                    const ul = li.closest('ul')
                    if (ul) ul.setAttribute('data-type', 'taskList')
                }
            } else {
                checkbox.removeAttribute('checked')
                if (li) {
                    li.setAttribute('data-checked', 'false')
                    li.setAttribute('data-type', 'taskItem')
                    const ul = li.closest('ul')
                    if (ul) ul.setAttribute('data-type', 'taskList')
                }
            }
        }

        const updatedDescription = doc.body.innerHTML

        // Optimistic update
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, description: updatedDescription } : t
        )
        setProject({ ...project, tasks: updatedTasks })

        // Persist to server
        try {
            await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: updatedDescription })
            })
        } catch (error) {
            console.error("Failed to update subtask", error)
            // Revert on error
            setProject(project)
        }
    }

    const generateShareLink = async () => {
        if (!project) return

        try {
            const res = await fetch(`/api/projects/${params.id}/share`, {
                method: "POST"
            })

            if (res.ok) {
                const data = await res.json()
                setShareUrl(data.shareUrl)
                setShowShareModal(true)
                // Update project state with share info
                setProject({
                    ...project,
                    shareToken: data.shareToken,
                    isPublic: true,
                    sharedAt: new Date().toISOString()
                } as any)
            }
        } catch (error) {
            console.error("Failed to generate share link", error)
        }
    }

    const removeShareLink = async () => {
        if (!project) return

        try {
            const res = await fetch(`/api/projects/${params.id}/share`, {
                method: "DELETE"
            })

            if (res.ok) {
                setShareUrl(null)
                setShowShareModal(false)
                // Update project state
                setProject({
                    ...project,
                    shareToken: null,
                    isPublic: false,
                    sharedAt: null
                } as any)
            }
        } catch (error) {
            console.error("Failed to remove share link", error)
        }
    }

    const copyShareLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        if (active.data.current?.type === 'task') {
            setActiveDragItem({ type: 'task', task: active.data.current.task })
        } else if (active.data.current?.type === 'milestone-template') {
            setActiveDragItem({ type: 'milestone-template', template: active.data.current.template })
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        if (!project) return

        const task = project.tasks.find(t => t.id === taskId)
        if (!task || task.status === newStatus) return

        // Validate status
        const isCompleted = newStatus === 'done'

        // Optimistic update
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus, completed: isCompleted } : t
        )
        setProject({ ...project, tasks: updatedTasks })

        // Persist to server
        try {
            const res = await fetch(`/api/projects/${params.id}/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, completed: isCompleted })
            })

            if (!res.ok) {
                throw new Error("Failed to update task status")
            }
        } catch (error) {
            console.error("Failed to update task status", error)
            setProject(project)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragItem(null)

        if (!over) return

        // Handle Kanban task drop
        if (active.data.current?.type === 'task') {
            const taskId = active.id as string
            const newStatus = over.id as string

            if (['todo', 'in_progress', 'done'].includes(newStatus)) {
                await updateTaskStatus(taskId, newStatus)
                return
            }
        }

        // Handle milestone template drop
        if (active.data.current?.type === 'milestone-template') {
            const template = active.data.current.template as MilestoneTemplate
            const dropDate = over.id as string

            if (!dropDate) return

            // Optimistic update
            const newMilestone: Milestone = {
                id: `temp-${Date.now()}`,
                title: template.name,
                date: dropDate,
                completed: false
            }

            if (project) {
                setProject({
                    ...project,
                    milestones: [...project.milestones, newMilestone]
                })
            }

            // Save to server
            try {
                await fetch(`/api/projects/${params.id}/milestones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: template.name,
                        date: dropDate
                    })
                })
                await fetchProject()
            } catch (error) {
                console.error("Failed to create milestone", error)
                // Revert on error
                if (project) {
                    setProject({
                        ...project,
                        milestones: project.milestones.filter(m => m.id !== newMilestone.id)
                    })
                }
            }
            return
        }

        // Handle workflow template drop
        if (active.data.current?.type !== 'template') return

        const template = active.data.current.template as WorkflowTemplate
        let dropDate = over.id as string // Date string from droppable id

        if (!dropDate) return

        // Handle prefixed IDs (top-DATE, bottom-DATE)
        if (dropDate.startsWith('top-')) {
            dropDate = dropDate.replace('top-', '')
        } else if (dropDate.startsWith('bottom-')) {
            dropDate = dropDate.replace('bottom-', '')
        }

        // Create tasks from template
        let currentDate = new Date(dropDate)
        const workflowId = `wf-${Date.now()}`
        const workflowName = template.name

        // Optimistic update
        const newTasks: Task[] = []

        for (const templateTask of template.tasks) {
            // Skip weekends if needed (simple implementation for now)

            const startDate = currentDate.toISOString().split('T')[0]

            // Calculate end date considering weekends and holidays
            let endDateObj = new Date(currentDate)
            let remainingDays = templateTask.duration - 1 // -1 because start day counts as day 1

            // If start date itself is a holiday/weekend, we should probably still count it as the start date
            // but maybe push the "work" to the next day?
            // The user request is "extend the due date".
            // So if I start on Friday (1 day work), end is Friday.
            // If I start on Friday (2 days work):
            // Fri (Work 1), Sat (Rest), Sun (Rest), Mon (Work 2) -> End Mon.

            // We need to iterate from start date
            let tempDate = new Date(currentDate)
            while (remainingDays > 0) {
                tempDate.setDate(tempDate.getDate() + 1)
                const day = tempDate.getDay()
                const isJpHoliday = isHoliday(tempDate)

                // If it's a workday, decrement remaining days
                if (day !== 0 && day !== 6 && !isJpHoliday.isHoliday) {
                    remainingDays--
                }
                // If it's weekend/holiday, we just advance the date (loop continues) without reducing remainingDays
            }
            endDateObj = tempDate
            const endDate = endDateObj.toISOString().split('T')[0]

            const newTask: Task = {
                id: `temp-${Date.now()}-${Math.random()}`,
                text: `${template.name}: ${templateTask.title}`,
                description: templateTask.description || '',
                status: 'todo',
                priority: 'medium',
                completed: false,
                color: templateTask.color,
                createdAt: new Date().toISOString(),
                startDate,
                endDate,
                workflowId,
                workflowName,
                approvalStatus: 'none'
            }

            newTasks.push(newTask)

            // Advance date for next task (start day after current task ends)
            currentDate = new Date(endDateObj)
            currentDate.setDate(currentDate.getDate() + 1)
        }

        if (project) {
            setProject({
                ...project,
                tasks: [...project.tasks, ...newTasks]
            })
        }

        // Save to server
        try {
            // Create tasks sequentially to maintain order
            for (const task of newTasks) {
                await fetch(`/api/projects/${params.id}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: task.text,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        color: task.color,
                        startDate: task.startDate,
                        endDate: task.endDate,
                        workflowId: task.workflowId,
                        workflowName: task.workflowName
                    })
                })
            }
            await fetchProject()
        } catch (error) {
            console.error("Failed to create template tasks", error)
            // Revert on error would go here
        }
    }

    const handleDeleteMilestone = async (milestoneId: string) => {
        try {
            const res = await fetch(`/api/projects/${params.id}/milestones/${milestoneId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchProject()
                setDeleteConfirm(null)
            }
        } catch (error) {
            console.error("Failed to delete milestone", error)
        }
    }

    const handleDeleteWorkflow = async (workflowId: string) => {
        // Confirmation handled by modal now

        try {
            // Optimistic update
            if (project) {
                const updatedTasks = project.tasks.filter(t => t.workflowId !== workflowId)
                setProject({ ...project, tasks: updatedTasks })
            }

            const res = await fetch(`/api/projects/${params.id}/workflows/${workflowId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                await fetchProject()
            } else {
                // Revert if failed
                await fetchProject()
            }
        } catch (error) {
            console.error("Failed to delete workflow", error)
        }
    }

    const toggleWorkflowCollapse = (workflowId: string) => {
        const newSet = new Set(collapsedWorkflows)
        if (newSet.has(workflowId)) {
            newSet.delete(workflowId)
        } else {
            newSet.add(workflowId)
        }
        setCollapsedWorkflows(newSet)
    }

    // Helper to generate consistent rows for Sidebar and Timeline
    const timelineRows = (() => {
        if (!project) return []
        const rows: ({ type: 'header', id: string, name: string } | { type: 'task', task: Task } | { type: 'milestone', milestone: Milestone })[] = []

        // Group tasks by workflow
        const workflowGroups = new Map<string, Task[]>()
        const ungroupedTasks: Task[] = []

        project.tasks.forEach(task => {
            if (task.workflowId) {
                if (!workflowGroups.has(task.workflowId)) {
                    workflowGroups.set(task.workflowId, [])
                }
                workflowGroups.get(task.workflowId)!.push(task)
            } else {
                ungroupedTasks.push(task)
            }
        })

        // Ungrouped tasks first
        ungroupedTasks.forEach(task => rows.push({ type: 'task', task }))

        // Grouped tasks
        workflowGroups.forEach((tasks, workflowId) => {
            const workflowName = tasks[0].workflowName || 'Workflow'
            rows.push({ type: 'header', id: workflowId, name: workflowName })
            if (!collapsedWorkflows.has(workflowId)) {
                tasks.forEach(task => rows.push({ type: 'task', task }))
            }
        })

        // Milestones Group
        if (project.milestones.length > 0) {
            rows.push({ type: 'header', id: 'milestones', name: 'マイルストーン' })
            if (!collapsedWorkflows.has('milestones')) {
                project.milestones.forEach(milestone => rows.push({ type: 'milestone', milestone }))
            }
        }

        return rows
    })()

    const openEditTaskModal = async (task: Task) => {
        setNewTask({
            text: task.text,
            description: task.description || "",
            url: task.url || "",
            status: task.status || "todo",
            priority: task.priority || "medium",
            startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "",
            endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "",
            color: task.color || "#6366f1",
            approvalStatus: task.approvalStatus || "none"
        })
        setEditingItem({ type: 'task', id: task.id })

        // Fetch attachments
        try {
            const res = await fetch(`/api/tasks/${task.id}/attachments`)
            if (res.ok) {
                const data = await res.json()
                setTaskAttachments(data)
            } else {
                setTaskAttachments([])
            }
        } catch (e) {
            console.error(e)
            setTaskAttachments([])
        }

        setShowTaskModal(true)
    }

    const openCreateTaskModal = () => {
        setNewTask({
            text: "",
            description: "",
            url: "",
            status: "todo",
            priority: "medium",
            startDate: "",
            endDate: "",
            color: "#6366f1",
            approvalStatus: "none"
        })
        setEditingItem(null)
        setTaskAttachments([])
        setShowTaskModal(true)
    }

    const openEditMilestoneModal = (milestone: Milestone) => {
        setNewMilestone({
            title: milestone.title,
            date: new Date(milestone.date).toISOString().split('T')[0]
        })
        setEditingItem({ type: 'milestone', id: milestone.id })
        setShowMilestoneModal(true)
    }

    if (isLoading || !project) {
        return (
            <DashboardLayout>
                <div className="text-center py-12 text-white/60">読み込み中...</div>
            </DashboardLayout>
        )
    }

    // Calculate timeline range
    const dates = [
        project.startDate ? new Date(project.startDate).getTime() : Date.now(),
        project.endDate ? new Date(project.endDate).getTime() : Date.now(),
        ...project.tasks.flatMap(t => [
            t.startDate ? new Date(t.startDate).getTime() : null,
            t.endDate ? new Date(t.endDate).getTime() : null
        ]).filter((d): d is number => d !== null),
        ...project.milestones.map(m => new Date(m.date).getTime())
    ]

    const minDate = new Date(Math.min(Date.now(), ...dates))
    const maxDate = new Date(Math.max(...dates))

    // Add padding to dates
    minDate.setDate(minDate.getDate() - 3)
    maxDate.setDate(maxDate.getDate() + 7)

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    const dayWidth = 50 // px per day

    return (
        <DashboardLayout>
            <div className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
                {/* Header */}
                <div className="flex-shrink-0 mb-6 px-4 sm:px-6 lg:px-8 pt-8">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        プロジェクト一覧に戻る
                    </Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[28px] font-bold text-white mb-2">{project.title}</h1>
                            <p className="text-white/60">{project.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if ((project as any).isPublic && (project as any).shareToken) {
                                        const url = `${window.location.origin}/shared/${(project as any).shareToken}`
                                        setShareUrl(url)
                                        setShowShareModal(true)
                                    } else {
                                        generateShareLink()
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl transition-colors text-emerald-300"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">共有</span>
                            </button>
                            <button
                                onClick={() => setShowComments(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 rounded-xl transition-colors text-indigo-300 relative"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">コメント</span>
                                {project.comments && project.comments.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                                        {project.comments.length}
                                    </span>
                                )}
                            </button>
                            <Link href={`/projects/${params.id}/edit`}>
                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden flex flex-col mx-4 sm:mx-6 lg:mx-8 mb-8">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a] flex-shrink-0">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            プロジェクト工程表
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setNewMilestone({ title: "", date: "" })
                                    setEditingItem(null)
                                    setShowMilestoneModal(true)
                                }}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                <Flag className="w-4 h-4 text-amber-400" />
                                マイルストーン追加
                            </button>
                            <button
                                onClick={() => {
                                    setNewTask({
                                        text: "",
                                        description: "",
                                        url: "",
                                        status: "todo",
                                        priority: "medium",
                                        startDate: "",
                                        endDate: "",
                                        color: "#6366f1",
                                        approvalStatus: "none"
                                    })
                                    setEditingItem(null)
                                    setShowTaskModal(true)
                                }}
                                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                タスク追加
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col bg-[#1a1a1a]">
                        {/* View Toggle Tabs */}
                        <div className="flex gap-2 p-4 border-b border-white/10 flex-shrink-0">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'list'
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <CheckSquare className="w-4 h-4" />
                                リスト
                            </button>
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'timeline'
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                タイムライン
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'docs'
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                資料・ファイル
                            </button>
                        </div>

                        {activeTab === 'docs' ? (
                            <DocumentsView projectId={params.id as string} />
                        ) : activeTab === 'list' ? (
                            <div className="p-4">
                                <DndContext
                                    sensors={sensors}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {/* 未着手 Column */}
                                        <KanbanColumn
                                            id="todo"
                                            title="未着手"
                                            tasks={project.tasks.filter(t => t.status === 'todo' || (!t.status && !t.completed))}
                                            openEditTaskModal={openEditTaskModal}
                                            setDeleteConfirm={setDeleteConfirm}
                                            toggleTaskCompletion={toggleTaskCompletion}
                                            handleSubtaskToggle={handleSubtaskToggle}
                                        />

                                        {/* 進行中 Column */}
                                        <KanbanColumn
                                            id="in_progress"
                                            title="進行中"
                                            tasks={project.tasks.filter(t => t.status === 'in_progress')}
                                            openEditTaskModal={openEditTaskModal}
                                            setDeleteConfirm={setDeleteConfirm}
                                            toggleTaskCompletion={toggleTaskCompletion}
                                            handleSubtaskToggle={handleSubtaskToggle}
                                        />

                                        {/* 完了 Column */}
                                        <KanbanColumn
                                            id="done"
                                            title="完了"
                                            tasks={project.tasks.filter(t => t.status === 'done')}
                                            openEditTaskModal={openEditTaskModal}
                                            setDeleteConfirm={setDeleteConfirm}
                                            toggleTaskCompletion={toggleTaskCompletion}
                                            handleSubtaskToggle={handleSubtaskToggle}
                                        />
                                    </div>

                                    <DragOverlay dropAnimation={defaultDropAnimation}>
                                        {activeDragItem?.type === 'task' && (
                                            <div className="w-[300px]">
                                                <KanbanTaskCard
                                                    task={activeDragItem.task}
                                                    openEditTaskModal={() => { }}
                                                    setDeleteConfirm={() => { }}
                                                    toggleTaskCompletion={() => { }}
                                                    handleSubtaskToggle={() => { }}
                                                />
                                            </div>
                                        )}
                                    </DragOverlay>
                                </DndContext>
                            </div>
                        ) : (
                            /* Timeline View */
                            <div className="flex flex-col">
                                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
                                    {/* Main Timeline Area - Calendar at Top */}
                                    <div className="flex overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
                                        {/* Left Sidebar: Task List */}
                                        <div className={`${sidebarCollapsed ? 'w-12' : 'w-64'} flex-shrink-0 border-r border-white/10 bg-[#1a1a1a] flex flex-col transition-all duration-300`}>
                                            <div className="h-16 border-b border-white/10 flex items-center px-4 font-medium text-white/60 bg-[#252525] sticky top-0 z-30 justify-between">
                                                {!sidebarCollapsed && <span>タスク名</span>}
                                                <button
                                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                    title={sidebarCollapsed ? '展開' : '折りたたむ'}
                                                >
                                                    <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                {timelineRows.map((row, i) => {
                                                    if (row.type === 'header') {
                                                        const isCollapsed = collapsedWorkflows.has(row.id)
                                                        return (
                                                            <div key={`header-${row.id}`} className="h-8 bg-white/5 border-b border-white/5 flex items-center px-2 justify-between group">
                                                                <button
                                                                    onClick={() => toggleWorkflowCollapse(row.id)}
                                                                    className="flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white truncate flex-1 text-left"
                                                                >
                                                                    {isCollapsed ? <ChevronRight className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />}
                                                                    {!sidebarCollapsed && <span className="truncate">{row.name}</span>}
                                                                </button>
                                                                {!sidebarCollapsed && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setDeleteConfirm({ type: 'workflow', id: row.id, title: row.name })
                                                                        }}
                                                                        className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                                        title="テンプレート一式を削除"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    }
                                                    if (row.type === 'task') {
                                                        const task = row.task
                                                        return (
                                                            <div key={task.id} className="h-12 border-b border-white/5 flex items-center px-4 hover:bg-white/5 transition-colors group" title={sidebarCollapsed ? task.text : ''}>
                                                                <div
                                                                    className={`flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white truncate flex-1 text-left ${task.startDate ? 'cursor-pointer hover:text-indigo-300' : ''}`}
                                                                    onClick={() => {
                                                                        if (task.startDate) {
                                                                            const taskDate = new Date(task.startDate)
                                                                            const offset = (taskDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) * dayWidth
                                                                            const container = document.getElementById('timeline-scroll-container')
                                                                            if (container) {
                                                                                container.scrollTo({ left: offset, behavior: 'smooth' })
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className={`w-2 h-2 rounded-full ${sidebarCollapsed ? '' : 'mr-2'} flex-shrink-0`} style={{ backgroundColor: task.color || '#6366f1' }} />
                                                                    {!sidebarCollapsed && <span className="text-sm truncate">{task.text}</span>}
                                                                </div>
                                                                {!sidebarCollapsed && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setDeleteConfirm({ type: 'task', id: task.id, title: task.text })
                                                                        }}
                                                                        className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-1"
                                                                        title="タスクを削除"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    }
                                                    if (row.type === 'milestone') {
                                                        const milestone = row.milestone
                                                        return (
                                                            <div key={milestone.id} className="h-12 border-b border-white/5 flex items-center px-4 hover:bg-white/5 transition-colors bg-amber-500/5 group">
                                                                <Flag className="w-3 h-3 text-amber-400 mr-2 flex-shrink-0" />
                                                                {!sidebarCollapsed && <span className="text-sm truncate text-amber-200 flex-1">{milestone.title}</span>}
                                                                {!sidebarCollapsed && (
                                                                    <button
                                                                        onClick={() => setDeleteConfirm({ type: 'milestone', id: milestone.id, title: milestone.title })}
                                                                        className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                })}
                                            </div>
                                        </div>

                                        {/* Right Content: Timeline */}
                                        <div id="timeline-scroll-container" className="flex-1 min-w-0 overflow-x-auto bg-[#151515] relative">
                                            <div className="min-w-full" style={{ width: `${totalDays * dayWidth}px`, minWidth: '100%' }}>
                                                {/* Date Header */}
                                                <div className="h-16 border-b border-white/10 bg-[#252525] sticky top-0 z-20 select-none">
                                                    <div className="flex h-full">
                                                        {Array.from({ length: totalDays }).map((_, i) => {
                                                            const date = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000)
                                                            const isToday = date.toDateString() === new Date().toDateString()
                                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                            const holiday = isHoliday(date)
                                                            const isFirstOfMonth = date.getDate() === 1
                                                            const prevDate = i > 0 ? new Date(minDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000) : null
                                                            const isMonthChange = prevDate && date.getMonth() !== prevDate.getMonth()

                                                            return (
                                                                <DroppableCell key={i} date={date.toISOString().split('T')[0]} isHoliday={holiday.isHoliday} width={dayWidth} idPrefix="top-">
                                                                    {isFirstOfMonth && (
                                                                        <div className="absolute -top-1 left-0 right-0 text-center pointer-events-none">
                                                                            <span className="text-[10px] font-bold text-white/80 bg-[#252525] px-1 rounded">
                                                                                {date.getMonth() + 1}月
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <span className={`font-medium ${isToday ? 'text-indigo-300' :
                                                                        holiday.isHoliday ? 'text-red-300' :
                                                                            'text-white/60'
                                                                        }`}>
                                                                        {date.getDate()}
                                                                    </span>
                                                                    <span className={`text-[10px] ${isToday ? 'text-indigo-400' :
                                                                        holiday.isHoliday ? 'text-red-400' :
                                                                            isWeekend ? 'text-red-400/60' : 'text-white/30'
                                                                        }`}>
                                                                        {holiday.isHoliday ? '祝' : ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                                                                    </span>
                                                                </DroppableCell>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Grid Body */}
                                                <div className="relative">
                                                    {/* Vertical Grid Lines and Weekend Highlighting */}
                                                    <div className="absolute inset-0 flex pointer-events-none">
                                                        {Array.from({ length: totalDays }).map((_, i) => {
                                                            const date = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000)
                                                            const isToday = date.toDateString() === new Date().toDateString()
                                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                            const holiday = isHoliday(date)
                                                            const prevDate = i > 0 ? new Date(minDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000) : null
                                                            const isMonthChange = prevDate && date.getMonth() !== prevDate.getMonth()

                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`flex-shrink-0 border-r h-full ${isToday ? 'bg-indigo-500/5 border-indigo-500/30' :
                                                                        isMonthChange ? 'border-white/10' :
                                                                            isWeekend ? 'bg-white/[0.02] border-white/5' : 'border-white/5'
                                                                        }`}
                                                                    style={{ width: `${dayWidth}px` }}
                                                                />
                                                            )
                                                        })}
                                                    </div>

                                                    {/* Today Marker Line */}
                                                    {(() => {
                                                        const today = new Date()
                                                        const todayOffset = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth
                                                        if (todayOffset >= 0 && todayOffset <= totalDays * dayWidth) {
                                                            return (
                                                                <div
                                                                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-500/50 pointer-events-none z-10"
                                                                    style={{ left: `${todayOffset + dayWidth / 2}px` }}
                                                                />
                                                            )
                                                        }
                                                        return null
                                                    })()}

                                                    {/* Task & Milestone Rows */}
                                                    {timelineRows.map((row, i) => {
                                                        if (row.type === 'header') {
                                                            return <div key={`header-${row.id}`} className="h-8 border-b border-white/5 bg-white/[0.02]" />
                                                        }

                                                        if (row.type === 'task') {
                                                            const task = row.task
                                                            if (!task.startDate || !task.endDate) return <div key={task.id} className="h-12 border-b border-white/5" />

                                                            const taskStart = new Date(task.startDate)
                                                            const taskEnd = new Date(task.endDate)
                                                            const left = ((taskStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth
                                                            const width = Math.max(((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth, dayWidth)
                                                            const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))
                                                            const taskColor = task.color || '#6366f1'

                                                            return (
                                                                <div key={task.id} className="h-12 border-b border-white/5 relative group">
                                                                    <div
                                                                        id={`task-${task.id}`}
                                                                        className={`absolute top-2.5 h-7 rounded-lg flex items-center px-3 cursor-pointer transition-all shadow-lg ${task.completed ? 'opacity-60' : ''}`}
                                                                        style={{
                                                                            left: `${left}px`,
                                                                            width: `${width}px`,
                                                                            backgroundColor: `${taskColor}80`,
                                                                            borderColor: `${taskColor}cc`,
                                                                            borderWidth: '1px'
                                                                        }}
                                                                        onClick={() => openEditTaskModal(task)}
                                                                    >
                                                                        <span className="text-xs text-white font-medium truncate">{task.text}</span>
                                                                        {/* Tooltip on hover */}
                                                                        <div
                                                                            className={`absolute ${(() => {
                                                                                const taskIndex = i // Use loop index for basic position logic
                                                                                return taskIndex < 3 ? 'top-full mt-2' : 'bottom-full mb-2'
                                                                            })()} left-0 opacity-0 group-hover:opacity-100 transition-opacity z-20`}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <div className="bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 shadow-xl min-w-[200px] max-w-[320px]">
                                                                                <div className="text-sm font-medium text-white mb-1">{task.text}</div>
                                                                                <div className="text-xs text-white/60">
                                                                                    {taskStart.toLocaleDateString('ja-JP')} - {taskEnd.toLocaleDateString('ja-JP')}
                                                                                </div>
                                                                                <div className="text-xs text-white/40 mt-1">期限: {duration}日</div>
                                                                                {task.description && (
                                                                                    <div className="mt-3 pt-3 border-t border-white/10">
                                                                                        <div className="text-xs text-white/70 mb-2 font-medium">細分化タスク:</div>
                                                                                        <div
                                                                                            className="text-xs text-white/60 max-h-48 overflow-y-auto prose prose-invert prose-sm max-w-none"
                                                                                            dangerouslySetInnerHTML={{ __html: task.description }}
                                                                                            onClick={(e) => {
                                                                                                const target = e.target as HTMLElement
                                                                                                if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
                                                                                                    const checkbox = target as HTMLInputElement
                                                                                                    const checkboxes = Array.from(
                                                                                                        e.currentTarget.querySelectorAll('input[type="checkbox"]')
                                                                                                    )
                                                                                                    const index = checkboxes.indexOf(checkbox)
                                                                                                    handleSubtaskToggle(task.id, index, checkbox.checked)
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        if (row.type === 'milestone') {
                                                            const milestone = row.milestone
                                                            const date = new Date(milestone.date)
                                                            const left = ((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth

                                                            return (
                                                                <div key={milestone.id} className="h-12 border-b border-white/5 relative bg-amber-500/5">
                                                                    <div
                                                                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
                                                                        style={{ left: `${left + (dayWidth / 2)}px` }}
                                                                    >
                                                                        <div className="w-4 h-4 rotate-45 bg-amber-400 border-2 border-[#1a1a1a] shadow-lg" />
                                                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] border border-amber-400/30 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl">
                                                                            <div className="font-medium text-amber-200">{milestone.title}</div>
                                                                            <div className="text-white/60 text-[10px] mt-1">{date.toLocaleDateString('ja-JP')}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Template Panels at Bottom */}
                                    <div className="border-t border-white/10">
                                        <WorkflowTemplatesPanel />
                                        <MilestoneTemplatesPanel />
                                    </div>

                                    {/* Bottom Calendar for Easy Drag & Drop */}
                                    <div className="border-t border-white/10 bg-[#1a1a1a] overflow-x-auto">
                                        <div className="flex">
                                            {/* Left spacer to align with sidebar */}
                                            <div className={`${sidebarCollapsed ? 'w-12' : 'w-64'} flex-shrink-0 border-r border-white/10 bg-[#252525] flex items-center justify-center transition-all duration-300`}>
                                                <span className="text-xs text-white/40 font-medium">ドロップゾーン</span>
                                            </div>

                                            {/* Calendar cells */}
                                            <div id="bottom-calendar-scroll-container" className="flex-1 min-w-0 overflow-x-auto bg-[#151515]">
                                                <div className="flex h-16" style={{ width: `${totalDays * dayWidth}px`, minWidth: '100%' }}>
                                                    {Array.from({ length: totalDays }).map((_, i) => {
                                                        const date = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000)
                                                        const isToday = date.toDateString() === new Date().toDateString()
                                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6
                                                        const holiday = isHoliday(date)
                                                        const isFirstOfMonth = date.getDate() === 1

                                                        return (
                                                            <DroppableCell key={i} date={date.toISOString().split('T')[0]} isHoliday={holiday.isHoliday} width={dayWidth} idPrefix="bottom-">
                                                                {isFirstOfMonth && (
                                                                    <div className="absolute -top-1 left-0 right-0 text-center pointer-events-none">
                                                                        <span className="text-[10px] font-bold text-white/80 bg-[#252525] px-1 rounded">
                                                                            {date.getMonth() + 1}月
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <span className={`font-medium ${isToday ? 'text-indigo-300' :
                                                                    holiday.isHoliday ? 'text-red-300' :
                                                                        'text-white/60'
                                                                    }`}>
                                                                    {date.getDate()}
                                                                </span>
                                                                <span className={`text-[10px] ${isToday ? 'text-indigo-400' :
                                                                    holiday.isHoliday ? 'text-red-400' :
                                                                        isWeekend ? 'text-red-400/60' : 'text-white/30'
                                                                    }`}>
                                                                    {holiday.isHoliday ? '祝' : ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]}
                                                                </span>
                                                            </DroppableCell>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Drag Overlay for visual feedback */}
                                    <DragOverlay dropAnimation={defaultDropAnimation}>
                                        {activeDragItem?.type === 'milestone-template' && (
                                            <div className="flex-shrink-0 w-[180px] bg-white/5 border border-amber-400/50 rounded-xl p-3 shadow-2xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Flag className="w-3.5 h-3.5" style={{ color: activeDragItem.template.color }} />
                                                </div>
                                                <h4 className="font-medium text-white text-sm mb-1">{activeDragItem.template.name}</h4>
                                                <p className="text-xs text-white/60 line-clamp-2">{activeDragItem.template.description}</p>
                                            </div>
                                        )}
                                    </DragOverlay>
                                </DndContext>
                            </div>
                        )}
                    </div>
                    {/* Comments Side Panel */}
                    {showComments && (
                        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252525]">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                    共有コメント
                                </h3>
                                <button onClick={() => setShowComments(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {project?.comments && project.comments.length > 0 ? (
                                    project.comments.map(comment => (
                                        <div key={comment.id} className={`p-3 rounded-xl border ${comment.authorName === '管理者'
                                            ? 'bg-indigo-500/10 border-indigo-500/20 ml-4'
                                            : 'bg-white/5 border-white/10 mr-4'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-bold ${comment.authorName === '管理者' ? 'text-indigo-300' : 'text-emerald-300'
                                                    }`}>
                                                    {comment.authorName}
                                                </span>
                                                <span className="text-[10px] text-white/40">
                                                    {new Date(comment.createdAt).toLocaleString('ja-JP')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/80 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white/20 pb-20">
                                        <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm">コメントはまだありません</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-[#252525]">
                                <form onSubmit={handlePostReply}>
                                    <textarea
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        placeholder="返信を入力..."
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 mb-2 h-20 resize-none placeholder:text-white/20"
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReply || !newReply.trim()}
                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-2"
                                        >
                                            {isSubmittingReply ? '送信中...' : (
                                                <>
                                                    <Send className="w-3 h-3" />
                                                    送信
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div >

                {/* Milestone Modal */}
                {
                    showMilestoneModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md relative"
                                >
                                    <h2 className="text-xl font-bold mb-6">
                                        {editingItem ? 'マイルストーンを編集' : '新規マイルストーン'}
                                    </h2>
                                    <form onSubmit={createMilestone} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">タイトル</label>
                                            <input
                                                type="text"
                                                required
                                                value={newMilestone.title}
                                                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">日付</label>
                                            <input
                                                type="date"
                                                required
                                                value={newMilestone.date}
                                                onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setShowMilestoneModal(false)}
                                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
                                            >
                                                {editingItem ? '更新' : '作成'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    )
                }


                {/* Task Modal */}
                {
                    showTaskModal && (
                        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md relative"
                                >

                                    <h2 className="text-xl font-bold mb-6">
                                        {editingItem ? 'タスクを編集' : '新規タスク'}
                                    </h2>
                                    <form onSubmit={createTask} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">タスク内容</label>
                                            <input
                                                type="text"
                                                required
                                                value={newTask.text}
                                                onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">URL</label>
                                            <div className="bg-white/5 border border-white/10 rounded-xl flex items-center px-3">
                                                <LinkIcon className="w-4 h-4 text-white/40 mr-2" />
                                                <input
                                                    type="url"
                                                    value={newTask.url || ""}
                                                    onChange={(e) => setNewTask({ ...newTask, url: e.target.value })}
                                                    placeholder="https://example.com"
                                                    className="w-full bg-transparent border-none h-12 text-white focus:outline-none focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">詳細説明</label>
                                            <TaskDescriptionEditor
                                                content={newTask.description}
                                                onChange={(content) => setNewTask({ ...newTask, description: content })}
                                            />
                                        </div>

                                        {editingItem && editingItem.type === 'task' && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">添付ファイル</label>
                                                <div className="space-y-3">
                                                    {taskAttachments.length > 0 && (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {taskAttachments.map((file) => (
                                                                <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group">
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                                                                            <FileIcon className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-sm font-medium text-white truncate">{file.name}</div>
                                                                            <div className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</div>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={file.url}
                                                                        download
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <FileUploader
                                                            taskId={editingItem.id}
                                                            onUploadComplete={(attachment) => {
                                                                setTaskAttachments([...taskAttachments, attachment])
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">ステータス</label>
                                                <select
                                                    value={newTask.status}
                                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [&>option]:bg-[#1a1a1a]"
                                                >
                                                    <option value="todo">未着手</option>
                                                    <option value="in_progress">進行中</option>
                                                    <option value="done">完了</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">優先度</label>
                                                <select
                                                    value={newTask.priority}
                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [&>option]:bg-[#1a1a1a]"
                                                >
                                                    <option value="high">高</option>
                                                    <option value="medium">中</option>
                                                    <option value="low">低</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/60 mb-2">カラー</label>
                                            <div className="flex gap-2">
                                                {['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#64748b'].map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setNewTask({ ...newTask, color })}
                                                        className={`w-8 h-8 rounded-lg transition-all ${newTask.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a] scale-110' : 'hover:scale-105'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">開始日</label>
                                                <input
                                                    type="date"
                                                    value={newTask.startDate}
                                                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/60 mb-2">終了日</label>
                                                <input
                                                    type="date"
                                                    value={newTask.endDate}
                                                    onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setShowTaskModal(false)}
                                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
                                            >
                                                {editingItem ? '更新' : '作成'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    )
                }

                {/* Delete Confirmation Modal */}
                {
                    deleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
                            >
                                <h2 className="text-xl font-bold mb-4">削除の確認</h2>
                                <p className="text-white/60 mb-6">
                                    {deleteConfirm.type === 'task' ? 'タスク' :
                                        deleteConfirm.type === 'milestone' ? 'マイルストーン' :
                                            'ワークフロー'}「{deleteConfirm.title}」を削除してもよろしいですか？
                                    {deleteConfirm.type === 'workflow' && (
                                        <span className="block mt-2 text-red-400 text-sm">
                                            ※このテンプレートに含まれるすべてのタスクが削除されます。
                                        </span>
                                    )}
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (deleteConfirm.type === 'task') {
                                                handleDeleteTask(deleteConfirm.id)
                                            } else if (deleteConfirm.type === 'milestone') {
                                                handleDeleteMilestone(deleteConfirm.id)
                                            } else if (deleteConfirm.type === 'workflow') {
                                                handleDeleteWorkflow(deleteConfirm.id)
                                                setDeleteConfirm(null)
                                            }
                                        }}
                                        className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
                                    >
                                        削除
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }

                {/* Share Modal */}
                {showShareModal && shareUrl && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-emerald-400" />
                                    プロジェクトを共有
                                </h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            <p className="text-white/60 text-sm mb-4">
                                このリンクを共有すると、誰でもプロジェクトを閲覧できます（編集不可）
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 bg-transparent text-white text-sm outline-none"
                                    />
                                    <button
                                        onClick={copyShareLink}
                                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-emerald-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white"
                                >
                                    閉じる
                                </button>
                                <button
                                    onClick={removeShareLink}
                                    className="flex-1 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 rounded-xl transition-colors text-rose-300"
                                >
                                    共有を解除
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div >
        </DashboardLayout >
    )
}

// Kanban Column Component
function KanbanColumn({ id, title, tasks, openEditTaskModal, setDeleteConfirm, toggleTaskCompletion, handleSubtaskToggle }: {
    id: string
    title: string
    tasks: Task[]
    openEditTaskModal: (task: Task) => void
    setDeleteConfirm: (confirm: { type: 'task' | 'milestone', id: string, title: string }) => void
    toggleTaskCompletion: (task: Task) => void
    handleSubtaskToggle: (taskId: string, checkboxIndex: number, checked: boolean) => void
}) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[320px] bg-white/5 rounded-xl flex flex-col h-full max-h-full border border-white/5">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a1a] z-10 rounded-t-xl">
                <h3 className="font-bold text-white">{title}</h3>
                <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">{tasks.length}</span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {tasks.map((task, index) => (
                    <KanbanTaskCard
                        key={task.id}
                        task={task}
                        isLast={index === tasks.length - 1}
                        openEditTaskModal={openEditTaskModal}
                        setDeleteConfirm={setDeleteConfirm}

                        toggleTaskCompletion={toggleTaskCompletion}
                        handleSubtaskToggle={handleSubtaskToggle}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-8 text-white/20 text-sm border border-white/5 border-dashed rounded-lg">
                        タスクなし
                    </div>
                )}
            </div>
        </div>
    )
}

// Kanban Task Card Component - Using Original Design
function KanbanTaskCard({ task, isLast, openEditTaskModal, setDeleteConfirm, toggleTaskCompletion, handleSubtaskToggle }: {
    task: Task
    isLast?: boolean
    openEditTaskModal: (task: Task) => void
    setDeleteConfirm: (confirm: { type: 'task' | 'milestone' | 'workflow', id: string, title: string }) => void
    toggleTaskCompletion: (task: Task) => void
    handleSubtaskToggle: (taskId: string, checkboxIndex: number, checked: boolean) => void
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task, type: 'task' }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                borderColor: task.color || 'rgba(255,255,255,0.1)'
            }}
            {...listeners}
            {...attributes}
            onClick={() => openEditTaskModal(task)}
            className={`bg-white/5 border rounded-xl p-4 group transition-all hover:bg-white/10 cursor-grab active:cursor-grabbing relative ${isDragging ? 'opacity-50 z-50 ring-2 ring-indigo-500' : ''
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white text-sm line-clamp-2">{task.text}</h4>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div
                        className={`px-2 py-1 rounded text-xs font-medium ${task.status === 'done' ? 'bg-emerald-500/20 text-emerald-300' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-white/10 text-white/60'
                            }`}
                    >
                        {task.status === 'done' ? '完了' :
                            task.status === 'in_progress' ? '進行中' : '未着手'}
                    </div>
                    <div className="flex gap-1 transition-opacity opacity-0 group-hover:opacity-100">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                openEditTaskModal(task)
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5 text-white/60" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm({ type: 'task', id: task.id, title: task.text })
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-white/60 hover:text-red-400 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-white/40">
                {task.startDate && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>開始: {new Date(task.startDate).toLocaleDateString()}</span>
                    </div>
                )}
                {task.endDate && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>終了: {new Date(task.endDate).toLocaleDateString()}</span>
                    </div>
                )}
                {task.attachments && task.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                        <Paperclip className="w-3 h-3" />
                        <span>{task.attachments.length}</span>
                    </div>
                )}
                {task.url && (
                    <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded hover:bg-indigo-400/20 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LinkIcon className="w-3 h-3" />
                    </a>
                )}
            </div>

            {/* Description preview on hover */}
            {task.description && (
                <div className="mt-2 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300">
                    <div className="text-xs text-white/60 bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: task.description }}
                        onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
                                e.stopPropagation() // Prevent card drag/click
                                const checkboxes = Array.from(e.currentTarget.querySelectorAll('input[type="checkbox"]'))
                                const index = checkboxes.indexOf(target as HTMLInputElement)
                                if (index !== -1) {
                                    handleSubtaskToggle(task.id, index, (target as HTMLInputElement).checked)
                                }
                            }
                        }}
                    />
                </div>
            )}

            {/* Approval Status */}
            {task.approvalStatus === 'approved' && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                    <Check className="w-3 h-3" />
                    <span>承認済み</span>
                </div>
            )}
            {task.approvalStatus === 'rejected' && (
                <div className="mt-2 group/rejection relative">
                    <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded w-fit">
                        <X className="w-3 h-3" />
                        <span>却下</span>
                    </div>
                    {task.rejectionReason && (
                        <div className={`absolute ${isLast ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-xs text-white z-50 invisible group-hover/rejection:visible`}>
                            <p className="font-bold mb-0.5 text-red-300">理由:</p>
                            {task.rejectionReason}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


