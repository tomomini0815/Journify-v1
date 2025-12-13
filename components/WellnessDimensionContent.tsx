"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Lightbulb, BarChart3, Target, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { WellnessDimension } from "@/lib/wellnessContent"

interface WellnessDimensionContentProps {
    dimension: WellnessDimension
}

export function WellnessDimensionContent({ dimension }: WellnessDimensionContentProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>("theory")
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    const toggleCheckItem = (item: string) => {
        const newChecked = new Set(checkedItems)
        if (newChecked.has(item)) {
            newChecked.delete(item)
        } else {
            newChecked.add(item)
        }
        setCheckedItems(newChecked)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        ダッシュボードに戻る
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="py-16 px-4"
                style={{
                    background: `linear-gradient(135deg, ${dimension.color}20 0%, transparent 100%)`
                }}
            >
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-6xl mb-4"
                    >
                        {dimension.icon}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                        style={{ color: dimension.color }}
                    >
                        {dimension.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-white/70"
                    >
                        {dimension.description}
                    </motion.p>
                </div>
            </div>

            {/* Content Sections */}
            <div className="max-w-4xl mx-auto px-4 pb-16 space-y-4">
                {/* Theory Section */}
                <Section
                    title="理論"
                    icon={<BookOpen className="w-5 h-5" />}
                    color={dimension.color}
                    isExpanded={expandedSection === "theory"}
                    onToggle={() => toggleSection("theory")}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white font-semibold mb-2">この指標とは</h4>
                            <p className="text-white/70 leading-relaxed">{dimension.theory.what}</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-2">なぜ重要なのか</h4>
                            <p className="text-white/70 leading-relaxed">{dimension.theory.why}</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">科学的根拠</h4>
                            <ul className="space-y-2">
                                {dimension.theory.science.map((fact, index) => (
                                    <li key={index} className="flex gap-3 text-white/70">
                                        <span className="text-lg" style={{ color: dimension.color }}>•</span>
                                        <span className="leading-relaxed">{fact}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* Practice Section */}
                <Section
                    title="実践"
                    icon={<Lightbulb className="w-5 h-5" />}
                    color={dimension.color}
                    isExpanded={expandedSection === "practice"}
                    onToggle={() => toggleSection("practice")}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white font-semibold mb-3">改善方法</h4>
                            <ul className="space-y-2">
                                {dimension.practice.methods.map((method, index) => (
                                    <li key={index} className="flex gap-3 text-white/70">
                                        <span className="text-lg" style={{ color: dimension.color }}>✓</span>
                                        <span className="leading-relaxed">{method}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">日常の習慣</h4>
                            <ul className="space-y-2">
                                {dimension.practice.habits.map((habit, index) => (
                                    <li key={index} className="flex gap-3 text-white/70">
                                        <span className="text-lg" style={{ color: dimension.color }}>→</span>
                                        <span className="leading-relaxed">{habit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">毎日のチェックリスト</h4>
                            <div className="space-y-2">
                                {dimension.practice.checklist.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => toggleCheckItem(item)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                                    >
                                        <CheckCircle2
                                            className={`w-5 h-5 flex-shrink-0 ${checkedItems.has(item) ? 'fill-current' : ''
                                                }`}
                                            style={{ color: checkedItems.has(item) ? dimension.color : '#ffffff40' }}
                                        />
                                        <span className={`leading-relaxed ${checkedItems.has(item) ? 'text-white/90' : 'text-white/60'
                                            }`}>
                                            {item}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Measurement Section */}
                <Section
                    title="測定"
                    icon={<BarChart3 className="w-5 h-5" />}
                    color={dimension.color}
                    isExpanded={expandedSection === "measurement"}
                    onToggle={() => toggleSection("measurement")}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white font-semibold mb-3">測定指標</h4>
                            <ul className="space-y-2">
                                {dimension.measurement.indicators.map((indicator, index) => (
                                    <li key={index} className="flex gap-3 text-white/70">
                                        <span className="text-lg" style={{ color: dimension.color }}>📊</span>
                                        <span className="leading-relaxed">{indicator}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-3">目標例</h4>
                            <ul className="space-y-2">
                                {dimension.measurement.goals.map((goal, index) => (
                                    <li key={index} className="flex gap-3 text-white/70">
                                        <span className="text-lg" style={{ color: dimension.color }}>🎯</span>
                                        <span className="leading-relaxed">{goal}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* Action Plan Section */}
                <Section
                    title="アクションプラン"
                    icon={<Target className="w-5 h-5" />}
                    color={dimension.color}
                    isExpanded={expandedSection === "action"}
                    onToggle={() => toggleSection("action")}
                >
                    <div className="grid md:grid-cols-3 gap-6">
                        <ActionCard
                            title="今日から"
                            items={dimension.actionPlan.today}
                            color={dimension.color}
                        />
                        <ActionCard
                            title="1週間プラン"
                            items={dimension.actionPlan.week}
                            color={dimension.color}
                        />
                        <ActionCard
                            title="1ヶ月プラン"
                            items={dimension.actionPlan.month}
                            color={dimension.color}
                        />
                    </div>
                </Section>
            </div>
        </div>
    )
}

interface SectionProps {
    title: string
    icon: React.ReactNode
    color: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
}

function Section({ title, icon, color, isExpanded, onToggle, children }: SectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${color}20` }}
                    >
                        <div style={{ color }}>{icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                )}
            </button>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                >
                    {children}
                </motion.div>
            )}
        </motion.div>
    )
}

interface ActionCardProps {
    title: string
    items: string[]
    color: string
}

function ActionCard({ title, items, color }: ActionCardProps) {
    return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h5 className="font-semibold text-white mb-3" style={{ color }}>{title}</h5>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex gap-2 text-sm text-white/70">
                        <span style={{ color }}>•</span>
                        <span className="leading-relaxed">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
