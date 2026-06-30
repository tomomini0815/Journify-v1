"use client"

import { CSSProperties, Children, ReactElement, ReactNode, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, GripHorizontal, LayoutGrid, RotateCcw, Rows3 } from "lucide-react"
import { cn } from "@/lib/utils"

type DashboardCardSize = "wide" | "large" | "medium" | "featured" | "small"

interface DashboardCardProps {
    id: string
    title: string
    size?: DashboardCardSize
    children: ReactNode
}

interface DashboardCardGridProps {
    initialOrder?: string[]
    children: ReactNode
}

const storageKey = "journify-dashboard-card-order"

// ユーザーの指定した初期レイアウト比率に合わせたグリッドスパン設定
// 12カラムグリッドをベースにします
const cardSpans: Record<string, string> = {
    voice: "col-span-12 lg:col-span-8",       // 1段目左: ジャーナル (約6割)
    summary: "col-span-12 lg:col-span-5",     // 1段目右: 活動サマリー (約4割)
    tasks: "col-span-12 md:col-span-6 lg:col-span-5",       // 2段目左: タスク一覧 (少し広め)
    journals: "col-span-12 md:col-span-6 lg:col-span-4", // 2段目中: 最近の記録
    goals: "col-span-12 md:col-span-6 lg:col-span-4", // 2段目右: 目標の進捗
    charts: "col-span-full",                    // 3段目: チャート (100%幅)
    adventure: "col-span-full",                 // 4段目: ペット&チャレンジ統合 (100%幅)
}

export function DashboardCard({ children }: DashboardCardProps) {
    return <>{children}</>
}

function moveItem(items: string[], activeId: string, overId: string) {
    const oldIndex = items.indexOf(activeId)
    const newIndex = items.indexOf(overId)

    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return items

    const next = [...items]
    const [removed] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, removed)
    return next
}

function normalizeOrder(savedOrder: string[] | undefined, availableIds: string[]) {
    const saved = (savedOrder || []).filter((id) => availableIds.includes(id))
    const missing = availableIds.filter((id) => !saved.includes(id))
    return [...saved, ...missing]
}

function DashboardLayoutControl({
    saveState,
    onReset,
    editMode,
    onToggleEdit,
}: {
    saveState: "idle" | "saving" | "saved" | "error"
    onReset: () => void
    editMode: boolean
    onToggleEdit: () => void
}) {
    const statusLabel = {
        idle: "自動保存",
        saving: "保存中...",
        saved: "保存済み ✓",
        error: "保存失敗",
    }[saveState]

    return (
        <div className="group relative">
            <button
                type="button"
                aria-label="カード配置"
                title="カード配置"
                onClick={onToggleEdit}
                className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border text-white/55 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/20",
                    editMode
                        ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-200 shadow-lg shadow-emerald-500/10"
                        : "border-white/10 bg-white/[0.04] hover:border-emerald-300/30 hover:bg-emerald-400/15 hover:text-emerald-200"
                )}
            >
                <LayoutGrid className="h-4 w-4" />
            </button>

            <div className="invisible absolute right-0 top-full z-50 mt-2 w-80 translate-y-1 rounded-xl border border-white/10 bg-slate-950/95 p-4 text-left opacity-0 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                            <Rows3 className="h-3.5 w-3.5 text-emerald-300" />
                        </div>
                        <p className="text-sm font-semibold text-white">カード配置</p>
                    </div>
                    <span className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors",
                        saveState === "error"
                            ? "border-rose-300/20 bg-rose-400/10 text-rose-200"
                            : saveState === "saving"
                            ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
                            : saveState === "saved"
                            ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.05] text-white/40"
                    )}>
                        {statusLabel}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onToggleEdit}
                    className={cn(
                        "mb-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/20",
                        editMode
                            ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-sm shadow-emerald-500/10"
                            : "border-white/10 bg-white/[0.04] text-white/60 hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-emerald-100"
                    )}
                >
                    <GripHorizontal className="h-4 w-4" />
                    {editMode ? "並べ替えモード ON（クリックでOFF）" : "並べ替えモードをONにする"}
                </button>

                <p className="mb-3 text-xs leading-relaxed text-white/45">
                    {editMode
                        ? "各カードのドラッグハンドルを掴んで、好きな位置に移動できます。"
                        : "上のボタンで並べ替えモードをONにすると、各カードのドラッグハンドルを掴んで並べ替えることができます。"}
                </p>

                <div className="h-px bg-white/[0.06] mb-3" />

                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white/50 transition-all duration-200 hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300/20"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    初期配置に戻す
                </button>
            </div>
        </div>
    )
}

