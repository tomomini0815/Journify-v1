"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, MiniMap, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, BrainCircuit, Lightbulb, ArrowDown, ArrowRight, MousePointerClick, ZoomIn, Save, Check } from 'lucide-react';

// --- Custom Styles for Nodes ---
const nodeStyles = {
    root: {
        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        padding: '20px 40px',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1) inset',
        width: 220,
        textAlign: 'center' as const,
        cursor: 'pointer',
    },
    branch: {
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        color: '#f1f5f9',
        borderRadius: '20px',
        padding: '15px 30px',
        fontSize: '15px',
        fontWeight: '600',
        width: 180,
        textAlign: 'center' as const,
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
    },
    leaf: {
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid #334155',
        color: '#cbd5e1',
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '13px',
        width: 160,
        textAlign: 'center' as const,
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 60;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };

        return newNode;
    });

    return { nodes: newNodes, edges };
};

export default function MindMapViewer({ initialData }: { initialData?: any }) {
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
    const [coaching, setCoaching] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [currentTopic, setCurrentTopic] = useState<string | null>(null);
    const [isCoachingOpen, setIsCoachingOpen] = useState(true);
    const [direction, setDirection] = useState('TB');

    // Save State
    const [isSaving, setIsSaving] = useState(false);
    const [saveTitle, setSaveTitle] = useState("");
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initial load logic
    useEffect(() => {
        if (initialData) {
            console.log("Loading initial data...", initialData);
            const layouted = getLayoutedElements(
                initialData.data.nodes.map((n: any) => ({
                    ...n,
                    data: { label: n.label },
                    style: nodeStyles[n.type as keyof typeof nodeStyles] || nodeStyles.leaf,
                    position: { x: 0, y: 0 }
                })),
                initialData.data.edges.map((e: any) => ({
                    ...e,
                    animated: true,
                    style: { stroke: '#fbbf24' }
                })),
                initialData.direction || 'TB'
            );
            setNodes(layouted.nodes);
            setEdges(layouted.edges);
            setCoaching(initialData.coaching);
            setHasGenerated(true);
            setIsCoachingOpen(true);
        }
    }, [initialData]);

    const handleSave = async () => {
        if (!saveTitle.trim()) {
            alert("タイトルを入力してください");
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch('/api/mindmap/save', {
                method: 'POST',
                body: JSON.stringify({
                    userId: 'demo-user', // Should be dynamic
                    title: saveTitle,
                    nodes: nodes,
                    edges: edges,
                    coaching: coaching
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setShowSaveDialog(false);
            }, 2000);
            alert("保存しました");
        } catch (error) {
            console.error("Save failed", error);
            alert("保存に失敗しました");
        } finally {
            setIsSaving(false);
        }
    };

    // Re-layout when direction changes (if data exists)
    useEffect(() => {
        if (hasGenerated && nodes.length > 0) {
            const layouted = getLayoutedElements(nodes, edges, direction);
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);
        }
    }, [direction, hasGenerated]);

    const toggleDirection = useCallback(() => {
        setDirection(d => d === 'TB' ? 'LR' : 'TB');
    }, []);

    // Helper functions
    const fetchMindMapData = async (focusTopic?: string, intent?: 'expansion' | 'advice') => {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const response = await fetch('/api/analysis/mindmap', {
            method: 'POST',
            body: JSON.stringify({ startDate, endDate, focusTopic, intent }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    };

    // 1. Initial / Reset / Focus (Replace Logic)
    const generateMindMap = async (focusTopic?: string) => {
        console.log(`Generating Mind Map (Reset)... Topic: ${focusTopic || 'General'}`);
        setIsLoading(true);
        setCurrentTopic(focusTopic || null);
        setIsCoachingOpen(false);

        try {
            const data = await fetchMindMapData(focusTopic, 'expansion');

            if (data.nodes && data.edges) {
                const layouted = getLayoutedElements(
                    data.nodes.map((n: any) => ({
                        ...n,
                        data: { label: n.label },
                        style: nodeStyles[n.type as keyof typeof nodeStyles] || nodeStyles.leaf,
                        position: { x: 0, y: 0 }
                    })),
                    data.edges.map((e: any) => ({
                        ...e,
                        animated: true,
                        style: { stroke: '#475569' }
                    })),
                    direction
                );

                setNodes(layouted.nodes);
                setEdges(layouted.edges);
                setCoaching(data.coaching);
                setHasGenerated(true);
                setIsCoachingOpen(true);
            } else {
                console.warn("No nodes/edges in response");
                alert(`データの形式が不正です: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.error("Generator failed", error);
            alert(`生成に失敗しました: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Expand (Append Logic)
    const expandNode = async (node: any) => {
        const topic = node.data.label;
        if (!topic) return;

        console.log(`Expanding Node (Advice): ${topic}`);
        setIsLoading(true);
        // Don't close coaching panel on expand, or maybe minimize it? Let's keep it open or user preference.
        // But we need to show loading.

        try {
            // Request 'advice' intent
            const data = await fetchMindMapData(topic, 'advice');

            if (data.nodes && data.edges) {
                // Generate unique IDs for new nodes to avoid collision
                const timestamp = Date.now();
                const idMap = new Map(); // oldId -> newId

                data.nodes.forEach((n: any) => {
                    idMap.set(n.id, `expand-${timestamp}-${n.id}`);
                });

                // Find the new root (which corresponds to the clicked topic)
                const newRoot = data.nodes.find((n: any) => n.type === 'root');
                const newRootId = newRoot ? idMap.get(newRoot.id) : null;

                // Create new nodes array (excluding the new root visually, or keeping it?)
                // Strategy: Keep the new root, connect CLICKED_NODE -> NEW_ROOT
                // Or: Assume the clicked node IS the root, and connect CLICKED_NODE -> NEW_BRANCHES.

                // Let's connect CLICKED_NODE -> NEW_ROOT to represent the "expansion" clearly.
                // The new root will be "Topic (Detail)" or just "Topic".

                const newNodes = data.nodes.map((n: any) => ({
                    ...n,
                    id: idMap.get(n.id),
                    data: { label: n.label },
                    // Style advice nodes differently? Let's keep them as leaves but maybe distinguish later
                    // Using 'leaf' style which is standard for advice
                    style: nodeStyles[n.type as keyof typeof nodeStyles] || nodeStyles.leaf,
                    position: { x: 0, y: 0 }
                }));

                const newEdges = data.edges.map((e: any) => ({
                    ...e,
                    id: `e-${timestamp}-${e.source}-${e.target}`,
                    source: idMap.get(e.source),
                    target: idMap.get(e.target),
                    animated: true,
                    style: { stroke: '#fbbf24' } // Yellowish stroke for advice edges
                }));

                // Connection edge: Clicked Node -> New Root
                if (newRootId) {
                    const connectionEdge = {
                        id: `connect-${node.id}-${newRootId}`,
                        source: node.id,
                        target: newRootId,
                        animated: true,
                        style: { stroke: '#fbbf24', strokeWidth: 2, strokeDasharray: '5,5' } // Dashed yellow for advice connection
                    };
                    newEdges.push(connectionEdge);
                }

                // Append to existing state
                const allNodes = [...nodes, ...newNodes];
                const allEdges = [...edges, ...newEdges];

                // Re-layout entire graph
                const layouted = getLayoutedElements(allNodes, allEdges, direction);

                setNodes(layouted.nodes);
                setEdges(layouted.edges);
                setCoaching(data.coaching); // Update coaching to focus on the new topic? Yes, likely helpful.
                setIsCoachingOpen(true); // Ensure panel is open to show new advice
            }

        } catch (error) {
            console.error("Expansion failed", error);
            alert(`拡張に失敗しました: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNodeClick = useCallback((event: any, node: any) => {
        // Trigger Expansion
        expandNode(node);
    }, [nodes, edges, direction]); // Deps needed for expandNode closure if use callback, but expandNode uses state setters which are stable. 
    // Ideally expandNode should be useCallback too or just inline. 
    // Using simple reference here.

    const resetView = () => generateMindMap();

    return (
        <div className="w-full h-[calc(100vh-100px)] relative overflow-hidden bg-[#0B1121] rounded-3xl border border-white/5">
            {/* Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={handleNodeClick}
                    fitView
                    attributionPosition="bottom-right"
                    className="bg-[#0B1121]"
                    minZoom={0.1}
                >
                    <Background color="#1e293b" gap={16} />
                    <Controls className="bg-white/10 border border-white/10 text-white" />
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.type === 'root') return '#10b981';
                            if (n.type === 'branch') return '#06b6d4';
                            return '#334155';
                        }}
                        maskColor="rgba(0, 0, 0, 0.7)"
                        className="bg-[#0f172a] border border-white/10 rounded-lg overflow-hidden"
                    />
                </ReactFlow>
            </div>

            {/* Empty State / Start Screen */}
            {!hasGenerated && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0B1121]/80 backdrop-blur-sm p-4">
                    <BrainCircuit className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">AIマインドマップ</h3>
                    <p className="text-white/60 mb-6 text-center max-w-md text-sm">
                        あなたの過去30日間のジャーナルを分析し、<br />
                        思考のつながりを可視化します。
                    </p>
                    <button
                        onClick={() => generateMindMap()}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-2 text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        マップを生成する
                    </button>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#0B1121]/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center bg-[#0f172a] p-6 rounded-2xl border border-white/10 shadow-2xl">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                        <p className="text-white/80 animate-pulse text-sm font-medium">
                            {currentTopic ? `「${currentTopic}」を思考中...` : '思考を分析中...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Top Controls */}
            {hasGenerated && (
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    {/* Reset Button */}
                    <button
                        onClick={resetView}
                        className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-full text-xs backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
                    >
                        <BrainCircuit className="w-3 h-3" />
                        全体に戻す
                    </button>

                    {/* Layout Toggle */}
                    <button
                        onClick={toggleDirection}
                        className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full text-xs backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
                        title="レイアウト切り替え"
                    >
                        {direction === 'TB' ? <ArrowDown className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        <span className="hidden sm:inline">{direction === 'TB' ? '縦配置' : '横配置'}</span>
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={() => setShowSaveDialog(true)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500/80 to-[#0B1121]/80 hover:from-amber-500 hover:to-[#0B1121] text-white rounded-full text-xs backdrop-blur-md border border-amber-500/30 transition-all flex items-center gap-2"
                    >
                        <Save className="w-3 h-3" />
                        保存
                    </button>
                </div>
            )}

            {/* Save Dialog Overlay */}
            {showSaveDialog && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0f172a] border border-amber-500/30 p-6 rounded-2xl w-80 shadow-2xl"
                    >
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Save className="w-4 h-4 text-amber-500" />
                            マップを保存
                        </h3>
                        <input
                            type="text"
                            placeholder="タイトル (例: 1月の振り返り)"
                            value={saveTitle}
                            onChange={(e) => setSaveTitle(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white mb-4 focus:border-amber-500 outline-none"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="px-4 py-2 text-white/50 hover:text-white text-xs"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : saveSuccess ? <Check className="w-3 h-3" /> : null}
                                {saveSuccess ? "保存完了" : "保存する"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Show Coaching Button (Floating) - Updated Theme */}
            {hasGenerated && !isCoachingOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsCoachingOpen(true)}
                    // Gradient: Amber -> Deep Blue Translucent
                    className="absolute bottom-20 right-4 lg:bottom-8 lg:right-8 z-30 p-4 bg-gradient-to-r from-amber-500/90 to-[#0B1121]/90 text-white rounded-full shadow-lg shadow-amber-500/20 hover:scale-110 transition-transform border border-amber-500/20"
                >
                    <Lightbulb className="w-6 h-6" />
                </motion.button>
            )}

            {/* Coaching Panel - Updated Theme */}
            <AnimatePresence>
                {hasGenerated && coaching && isCoachingOpen && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        // Gradient Background for the panel
                        className="absolute bottom-0 left-0 right-0 h-[85vh] lg:h-auto lg:top-4 lg:bottom-4 lg:right-4 lg:left-auto lg:w-96 bg-gradient-to-b from-[#0f172a]/95 to-[#0B1121]/95 backdrop-blur-xl border-t lg:border border-amber-500/20 rounded-t-3xl lg:rounded-2xl shadow-2xl z-40 flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="w-full h-6 flex items-center justify-center lg:hidden pt-2" onClick={() => setIsCoachingOpen(false)}>
                            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-400" />
                                <h2 className="text-lg font-bold text-white">AIコーチング</h2>
                            </div>
                            <button
                                onClick={() => setIsCoachingOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                            >
                                <span className="text-xs">閉じる</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">

                            {/* NEW: Focus/Deep Dive Button - Amber Theme */}
                            {currentTopic && (
                                <button
                                    onClick={() => generateMindMap(currentTopic)}
                                    // Button Theme
                                    className="w-full py-3 bg-gradient-to-r from-amber-500/80 to-[#0B1121]/80 hover:from-amber-600 hover:to-[#0B1121] text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 mb-4 border border-amber-500/20"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                    「{currentTopic}」に集中して深掘りする
                                </button>
                            )}

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h3 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">🔍 分析・観察</h3>
                                <p className="text-white/90 text-sm leading-relaxed">
                                    {coaching.observation}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                                <h3 className="text-xs font-bold text-amber-300 mb-2 uppercase tracking-wider">❓ 問いかけ</h3>
                                <p className="text-white text-base font-medium leading-relaxed italic">
                                    "{coaching.question}"
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h3 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">🚀 アクション</h3>
                                <p className="text-white/90 text-sm leading-relaxed">
                                    {coaching.action}
                                </p>
                            </div>

                            {/* Refresh Advice Button */}
                            <button
                                onClick={() => generateMindMap(currentTopic || undefined)} // Refreshes current view or fetches new advice
                                className="w-full py-3 my-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white/50 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5"
                            >
                                <Sparkles className="w-3 h-3" />
                                アドバイスを更新
                            </button>

                            <div className="h-8 lg:hidden" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