function SortableDashboardCard({
    id,
    title,
    children,
    isDragging,
    isOver,
    editMode,
}: DashboardCardProps & {
    isDragging: boolean
    isOver: boolean
    editMode: boolean
}) {
    const { setNodeRef: setDroppableRef } = useDroppable({ id })
    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({ id })
    const outerRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)

    const setOuterRef = useCallback(
        (node: HTMLDivElement | null) => {
            outerRef.current = node
            setDroppableRef(node)
        },
        [setDroppableRef]
    )

    const setContentRef = useCallback(
        (node: HTMLDivElement | null) => {
            contentRef.current = node
            setDraggableRef(node)
        },
        [setDraggableRef]
    )

    const spanClass = cardSpans[id] || "col-span-12"

    return (
        <div
            ref={setOuterRef}
            data-dashboard-card={id}
            className={cn(
                "relative min-w-0 transition-all duration-300 ease-out",
                spanClass,
                isDragging && "opacity-30 scale-[0.98]",
                isOver && !isDragging && "z-10"
            )}
        >
            {/* Drop target highlight */}
            {isOver && !isDragging && (
                <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-transparent bg-emerald-400/5 transition-all duration-150">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-transparent" />
                </div>
            )}

            <div
                ref={setContentRef}
                style={{ transform: CSS.Translate.toString(transform) }}
                className="group/card relative h-full"
            >
                {/* Drag handle - Only rendered when editMode is active */}
                {editMode && (
                    <button
                        type="button"
                        aria-label={`${title}を並べ替え`}
                        title={`${title}を並べ替え`}
                        className="absolute right-3 top-3 z-30 flex h-9 w-9 cursor-grab items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/45 shadow-lg shadow-black/20 backdrop-blur transition-all duration-200 hover:border-emerald-300/40 hover:bg-emerald-400/20 hover:text-emerald-200 hover:scale-110 active:cursor-grabbing active:scale-95 focus:outline-none focus:border-emerald-300/40 focus:bg-emerald-400/20 focus:text-emerald-200 opacity-60 hover:opacity-100"
                        {...listeners}
                        {...attributes}
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                )}

                {/* Edit mode indicator border */}
                {editMode && (
                    <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-1 ring-emerald-400/15 transition-all duration-300" />
                )}

                {children}
            </div>
        </div>
    )
}

/** Ghost card shown while dragging via DragOverlay */
function DraggingGhostCard({ title }: { title: string }) {
    return (
        <div
            className="relative rounded-2xl border border-emerald-400/30 bg-slate-900/80 backdrop-blur-lg shadow-2xl shadow-black/50 overflow-hidden p-6 min-h-[180px] flex items-center justify-center"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-cyan-400/5 pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/40 pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-200 shadow-lg backdrop-blur">
                <GripVertical className="h-4 w-4" />
                {title}
            </span>
        </div>
    )
}

export function DashboardCardGrid({ initialOrder, children }: DashboardCardGridProps) {
    const cardElements = Children.toArray(children).filter(isValidElement) as ReactElement<DashboardCardProps>[]
    const cardMap = useMemo(() => new Map(cardElements.map((child) => [child.props.id, child])), [cardElements])
    const availableIds = useMemo(() => cardElements.map((child) => child.props.id), [cardElements])
    const defaultOrder = useMemo(() => normalizeOrder(undefined, availableIds), [availableIds])

    const [order, setOrder] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const localOrder = JSON.parse(window.localStorage.getItem(storageKey) || "null")
                if (Array.isArray(localOrder) && localOrder.length > 0) {
                    return normalizeOrder(localOrder, availableIds)
                }
            } catch {
                // Ignore malformed local layout data
            }
        }

        return normalizeOrder(initialOrder, availableIds)
    })
    const [activeId, setActiveId] = useState<string | null>(null)
    const [overId, setOverId] = useState<string | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
    const [headerActionsEl, setHeaderActionsEl] = useState<HTMLElement | null>(null)
    const lastSavedOrderRef = useRef(JSON.stringify(order))
    const saveTimeoutRef = useRef<number | null>(null)
    const idleTimeoutRef = useRef<number | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    )

    useEffect(() => {
        const orderKey = JSON.stringify(order)
        if (lastSavedOrderRef.current === orderKey) {
            return
        }
        lastSavedOrderRef.current = orderKey

        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = window.setTimeout(async () => {
            setSaveState("saving")
            window.localStorage.setItem(storageKey, JSON.stringify(order))

            try {
                const res = await fetch("/api/user/dashboard-layout", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order }),
                })

                if (!res.ok) throw new Error("Failed to save dashboard layout")
                setSaveState("saved")
            } catch (error) {
                console.warn("Dashboard layout saved locally only:", error)
                setSaveState("saved")
            }
            if (idleTimeoutRef.current) {
                window.clearTimeout(idleTimeoutRef.current)
            }
            idleTimeoutRef.current = window.setTimeout(() => setSaveState("idle"), 1800)
        }, 450)

        return () => {
            if (saveTimeoutRef.current) {
                window.clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [order])

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                window.clearTimeout(saveTimeoutRef.current)
            }
            if (idleTimeoutRef.current) {
                window.clearTimeout(idleTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        setHeaderActionsEl(document.getElementById("dashboard-layout-actions"))
    }, [])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id))
    }

    const handleDragOver = (event: DragOverEvent) => {
        const newOverId = event.over?.id ? String(event.over.id) : null
        setOverId(newOverId)

        if (!newOverId) return

        const active = String(event.active.id)
        const over = newOverId
        if (active === over) return

        setOrder((current) => moveItem(current, active, over))
    }

    const handleDragEnd = (_event: DragEndEvent) => {
        setActiveId(null)
        setOverId(null)
    }

    const resetOrder = async () => {
        const nextOrder = defaultOrder
        const orderKey = JSON.stringify(nextOrder)

        if (saveTimeoutRef.current) {
            window.clearTimeout(saveTimeoutRef.current)
        }
        if (idleTimeoutRef.current) {
            window.clearTimeout(idleTimeoutRef.current)
        }

        lastSavedOrderRef.current = orderKey
        setOrder(nextOrder)
        setSaveState("saving")
        window.localStorage.setItem(storageKey, orderKey)

        try {
            const res = await fetch("/api/user/dashboard-layout", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: nextOrder }),
            })

            if (!res.ok) throw new Error("Failed to reset dashboard layout")
            setSaveState("saved")
        } catch (error) {
            console.warn("Dashboard layout reset locally only:", error)
            setSaveState("saved")
        }

        idleTimeoutRef.current = window.setTimeout(() => setSaveState("idle"), 1800)
    }

    const activeChild = activeId ? cardMap.get(activeId) : null

    return (
        <div>
            {headerActionsEl &&
                createPortal(
                    <DashboardLayoutControl
                        saveState={saveState}
                        onReset={resetOrder}
                        editMode={editMode}
                        onToggleEdit={() => setEditMode((v) => !v)}
                    />,
                    headerActionsEl
                )}

            {/* Edit mode banner */}
            {editMode && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-emerald-200/80">
                        <GripHorizontal className="h-4 w-4 text-emerald-300" />
                        <span>並べ替えモード — カードを掴んで移動できます</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="shrink-0 rounded-lg border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/25 focus:outline-none focus:ring-1 focus:ring-emerald-300/30"
                    >
                        完了
                    </button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={() => { setActiveId(null); setOverId(null) }}
            >
                {/* 12カラムのレスポンシブ CSS Grid コンテナに変更 */}
                <div className="grid grid-cols-12 lg:grid-cols-[repeat(13,minmax(0,1fr))] gap-4 items-stretch">
                    {order.map((id) => {
                        const child = cardMap.get(id)
                        if (!child) return null

                        return (
                            <SortableDashboardCard
                                key={id}
                                id={id}
                                title={child.props.title}
                                size={child.props.size}
                                isDragging={activeId === id}
                                isOver={overId === id && activeId !== id}
                                editMode={editMode}
                            >
                                {cloneElement(child).props.children}
                            </SortableDashboardCard>
                        )
                    })}
                </div>

                {/* Drag overlay */}
                <DragOverlay dropAnimation={{
                    duration: 200,
                    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                }}>
                    {activeId && activeChild ? (
                        <DraggingGhostCard
                            title={activeChild.props.title}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
